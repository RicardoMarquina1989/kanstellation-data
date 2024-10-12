
const {
  syncSnowflakeConnectionByFlag,
  areAllStringsDefined,
  checkSnowflakeConnection,
  deleteByConnectionId,
  createSchedule,
  updateSchedule,
  run_lambda
} = require('../utilities');
const express = require('express');
const pool = require('../database/db');
const router = express.Router();
const yellowText = "\x1b[33m%s\x1b[0m";
const CryptoJS = require('crypto-js');
const keys = require("../keys")
const demoModeMiddleware = require("../middlewares/demo-mode-middleware");
const {
  retrieveSecrets,
  storeSecret,
  retrieveEncryptionKey,
  encrypt, decrypt
} =require('../libAWS')

// CREATE a new connection

router.route('/create-connection').post(demoModeMiddleware, async (req, res) => {
  const connection = req.body;
  try {
      
      // check valid connection data
      if (!areAllStringsDefined(connection)) {
          console.log("Invalid Connection");
          return res.json({ success: false, message: "Invalid Connection" });
      }
      
      // Check the same account existing in the database
      const findResult = await pool.query(`SELECT * FROM metadata.acct_connection WHERE account_name = '${connection.accountName}' AND account_id = '${connection.accountId}'`);
      
      if (findResult.rows.length > 0) {
          console.log("Already existing connection account name");
          return res.json({ success: false, message: "Already existing account name" });
      }

      // Retrieve connection password
      const encryptionKey=await retrieveEncryptionKey();
      const encryptedPassword = encrypt(connection.password, encryptionKey);
      
      try {
          await pool.query(`INSERT INTO metadata.acct_connection
                        (connection_name, connection_type, account_name, user_name, password, sf_warehouse, account_id, user_role)
                        VALUES ('${connection.connectionName}',
                                '${connection.connectionType}',
                                '${connection.accountName}',
                                '${connection.userName}',
                                '${encryptedPassword}',
                                '${connection.warehouseName}',
                                 ${connection.accountId},
                                '${connection.userRole}')`)
          console.log("Insert connection into db SUCCESS!")
      } catch(error) {
          console.error("Insert connection into db ERROR!", error);
          throw new Error("InsertConnectionError");
      }
      
      // Fetch connection id
      let connection_id = '';
      try {
          const result = await pool.query(
            `SELECT connection_id FROM metadata.acct_connection WHERE connection_name=$1`,
            [connection.connectionName]
          );
          connection_id = result.rows[0].connection_id;
        } catch (error) {
          console.error('Fetch connectionId FAILD!', error.message);
          throw new Error("FetchConnectionIdError");
      }
      const connection_combined_Id = `${connection_id}-${connection.connectionName}`;
      // Create AWS Eventbridge Schedule  
      try {
          await createSchedule(connection_combined_Id, "07:00", "EST");
      } catch (error) {
          console.error('CreateSchedule Error: ', error.message);
          try {
              await pool.query( `SELECT * FROM metadata.app_acct_delete_connection($1,$2)`, [connection.accountId, connection_id]);
          }catch (error) {
              console.error('Rollback connection insert FAILD! Connection not deleted!', error.message);
          }
          throw new Error("CreateScheduleError");
      }
      
      try {
          run_lambda(connection_id);
      } catch (error) {
          console.error(`Running L-function for connection=${connection_id} Error: ${{error}}`);
          throw new Error("L-function Error");
      }
      
      // sync upto schema
      try {
          await pool.query(`SELECT * FROM metadata.acct_connection WHERE connection_name = '${connection.connectionName}' AND account_id = '${connection.accountId}'`)
          .then(async (response) => {
              const row = response.rows[0]
              console.log("row.last_sync_ts", row.last_sync_ts)
              return res.json({ success: true, connectionId: row.connection_id });
          })
      } catch(error) {
          console.error("Sync schema FAILD", error);
          throw new Error("SyncSchemaError");
      }
  } catch (error) {
      const connnetionIds = await pool.query(`SELECT connection_id FROM metadata.acct_connection WHERE connection_name = '${connection.connectionName}' AND account_id = '${connection.accountId}'`)
      if (connnetionIds.rows[0]) await deleteByConnectionId(connnetionIds.rows[0].connection_id)

      console.log("Erorr: Already existing Connection.")
      return res.json({ success: false, message: "Already existing Connection." });
  }
});

