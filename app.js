var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const mysql = require("mysql");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var fileRouter = require("./routes/filehandle");
var config_master = require("./config_master");

var app = express();
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

/*----------set up db connection------------*/
var newConnection = mysql.createPool({
  host: config_master.database.host,
  user: config_master.database.user,
  password: config_master.database.password,
  port: config_master.database.port,
  database: config_master.database.db
});
app.set("db_conn", newConnection);
/*-------------- END --------------------*/

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/v1", fileRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
