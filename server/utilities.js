
const pool = require('./database/db');
const snowflake = require('snowflake-sdk');
const redText = "\x1b[31m%s\x1b[0m";
const greenText = "\x1b[32m%s\x1b[0m";
const yellowText = "\x1b[33m%s\x1b[0m";
const { DateTime } = require('luxon');
const keys = require("./keys");
const {
    CreateScheduleCommand,
    DeleteScheduleCommand,
    FlexibleTimeWindowMode,
    ListSchedulesCommand,
    SchedulerClient,
} = require("@aws-sdk/client-scheduler");
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
const credentials = {
    region: keys.awsRegion,
    credentials: {
        accessKeyId: keys.awsAccessKeyId,
        secretAccessKey: keys.awsSecretAccessKey,
    },
};

// Lambda function
const invokeLambda = async (credentials, function_name, payload) => {
    const client = new LambdaClient(credentials);
    const command = new InvokeCommand({
      FunctionName: function_name,
      Payload: payload,
      LogType: "Tail",
    });
    try {
      console.info(`Invoking '${function_name}' function ...`);
      const { Payload} = await client.send(command);
      const response = Payload;
      const buffer = Buffer.from(Object.values(response));
      const decodedString = buffer.toString('utf8');
      const result = JSON.parse(decodedString);
      console.info(result);
    } catch (error) {
      console.error("Error invoking Lambda function:",error);
      throw new Error("Invoking Lambda function fail!");
    }
  };

// check if there isn't null value inside the object
function areAllStringsDefined(obj) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (typeof value === 'string' && value.trim() === '') {
                return false;
            }
        }
    }
    return true;
}

// execute query for snowflake connection
async function executeQuery(conn, query) {
    return new Promise((resolve, reject) => {
        conn.execute({
            sqlText: query,
            complete: function (err, stmt, rows) {
                if (err) {
                    console.log("Error: ", query, "\n", err)
                    reject(err);
                } else {
                    resolve(rows);
                }
            }
        });
    });
}

// check snowflake connection with credentials
async function checkSnowflakeConnection(account, username, password, warehouse, userRole) {
    const connection = snowflake.createConnection({ account, username, password });

    return new Promise((resolve, reject) => {
        connection.connect(async (err, conn) => {
            if (err) {
                reject({ success: false, message: 'Connection failed.' })
            } else {
                console.log('[CHECK] Connection successful');
                await executeQuery(connection, `USE ROLE ${userRole}`)
                    .then(async () => {
                        console.log(`[CHECK] Set Role as ${userRole}`)
                        await executeQuery(connection, `USE WAREHOUSE ${warehouse}`)
                            .then(async () => {
                                console.log(`[CHECK] Warehouse set to ${warehouse}`);
                                resolve({ success: true })
                            })
                            .catch((err) => reject({ success: false, message: `Warehouse doesn't exist.` }))
                    })
                    .catch((err) => reject({ success: false, message: `User role doesn't work.` }))
            }
        })
    }).finally(() => {
        console.log('Destroying connection');
        connection.destroy();
    });
}