// CHECK if a connection is valid
router.route('/check-connection').post(demoModeMiddleware, async (req, res, next) => {
  try {
      const { accountName, userName, password, warehouseName, userRole } = req.body;
      console.info("Connection check START ...");
      await checkSnowflakeConnection(accountName, userName, password, warehouseName, userRole);
      console.info("Connection check SUCCESS!");
      res.json({ success: true });
  } catch (error) {
      console.error("Connection check FAILD!", error);
      res.json({ success: false, message: error.message });
  }
});

// GET all connections for accountId 
router.route('/all-connections/:id').get( async (req, res, next) => {
  try {
      const accountId = req.params.id;

      if (!accountId) {
          return res.json({ success: false, message: 'Invalid Account ID' });
      }

      const result = await pool.query(`SELECT * FROM metadata.acct_connection WHERE account_id = '${accountId}' ORDER BY connection_id`);

      const timezones = await pool.query(
        `select * from setup.timezone`
      );

      res.json({
        success: true,
        data: result.rows,
        timezones: timezones.rows,
        message: "Fetch all connections SUCCESS!"
      });

  } catch (error) {
      console.error(error.message);
      res.json({ success: false, message: error.message });
  }
});

// GET connection detail for connectionId
router.route('/connection-detail/:id').get( async (req, res, next) => {
  try {
      const connectionId = req.params.id;
      console.log("connection-detail", connectionId)
      if (!connectionId) {
          return res.json({ success: false, message: 'Invalid Connection ID' });
      }
      const databaseResult = await pool.query(`SELECT database_id, database_name, is_included_in_sync FROM metadata.acct_database WHERE connection_id = '${connectionId}'`);

      // database + schema tree-structure
      const data = []
      for (const database of databaseResult.rows) {
          const schemaResult = await pool.query(`SELECT schema_id, schema_name, is_included_in_sync, database_id FROM metadata.acct_schema WHERE database_id = '${database.database_id}'`)
          data.push({ ...database, schema: schemaResult.rows })
      }
      console.log("Got all connection details.")
      res.json({ success: true, data: data });
  } catch (error) {
      console.error(error.message);
      res.json({ success: false, message: error.message });
  }
});

