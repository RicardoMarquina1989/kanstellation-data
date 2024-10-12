require("dotenv").config();
var jwt = require("jsonwebtoken");
var jwkToPem = require("jwk-to-pem");

const keys = require("./keys");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const createError = require("http-errors");

const pool = require("./database/db");
const startNotificationListener = require("./database/dbListener");

const ConnectionRoute = require("./routes/connection.route");
const MyDataRoute = require("./routes/mydata.route");
const EmailRoute = require("./routes/email.route");
const IncidentRoute = require("./routes/incident.route");
const yellowText = "\x1b[33m%s\x1b[0m";
const greenText = "\x1b[32m%s\x1b[0m";

const app = express();

pool.connect((err, client, done) => {
  if (err) {
    console.error(yellowText, "Could not connect to PostgreSQL.KO:", err);
  } else {
    console.log(yellowText, "Connected to PostgreSQL.KO");
    done();
    startNotificationListener();
    console.log(greenText, "[-- READY TO SERVE APIS --]");
  }
});

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.use("/connection", ConnectionRoute);
app.use("/mydata", MyDataRoute);
app.use("/incident", IncidentRoute);
app.use("/email", EmailRoute);

const port = keys.appPort;
const server = app.listen(port, () => {
  console.log(yellowText, "Connected to port " + port);
});

// 404 Error
app.use((req, res, next) => {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});