// sync snowflake connection for only flag is true
async function syncSnowflakeConnectionByFlag(account, username, password, warehouse, lastSyncTime, connectionId, accountId, userRole) {
    const connection = snowflake.createConnection({ account, username, password });
    const warehouseName = warehouse
    try {
        await new Promise((resolve, reject) => {
            connection.connect((err, conn) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Connection successful');
                    resolve(conn);
                }
            });
        });

        await executeQuery(connection, `USE ROLE ${userRole}`)
            .then(() => console.log(`SET ROLE AS ${userRole}`))
            .catch((err) => { })

        await executeQuery(connection, `USE WAREHOUSE ${warehouseName}`)
            .catch((err) => { })
        console.log(`SET WAREHOUSE TO ${warehouseName}`);

        const databases = await executeQuery(connection, 'SHOW DATABASES')
            .catch((err) => { })

        //UPDATE ACCT_DATABASE
        let queryValues = ''
        let query
        const skipDatabasesResult = await pool.query(`SELECT database_name, database_id
                                                      FROM metadata.acct_database
                                                      WHERE connection_id = '${connectionId}'
                                                      AND is_included_in_sync = 'false'`)
        const skipDatabases = skipDatabasesResult.rows
        const skipSchemasResult = await pool.query(`SELECT s.schema_name, d.database_name
                                                    FROM metadata.acct_schema AS s
                                                    JOIN metadata.acct_database AS d
                                                    ON s.database_id = d.database_id
                                                    WHERE s.is_included_in_sync = 'false';`)
        const skipSchemas = skipSchemasResult.rows

        databases?.forEach((database) => {
            if (database.name === 'SNOWFLAKE' || database.name === 'SNOWFLAKE_SAMPLE_DATA') {
                console.log(' SKIP as DABASE.NAME =', database.name)
                return
            }

            if (skipDatabases?.some(db => db.database_name === database.name)) {
                console.log(' SKIP as DABASE.NAME =', database.name, ' because the flag is FALSE')
                return
            }
            console.log("WORKING--------------", database.name)
            queryValues += `(DEFAULT, '${database.name}', '${database?.created_on?.toISOString()}'::timestamp with time zone, ${connectionId}, ${accountId}, DEFAULT), `
        })

        if (queryValues) {
            query = `INSERT INTO metadata.acct_database
                     (database_id, database_name, database_created_on, connection_id, account_id, created_on_utc)
                     VALUES ${queryValues.slice(0, -2)}
                     ON CONFLICT DO NOTHING;`
            await pool.query(query)
                .catch((err) => console.log(err))
            console.log('Updated metadata.acct_database')
        }
        else console.log('Nothing to update on metadata.acct_database')

        console.log("----------------------------------------------------------------EACH DATABASE")

        for (const database of databases) {
            if (database.name === 'SNOWFLAKE' || database.name === 'SNOWFLAKE_SAMPLE_DATA') {
                console.log(' SKIP as DABASE.NAME =', database.name)
                continue
            }

            if (skipDatabases?.some(db => db.database_name === database.name)) {
                console.log(' SKIP as DABASE.NAME =', database.name, ' because the flag is FALSE')
                continue
            }

            await executeQuery(connection, `USE ${database.name}`);
            console.log("+ Database :", database.name)

            //CHECK UPDATED SCHEMA FOR ONE DATABASE
            let query = `SELECT * FROM ${database.name}.INFORMATION_SCHEMA.SCHEMATA WHERE LAST_ALTERED > '${lastSyncTime}'`;
            const updatedSchemas = await executeQuery(connection, query)
                .catch((err) => { })

            //UPDATE ACCT_SCHEMA
            let queryValues = ''
            for(const schema of updatedSchemas) {
                console.log("+ -- Schema :", schema.SCHEMA_NAME)

                if (skipSchemas?.some(sc => sc.schema_name === schema.SCHEMA_NAME && sc.database_name === database.name)) {
                    console.log(' SKIP as SCHEMA.NAME =', schema.SCHEMA_NAME, ' because the flag is FALSE')
                    return
                }

                if (schema.SCHEMA_NAME === 'INFORMATION_SCHEMA') console.log("---------------INFORMATION_SCHEMA: ", schema.CATALOG_NAME, schema.SCHEMA_NAME, schema?.CREATED?.toISOString())
                queryValues += `(
                    DEFAULT,
                    '${schema.SCHEMA_NAME}',
                    '${schema?.CREATED?.toISOString()}'::timestamp with time zone,
                    (SELECT database_id
                     FROM metadata.acct_database
                     WHERE database_name = '${schema.CATALOG_NAME}'
                     AND connection_id = '${connectionId}'
                     AND account_id = '${accountId}'
                     AND is_included_in_sync = true),
                    ${accountId},
                    DEFAULT
                ), `
            }
            if (queryValues) {
                query = `INSERT INTO metadata.acct_schema
                         (schema_id, schema_name, schema_created_on, database_id, account_id, created_on_utc)
                         VALUES ${queryValues.slice(0, -2)}
                         ON CONFLICT (schema_name, database_id) DO NOTHING;`

                await pool.query(query)
                    .catch((err) => console.log(err))
            }
            else console.log('Nothing to update on metadata.acct_schema')

            //UPDATE TABLES
            query = `SELECT * FROM ${database.name}.INFORMATION_SCHEMA.TABLES WHERE LAST_ALTERED > '${lastSyncTime}'`;
            const updatedTables = await executeQuery(connection, query)
                .catch((err) => { })

            queryValues = ''
            let stagingQueryValues = ''
            for (const updatedTable of updatedTables) {
                console.log("+ -- -- Table :", updatedTable?.TABLE_NAME)
                stagingQueryValues += `(
                        '${updatedTable?.TABLE_NAME}',
                        '${updatedTable?.TABLE_TYPE}',
                        '${updatedTable?.CREATED?.toISOString()}'::timestamp with time zone,
                        '${updatedTable?.LAST_ALTERED?.toISOString()}'::timestamp with time zone,
                        (SELECT schema_id 
                         FROM metadata.acct_schema s
                         JOIN metadata.acct_database d 
                         ON (s.database_id = d.database_id)
                         WHERE d.database_name = '${updatedTable.TABLE_CATALOG}' 
                         AND d.connection_id   = '${connectionId}' 
                         AND d.account_id      = '${accountId}'  
                         AND s.is_included_in_sync IS TRUE
                         AND s.schema_name     = '${updatedTable?.TABLE_SCHEMA}'
                        ),
                        ${accountId},
                        CURRENT_DATE,
                        DEFAULT
                    ), `
            }
            if (stagingQueryValues) {
                query = `INSERT INTO staging.acct_table
                (table_name, table_type, table_created_on, table_last_upd, schema_id, account_id, calendar_date, created_on_utc)
                VALUES ${stagingQueryValues.slice(0, -2)};`

                // console.log("query", query)
                await pool.query(query)
                    .catch((err) => console.log(err))
                console.log('Updated staging.acct_table')

                await pool.query(`SELECT * FROM metadata.app_merge_acct_table(${connectionId})`)
                    .catch((err) => console.log(err))
                console.log('Merged staging.acct_table to metadata.acct_table')
            }
            else {
                console.log('No re-created tables')
            }

            // Insert or update columns
            query = `SELECT 
                    t.TABLE_CATALOG, 
                    t.TABLE_SCHEMA, 
                    t.TABLE_NAME, 
                    c.COLUMN_NAME, 
                    c.ORDINAL_POSITION, 
                    c.DATA_TYPE
                FROM 
                    ${database.name}.INFORMATION_SCHEMA.TABLES AS t
                INNER JOIN 
                    ${database.name}.INFORMATION_SCHEMA.COLUMNS AS c 
                    ON t.TABLE_SCHEMA = c.TABLE_SCHEMA AND t.TABLE_NAME = c.TABLE_NAME
                WHERE 
                    t.LAST_ALTERED > '${lastSyncTime}';`
            const updatedColumns = await executeQuery(connection, query)
                .catch((err) => { })

            queryValues = ''
            for(const updatedColumn of updatedColumns) {
                console.log("+ -- -- -- Column :", updatedColumn.TABLE_CATALOG, updatedColumn.TABLE_SCHEMA, updatedColumn.TABLE_NAME, updatedColumn.COLUMN_NAME)
                queryValues += `(
                    DEFAULT,
                    '${updatedColumn?.COLUMN_NAME}',
                    '${updatedColumn?.ORDINAL_POSITION}',
                    '${updatedColumn?.DATA_TYPE}',
                    (SELECT table_id FROM metadata.acct_table WHERE schema_id =
                    (SELECT schema_id FROM metadata.acct_schema WHERE database_id = 
                    (SELECT database_id FROM metadata.acct_database WHERE database_name = '${updatedColumn.TABLE_CATALOG}' AND connection_id = '${connectionId}' AND account_id = '${accountId}')
                    AND schema_name = '${updatedColumn?.TABLE_SCHEMA}' LIMIT 1)
                    AND table_name = '${updatedColumn?.TABLE_NAME}'),
                    ${accountId},
                    DEFAULT
                ), `
            }

            if (queryValues) {
                query = `INSERT INTO metadata.acct_table_column
                         (column_id, column_name, ordinal_position, data_type, table_id, account_id, created_on_utc)
                         VALUES ${queryValues.slice(0, -2)}
                         ON CONFLICT DO NOTHING;`

                await pool.query(query)
                    .catch((err) => console.log(err))
                console.log('Added metadata.acct_table_column')
            }
            else {
                console.log('Nothing to add on metadata.acct_table_column')
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        connection.destroy();
    }
}

