"use strict";

require("dotenv").config();
const express = require("express");
const config = require("./utils/config");
const morgan = require("morgan");
const redshift = require("./lib/redshift-pg");

const app = express();

const host = config.HOST || "localhost";
const port = config.PORT || 3000;

app.use(morgan("common"));

app.get("/", (_req, res) => res.send("hello world"));

app.get("/allEventNames", (_req, res, next) => {
  try {
    const result = redshift.getAllEventNames();
    res.status(200).send(JSON.stringify(result));
  } catch (error) {
    next(error);
  }
});

app.get("/events", (req, res, next) => {
  const TIMEUNIT_BY_RANGE = {
    Today: "hour",
    Yesterday: "hour",
    Last7D: "day",
    Last30D: "day",
    Last3M: "month",
    Last6M: "month",
    Last12M: "month",
  };

  const PREVIOUS_BY_RANGE = {
    Today: 24,
    Yesterday: 48,
    Last7D: 7,
    Last30D: 30,
    Last3M: 3,
    Last6M: 6,
    Last12M: 12,
  };

  let { date_range, event_name } = req.query;
  try {
    let result = redshift.getAggregatedEventsBy(
      TIMEUNIT_BY_RANGE[date_range],
      "total", // TODO implement other Aggregation Types
      {
        previous: PREVIOUS_BY_RANGE[date_range],
        event_name,
      },
    );

    res.status(200).send(JSON.stringify(result));
  } catch (error) {
    next(error);
  }
});

app.get("/attributes", async (_req, res, next) => {
  try {
    const result = await redshift.getAllAttributes();
    res.status(200).send(JSON.stringify(result));
  } catch (error) {
    next(error);
  }
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err); // Writes more extensive information to the console log
  res.status(404).send(err.message); // TODO; Tranform to more granular error messages for 4XX and 5XX
});

// Listener
app.listen(port, "0.0.0.0", () => {
  console.log(`App is listening on port ${port} of ${host}.`);
});
