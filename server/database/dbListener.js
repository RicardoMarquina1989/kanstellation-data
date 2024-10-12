const keys = require("../keys")
const { Pool, Client } = require('pg');
const { setConnectionListeningData } = require('../utilities');
const yellowText = "\x1b[33m%s\x1b[0m";

const startNotificationListener = async () => {
    const client = new Client({
      user: keys.pgUser,
      host: keys.pgHost,
      database: keys.pgDatabase,
      password: keys.pgPassword,
      port: keys.pgPort
    });

    await client.connect();
  
    await client.query('LISTEN acct_connection_changes')
    const result = await client.query(`SELECT *, encode(password::bytea, 'base64') AS encoded_password
                                       FROM metadata.acct_connection`);
    setConnectionListeningData(result.rows)
    client.on('notification', async (notification) => {
      const result = await client.query(`SELECT *, encode(password::bytea, 'base64') AS encoded_password
                                         FROM metadata.acct_connection`);
      setConnectionListeningData(result.rows)
    });
  
    client.on('error', (err) => {
      console.error('PostgreSQL client error:', err);
    });
  };
  
  module.exports = startNotificationListener;