async function deleteByConnectionId(connectionId) {
    let connectionName = '';
    let accountId;
    let connection_combined_Id = '';
    try {
        const result = await pool.query(
            `SELECT connection_name, account_id FROM metadata.acct_connection WHERE connection_id=$1`,
            [connectionId]
        );
        connectionName = result.rows[0].connection_name;
        accountId = result.rows[0].account_id;
        } catch (error) {
        console.error('connectionName fetch error:', error.message);
    }
    connection_combined_Id = `${connectionId}-${connectionName}`;

    try {
        const result = await pool.query(
            `SELECT * FROM metadata.app_acct_delete_connection($1,$2)`,
            [accountId, connectionId]
        );
        deleteSchedule(connection_combined_Id);
    }catch (error) {
        console.error('Error:', error.message);
    }
}

async function run_lambda(connection_id) {
    try {
        // Invoking lambda function
        const credential = {
            region: keys.awsRegion,
            credentials: {
              accessKeyId: keys.awsAccessKeyId,
              secretAccessKey: keys.awsSecretAccessKey,
            },
          };
      
        const function_name = "ko-hub-js";
        const payload = JSON.stringify({
            "connection_id": connection_id,
            "db_params": {
                "host": keys.pgHost,
                "database": keys.pgDatabase,
                "user": keys.pgUser,
                "password": keys.pgPassword,
            },
        });
        console.log(yellowText, "START run lambda!");
        await invokeLambda(credential, function_name, payload);
        console.log(yellowText, "Success run lambda!");
    }
    catch (err) {
        console.log(err)
        throw err;
    }
}

