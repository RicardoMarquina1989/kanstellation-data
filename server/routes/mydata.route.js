const express = require("express");
const pool = require("../database/db");
const keys = require("../keys");
const router = express.Router();

//GET all data for my page
router.route("/all-mydata").get(async (req, res, next) => {
  try {
    const accountID = keys.accountId;

    const query = `SELECT * FROM metadata.app_account_data(${accountID},null,null,null,null,null,null)`;
    const result = await pool.query(query);
    const scoreFiltersResult = await pool.query(
      `select * from setup.score_level `
    );

    const lastResult = await pool.query(
      `SELECT MAX(last_sync_ts) AS max_last_sync_time FROM metadata.acct_connection WHERE account_id = ${accountID};`
    );
    console.log("Got all connections.");
    res.json({
      success: true,
      data: result.rows,
      scoreFilters: scoreFiltersResult.rows,
      lastSyncTime: lastResult?.rows[0].max_last_sync_time,
    });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
});

// GET all data for table page
router.route('/all-table').post(async (req, res, next) => {
    try {
        const { accountId, tableId } = req.body;
        const scoreResult = await pool.query(`SELECT * FROM metadata.app_acct_table_score(${accountId}, ${tableId})`);
        const tableResult = await pool.query(`SELECT * FROM metadata.app_acct_table_data(${accountId}, ${tableId})`);
        const nameResult = await pool.query(`SELECT table_name, table_created_on, schema_id FROM metadata.acct_table WHERE table_id = '${tableId}';`);
        const schemaResult = await pool.query(`SELECT schema_name, database_id FROM metadata.acct_schema WHERE schema_id = '${nameResult.rows[0].schema_id}';`);
        const databaseResult = await pool.query(`SELECT database_name, connection_id FROM metadata.acct_database WHERE database_id = '${schemaResult.rows[0].database_id}';`);
        const connectionResult = await pool.query(`select connection_name, connection_type from metadata.acct_connection WHERE connection_id = ${databaseResult.rows[0]?.connection_id} `);
        const databaseScoreResult = await pool.query(`SELECT score_value, calendar_date FROM metadata.table_score WHERE table_id = '${tableId}';`);
        const flowDataResult = await pool.query(`SELECT * FROM metadata.app_table_lineage(${databaseResult.rows[0].connection_id}, ${tableId});`);
        const lastUpdResult = await pool.query(`SELECT MAX(last_altered_utc) FROM metadata.table_stats WHERE table_id = ${tableId}`);
        const rowCountResult = await pool.query(`SELECT MAX(row_count), DATE(stats_ts_utc) FROM metadata.table_stats WHERE table_id = ${tableId} AND stats_ts_utc > current_timestamp - interval '30 day' GROUP BY DATE(stats_ts_utc) ORDER BY Date(stats_ts_utc) DESC`);
        const freshnessResult = await pool.query(`SELECT TO_CHAR(MAX(last_altered_utc),'HH24:MI:SS') as time_arrived, DATE(MAX(stats_ts_utc)) FROM metadata.table_stats WHERE table_id = ${tableId} AND DATE(last_altered_utc) = DATE(stats_ts_utc) AND stats_ts_utc > current_timestamp - interval '30 day' GROUP BY DATE(stats_ts_utc) ORDER BY MAX(stats_ts_utc) DESC`);
        const parents = []
        const children = []
        const current = []
        for (const row of flowDataResult.rows ){
            if(row.pos === -1) parents.push(row)
            else if(row.pos === 1) children.push(row)
            else if(row.pos === 0) current.push(row)
        }
        ref = {
            table_score: scoreResult.rows[0].table_score,
            database_name: databaseResult.rows[0].database_name,
            schema_name: schemaResult.rows[0].schema_name,
            table_name: nameResult.rows[0].table_name,
            table_created_on: nameResult.rows[0].table_created_on,
            table_last_upd: lastUpdResult.rows[0].max,
            connection_name: connectionResult.rows[0]?.connection_name,
            connection_type: connectionResult.rows[0]?.connection_type,
        }
        console.log("Got all the table data.")
        res.json({
            success: true,
            data: {
                table: tableResult.rows,
                ref,
                flowData: {parents, current, children},
                scoreArray: databaseScoreResult.rows,
                rowCountArray: rowCountResult.rows,
                freshnessArray: freshnessResult.rows,
            } });
    } catch (error) {
        console.error("Error checking connection:", error);
        res.json({ success: false, message: error.message });
    }
});

// GET all data for column page
router.route("/all-column").post(async (req, res, next) => {
  try {
    const { columnId } = req.body;
    console.log("all-table", { columnId });

    const columnResult = await pool.query(`SELECT
                tc.column_id,
                tc.column_name,
                tc.data_type,
                t.table_id,
                t.table_name,
                s.schema_id,
                s.schema_name,
                d.database_id,
                d.database_name
            FROM metadata.acct_table_column AS tc
            JOIN metadata.acct_table AS t ON t.table_id = tc.table_id
            JOIN metadata.acct_schema AS s ON s.schema_id = t.schema_id
            JOIN metadata.acct_database AS d ON d.database_id = s.database_id
            WHERE tc.column_id = ${columnId}`);
    const columnExpectationResult = await pool.query(
      `SELECT column_measure, actual_value, calendar_date  FROM metadata.column_expectation WHERE column_id = '${columnId}' AND calendar_date >= NOW() - INTERVAL '2 month' ORDER BY calendar_date DESC;`
    );

    console.log("Got all the column data.");
    res.json({
      success: true,
      data: {
        column: columnResult.rows[0],
        columnExpectation: columnExpectationResult.rows,
      },
    });
  } catch (error) {
    console.error("Error checking connection:", error);
    res.json({ success: false, message: error.message });
  }
});

module.exports = router;
