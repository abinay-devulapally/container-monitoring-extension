const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const filePath = path.join(__dirname, "../alerts.json");

// Helper function to read alerts from JSON file
const readAlertsFromFile = () => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Helper function to write alerts to JSON file
const writeAlertsToFile = (alerts) => {
  fs.writeFileSync(filePath, JSON.stringify(alerts, null, 2), "utf8");
};

// Route to post a new alert
router.post("/alerts", (req, res, next) => {
  try {
    const data = req.body;
    const alerts = readAlertsFromFile();

    const existingAlert = alerts.find(
      (alert) =>
        alert.severity === data.severity &&
        alert.host === data.host &&
        alert.service === data.service &&
        alert.details === data.details &&
        alert.isAlarm === data.isAlarm &&
        alert.status === data.status
    );

    if (existingAlert) {
      return res.status(409).json({ message: "Duplicate alert not added" });
    }

    alerts.push(data);

    if (data.status === "cleared") {
      writeAlertsToFile(alerts);
      return res.json({ message: "Alert cleared immediately after creation" });
    }

    writeAlertsToFile(alerts);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// Route to clear alerts
router.post("/clear-alert", (req, res, next) => {
  try {
    const data = req.body;
    const alerts = readAlertsFromFile();

    if (
      !data.hasOwnProperty("severity") ||
      !data.hasOwnProperty("host") ||
      !data.hasOwnProperty("service") ||
      !data.hasOwnProperty("details") ||
      !data.hasOwnProperty("isAlarm") ||
      !data.hasOwnProperty("status")
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (data.status === "cleared") {
      const updatedAlerts = alerts.filter(
        (alert) =>
          !(
            alert.severity === data.severity &&
            alert.host === data.host &&
            alert.service === data.service &&
            alert.details === data.details &&
            alert.isAlarm === data.isAlarm &&
            alert.status === "active"
          )
      );

      if (alerts.length === updatedAlerts.length) {
        return res
          .status(404)
          .json({ message: "No matching active alert found to clear" });
      }

      writeAlertsToFile(updatedAlerts);
      return res.json({
        message: "Alert cleared and deleted from active list",
      });
    }

    res
      .status(400)
      .json({ message: "Alert status must be 'cleared' to delete" });
  } catch (err) {
    next(err);
  }
});

// Route to clear all alerts
router.delete("/clear-all-alerts", (req, res, next) => {
  try {
    const alerts = readAlertsFromFile();
    const activeAlerts = alerts.filter((alert) => alert.status !== "cleared");
    writeAlertsToFile(activeAlerts);
    res.json({ message: "All alerts cleared successfully" });
  } catch (err) {
    next(err);
  }
});

// New route to get all alerts or filter by query parameters
router.get("/alerts", (req, res, next) => {
  try {
    const alerts = readAlertsFromFile();
    const { severity, host, service, isAlarm, status } = req.query;

    let filteredAlerts = alerts;

    if (severity)
      filteredAlerts = filteredAlerts.filter(
        (alert) => alert.severity === severity
      );
    if (host)
      filteredAlerts = filteredAlerts.filter((alert) => alert.host === host);
    if (service)
      filteredAlerts = filteredAlerts.filter(
        (alert) => alert.service === service
      );
    if (isAlarm)
      filteredAlerts = filteredAlerts.filter(
        (alert) => alert.isAlarm.toString() === isAlarm
      );
    if (status)
      filteredAlerts = filteredAlerts.filter(
        (alert) => alert.status === status
      );

    res.json(filteredAlerts);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
