var createError = require("http-errors");
var express = require("express");
var db = require("./models");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const fsr = require("fs-reverse");
const jsend = require("./jsend");
const sync = require("./sync");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(jsend);

app.use(async (req, res, next) => {
  try {
    const { sequelize } = require("./models");
    await sequelize.authenticate();
    next();
  } catch (err) {
    console.log(err.message);
    console.log(err.name);
    console.log(err.stack);
    if (
      ["SequelizeConnectionRefusedError", "SequelizeConnectionError"].includes(
        err.name
      )
    )
      return res.jerror("Database tidak berhasil dihubungi.");
    else return res.jerror(err.message, { stack: err.stack });
  }
});

app.use("/", async (req, res) => {
  const { Log, Sequelize } = db;

  const DEFAULT_ITEMS_PER_PAGE = process.env.DEFAULT_ITEMS_PER_PAGE || 10;

  const {
    itemsPerPage,
    page,
    client,
    prefixUri,
    fromDate,
    toDate,
    clientUsername,
  } = req.query;

  const limit =
    itemsPerPage && !isNaN(Number(itemsPerPage))
      ? Number(itemsPerPage)
      : DEFAULT_ITEMS_PER_PAGE;
  const offset = req.query.page ? (req.query.page - 1) * limit : 0;
  let where = {};

  if (prefixUri)
    where = { ...where, request: { [Sequelize.Op.like]: `%${prefixUri}%` } };

  if (clientUsername) where = { ...where, clientUsername };

  if (fromDate) where = { ...where, time: { [Sequelize.Op.gte]: fromDate } };
  if (toDate) where = { ...where, time: { [Sequelize.Op.lte]: toDate } };

  if (client) where = { ...where, client };
  else {
    const auth = {
      login: process.env.USERNAME,
      password: process.env.PASSWORD,
    }; // change this
    // parse login and password from headers
    const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
    const [login, password] = Buffer.from(b64auth, "base64")
      .toString()
      .split(":");

    // Verify login and password are set and correct
    if (
      login &&
      password &&
      login === auth.login &&
      password === auth.password
    ) {
    } else {
      return res.jerror("Not authorized");
    }
  }
  const config = {
    where,
    limit,
    offset,
  };
  const { rows: logs, count: totalItems, ...ok } = await Log.findAndCountAll(
    config
  );
  res.jsend({
    logs,
    itemsPerPage: limit,
    page,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
  });
});

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

var CronJob = require("cron").CronJob;
var job = new CronJob(
  process.env.CRON_SYNC || "* */10 5-22 * * *",
  sync,
  null,
  true,
  "Asia/Jakarta"
);
job.start();