function setConnectionListeningData(data) {
    connectionListeningData = [...data]
}

// Scheduler functions---------

const convertTimezone=(inputTime, inputTimezone)=> {
    const parsedTime = DateTime.fromFormat(inputTime, "HH:mm", {
      zone: inputTimezone,
    });
    const utcTime = parsedTime.toUTC();
    const formattedUtcTime = utcTime.toFormat("HH:mm");
    return formattedUtcTime;
  }
  const ebc = new SchedulerClient(credentials)
  
  // Method for create schedule
  const createSchedule = async (
    connection_combined_Id,
    sync_schedule_time,
    sync_schedule_tz
  ) => {
    const dayOfMonth = "*";
    const month = "*";
    const dayOfWeek = "?";
    const year = "*";
  
    const time_UTC=convertTimezone(sync_schedule_time, sync_schedule_tz);
    const [hour, minute] = time_UTC.split(":");
    let cronExpression = `cron(${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek} ${year})`;

    const temp = connection_combined_Id.split("-");
    const connection_id = parseInt(temp[0]);    
    const cmd_json = {
      Name: connection_combined_Id,
      GroupName: "default",
      ScheduleExpression: cronExpression,
      FlexibleTimeWindow: { Mode: FlexibleTimeWindowMode.OFF },
      Target: {
        Arn: keys.awsLambdaArn,
        RoleArn:keys.awsLambdaRoleArn,
        Input: JSON.stringify({
          connection_id: connection_id,
        }),
      },
    };
    const command = new CreateScheduleCommand(cmd_json);
    try {
      const response = await ebc.send(command);
      console.log("Schedule create success!");
      return cmd_json;
    } catch (error) {
        console.error("Scheudle not created!", error);
      throw new Error("Schedule create failed");
    }
  };
  
  // Method for update schedule
  const updateSchedule = async (
    connection_id,
    sync_schedule_time,
    sync_schedule_tz
  ) => {
    try {
      await deleteSchedule(connection_id);
      await createSchedule(connection_id, sync_schedule_time, sync_schedule_tz);
    } catch (error) {
      console.error("Error updating schedule:", error);
      throw new Error("Error updating schedule");
    }
  };
  
  // Method for delete schedule
  const deleteSchedule = async (connection_id) => {
    const deleteCommand = new DeleteScheduleCommand({
      Name: connection_id,
    });
    try {
      const response = await ebc.send(deleteCommand);
      return true;
    } catch (error) {
      console.error("Error deleting schedule:", error);
      throw new Error("Error deleting schedule");
    }
  };
  
  // Method for fetch schedule lists
  const listSchedules = async () => {
    const input = {
      GroupName: "default",
      State: "ENABLED",
    };
    const listCommand = new ListSchedulesCommand(input);
  
    try {
      const response = await ebc.send(listCommand);
      const schedules = response.Schedules || [];
      console.log("List of Schedules:", schedules);
      return schedules;
    } catch (error) {
      console.error("Error listing schedules:", error);
      throw error;
    }
  };
  
  // Method for fetch schedule by Id
  const fetchSchedule = async (connection_id) => {
    const command = new ListSchedulesCommand({});
  
    try {
      const response = await ebc.send(command);
      const connectionIdString = connection_id.toString();
      const matchingSchedule = response.Schedules.find(
        (schedule) => schedule.Name === connectionIdString
      );
  
      if (matchingSchedule) {
        console.log(matchingSchedule);
        return matchingSchedule;
      } else {
        console.log("Schedule not found for connection_id:", connection_id);
        return null;
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };
  
module.exports = {
    syncSnowflakeConnectionByFlag,
    checkSnowflakeConnection,
    executeQuery,
    areAllStringsDefined,
    deleteByConnectionId,
    setConnectionListeningData,
    createSchedule,
    updateSchedule,
    run_lambda
};
