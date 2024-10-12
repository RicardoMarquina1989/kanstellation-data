const express = require('express');
const pool = require('../database/db');
const router = express.Router();

const getTablePath = async (account_id, table_id) => {
    if (!account_id || !table_id) return null
    const tableResult = await pool.query(`SELECT 
            t.table_id,
            t.table_name,
            s.schema_id,
            s.schema_name,
            d.database_id,
            d.database_name,
            c.connection_type,
            c.connection_name,
            c.connection_id
        FROM metadata.acct_table AS t
        JOIN metadata.acct_schema AS s ON t.schema_id = s.schema_id
        JOIN metadata.acct_database AS d ON d.database_id = s.database_id
        JOIN metadata.acct_connection AS c ON c.connection_id = d.connection_id
        WHERE t.account_id = ${account_id} AND t.table_id = ${table_id}`)
    return tableResult.rows[0]
}

const getIncidentHistory = async (incident_number) => {
    const incidentResult = await pool.query(`SELECT
            i.incident_number,
            h.incident_status,
            h.status_ts,
            h.created_on_utc,
            h.username,
            l.description,
            l.display_status
        FROM metadata.incident AS i
        JOIN metadata.inc_status_history AS h ON i.incident_number = h.incident_number
        JOIN metadata.inc_status_lookup AS l ON h.incident_status = l.incident_status
        WHERE i.incident_number = ${incident_number}
        ORDER BY h.status_ts DESC `)
    return incidentResult.rows
}

//GET all data for Incident page
router.route('/all-incident').get(async (req, res, next) => {
    try {
        const incidentResult = await pool.query(`SELECT
                i.incident_number,
                i.criticality_score,
                i.root_table_id,
                i.latest_inc_status,
                i.queries_impacted,
                i.account_id,
                t.table_id
            FROM metadata.incident AS i
            LEFT JOIN metadata.inc_tables_impacted AS t 
            ON i.incident_number = t.incident_number
            ORDER BY i.criticality_score DESC, i.created_on_utc`);
        let incidentData = []
        for (const row of incidentResult.rows) {
            const incidentId = incidentData.findIndex(obj => obj.incident_number === row?.incident_number);
            const tablePath = await getTablePath(row?.account_id, row?.table_id)
            if (incidentId === -1) {
                const rootTablePath = await getTablePath(row?.account_id, row?.root_table_id)
                const incident_history = await getIncidentHistory(row?.incident_number)
                const tempItem = {
                    incident_number: row?.incident_number,
                    criticality_score: row?.criticality_score,
                    latest_inc_status: row?.latest_inc_status,
                    account_id: row?.account_id,
                    incident_status: row?.incident_status,
                    display_status: row?.display_status,
                    description: row?.description,
                    status_ts: row?.status_ts,
                    queries_impacted: row?.queries_impacted,
                    impacted: [],
                    incident_history
                }
                if (tablePath) tempItem.impacted.push(tablePath)
                incidentData.push({...tempItem, ...rootTablePath}) 
            }
            else {
                const tempItem = incidentData[incidentId]
                if (tablePath) tempItem.impacted.push(tablePath)
                incidentData[incidentId] = tempItem
            }
        }
        res.json({ success: true, data: incidentData });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
});

//GET one for my page
router.route('/one-incident').post(async (req, res, next) => {
    const {incidentNumber} = req.body
    try {
        const incidentResult = await pool.query(`SELECT
                i.incident_number,
                i.criticality_score,
                i.root_table_id,
                i.latest_inc_status,
                i.queries_impacted,
                i.account_id,
                t.table_id
            FROM metadata.incident AS i
            LEFT JOIN metadata.inc_tables_impacted AS t 
            ON i.incident_number = t.incident_number
            WHERE i.incident_number = ${incidentNumber}`);
        let incidentData = []
        for (const row of incidentResult.rows) {
            const incidentId = incidentData.findIndex(obj => obj.incident_number === row?.incident_number);
            const tablePath = await getTablePath(row?.account_id, row?.table_id)
            if (incidentId === -1) {
                const rootTablePath = await getTablePath(row?.account_id, row?.root_table_id)
                const incident_history = await getIncidentHistory(row?.incident_number)
                console.log("tablePath", tablePath)
                const tempItem = {
                    incident_number: row?.incident_number,
                    criticality_score: row?.criticality_score,
                    latest_inc_status: row?.latest_inc_status,
                    account_id: row?.account_id,
                    incident_status: row?.incident_status,
                    display_status: row?.display_status,
                    description: row?.description,
                    status_ts: row?.status_ts,
                    queries_impacted: row?.queries_impacted,
                    impacted: [],
                    incident_history
                }
                if (tablePath) tempItem.impacted.push(tablePath)
                incidentData.push({...tempItem, ...rootTablePath}) 
            }
            else {
                const tempItem = incidentData[incidentId]
                if (tablePath) tempItem.impacted.push(tablePath)
                incidentData[incidentId] = tempItem
            }            
        }
        res.json({ success: true, data: incidentData });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
});

//Update status of one incident
router.route('/update-status').post(async (req, res, next) => {
    try {
        const {incident_history, userName} = req.body
        const {incident_number, incident_status, created_on_utc} = incident_history

        let next_incident_status
        if (incident_status === "new") next_incident_status = "acknowledged"
        else next_incident_status = "closed"

        await pool.query(`UPDATE metadata.incident
                          SET latest_inc_status = '${next_incident_status}'
                          WHERE incident_number = ${incident_number};`);

        await pool.query(`INSERT INTO metadata.inc_status_history (incident_number, incident_status, status_ts, created_on_utc, username)
                          VALUES (${incident_number}, '${next_incident_status}', CURRENT_TIMESTAMP AT TIME ZONE 'UTC', '${created_on_utc}', '${userName}');`)
        console.log("Good??")
        res.json({ success: true });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
});

module.exports = router;