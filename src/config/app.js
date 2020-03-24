const express = require("express");
const app = express();
const cors = require("cors");

const logger = require("./appconfig").logger;
const bodyParser = require("body-parser");

// Express additions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: true }));

const TodoRoute = require("../routes/todo.route");
const AuthRoute = require("../routes/authentication.route");
const HorseRoute = require("../routes/horse.route");
const WebsiteRoute = require("../routes/website.route");
const UserRoute = require("../routes/user.route");
const ReservationRoute = require("../routes/reservation.route");

// Route definitions
app.use("/api/todo", TodoRoute);
app.use("/api/auth", AuthRoute);
app.use("/api/horse", HorseRoute);
app.use("/api/website", WebsiteRoute);
app.use("/api/user", UserRoute);
app.use("/api/reservation", ReservationRoute);

// No endpoint found
app.use("*", (req, res, next) => {
  logger.trace("User connected, but no endpoint was found");
  const errorBody = {
    error: {
      message: "Endpoint not found",
      code: 404
    }
  };

  next(errorBody);
});

// Error handler
app.use((body, req, res, next) => {
  if (body.details) {
    logger.warn("error handler: " + body.details);
  }
  res.status(body.error.code).json(body.error);
});

module.exports = app;