// UPDATE connection
router.route('/update-connection').post(demoModeMiddleware, async (req, res, next) => {
  const connection = req.body;
  console.log("Update", connection)
  const connectionId = connection.connectionId
  try {
      if (!areAllStringsDefined(connection)) {
          console.log("Invalid Connection");
          return res.json({ success: false, message: "Invalid Connection" });
      }

      const findResult = await pool.query(`SELECT *
                                           FROM metadata.acct_connection
                                           WHERE connection_name = '${connection.connectionName}'
                                           AND account_id = '${connection.accountId}'
                                           AND connection_id <> ${connectionId}`);               //except itself

      if (findResult.rows.length > 0) {
          console.log("Already existing connection name");
          return res.json({ success: false, message: "Already existing connection name" });
      }

      const encryptedPassword = CryptoJS.AES.encrypt(connection.password, keys.encryptKey).toString()
      await pool.query(`UPDATE metadata.acct_connection
                        SET
                          connection_name = '${connection.connectionName}',
                          connection_type = '${connection.connectionType}',
                          account_name = '${connection.accountName}',
                          user_name = '${connection.userName}',
                          password = decode('${encryptedPassword}', 'base64'),
                          sf_warehouse = '${connection.warehouseName}',
                          account_id = ${connection.accountId},
                          user_role = '${connection.userRole}'
                        WHERE connection_id = ${connectionId};`)
      // sync
      await pool.query(`SELECT *, encode(password::bytea, 'base64') AS encoded_password
                        FROM metadata.acct_connection WHERE connection_name = '${connection.connectionName}' AND account_id = '${connection.accountId}'`)
          .then(async (response) => {
              const row = response.rows[0]
              const last_sync_ts = row?.last_sync_ts?.toISOString() ?? '1970-01-01T00:00:00.000Z';
             
              const decryptedPassword = CryptoJS.AES.decrypt(row?.password, keys.encryptKey).toString(CryptoJS.enc.Utf8)
              await syncSnowflakeConnectionByFlag(row?.account_name, row?.user_name, decryptedPassword, row?.sf_warehouse, last_sync_ts, row?.connection_id, row?.account_id)
                  .then(async () => {
                      await pool.query(`UPDATE metadata.acct_connection SET last_sync_ts = CURRENT_TIMESTAMP WHERE connection_id = '${row?.connection_id}'`)
                          .then(async () => {
                             
                              console.log('UPDATED last_sync_ts of metadata.acct_connetion')
                              await deleteByConnectionId(connectionId)
                                  .catch(() => { })
                              console.log("Updated a connection.")
                              return res.json({ success: true });
                          })
                          
                  })
              console.log("Updated a connection.")
              return res.json({ success: true });
          })
  } catch (error) {
      console.error(error);
      const connnetionIds = await pool.query(`SELECT connection_id FROM metadata.acct_connection WHERE connection_name = '${connection.connectionName}' AND account_id = '${connection.accountId}'`)
      await deleteByConnectionId(connnetionIds.rows[0].connection_id)
      res.json({ success: false, message: error.message });
  }
});

// UPDATE sync data including sync time
router.route('/update-sync').post(demoModeMiddleware, async (req, res, next) => {
  const { connectionDetailEdited, syncTimeData, connection_id } = req.body;
  let connectionName = '';
  let connection_combined_Id = '';
  try {
      const result = await pool.query(
          `SELECT connection_name FROM metadata.acct_connection WHERE connection_id=$1`,
          [connection_id]
      );
      connectionName = result.rows[0].connection_name;
      } catch (error) {
      console.error('connectionName fetch error:', error.message);
  }
  connection_combined_Id = `${connection_id}-${connectionName}`;
  console.log("update-sync", connectionDetailEdited, syncTimeData, connection_id)
  try {
      // update sync time
      await pool.query(`UPDATE metadata.acct_connection
                        SET sync_schedule_time = '${syncTimeData.sync_schedule_time}', sync_schedule_tz = '${syncTimeData.sync_schedule_tz}'
                        WHERE connection_id = '${connection_id}'`)
          .then(() => console.log("UPDATED sync time and timezone"))
      
      updateSchedule(connection_combined_Id, syncTimeData.sync_schedule_time, syncTimeData.sync_schedule_tz);
      // update flag for edited connections
      for (const database of connectionDetailEdited) {
          await pool.query(`UPDATE metadata.acct_database SET is_included_in_sync = '${database.is_included_in_sync}' WHERE database_id = '${database.database_id}'`)
              .then(() => console.log("UPDATED sync time flag for database:", database.database_name))
          for (const schema of database.schema) {
              await pool.query(`UPDATE metadata.acct_schema SET is_included_in_sync = '${schema.is_included_in_sync}' WHERE schema_id = '${schema.schema_id}'`)
                  .then(() => console.log("UPDATED sync time flag for schema:", schema.schema_name))
          }
      }
      console.log(yellowText, '[-- EVERYTHING IS UP-TO-DATE --]')
      res.json({ success: true });
  } catch (error) {
      console.error(error);
      res.json({ success: false, message: error.message });
  }
});

// DELETE connection by connectionId
router.route('/delete-connection/:id').delete(demoModeMiddleware, async (req, res, next) => {
  try {
      const connectionId = req.params.id;

      if (!connectionId) {
          return res.json({ success: false, message: 'Invalid Connection ID' });
      }

      await deleteByConnectionId(connectionId)
      res.json({ success: true });

  } catch (error) {
      console.error(error);
      res.json({ success: false, message: error.message });
  }
});

module.exports = router