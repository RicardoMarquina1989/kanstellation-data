const keys = require("../keys")
const { Pool, Client } = require('pg');

const pool = new Pool({
  connectionTimeoutMillis: 30000,
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});

module.exports = pool;
