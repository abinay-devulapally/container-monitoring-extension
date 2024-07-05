const express = require("express");
const router = express.Router();

router.post("/alerts", async (req, res) => {
  const { Alert } = req.app.get("models");
  try {
    const data = req.body;

    const existingAlert = await Alert.findOne({
      where: {
        severity: data.severity,
        host: data.host,
        service: data.service,
        details: data.details,
        isAlarm: data.isAlarm,
        status: data.status,
      },
    });

    if (existingAlert) {
      return res.status(409).json({ message: "Duplicate alert not added" });
    }

    const alert = await Alert.create(data);

    if (alert.status === "cleared") {
      await alert.destroy();
      return res.json({ message: "Alert cleared immediately after creation" });
    }

    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/clear-alert", async (req, res) => {
  const { Alert } = req.app.get("models");
  try {
    const data = req.body;

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
      const existingAlert = await Alert.findOne({
        where: {
          severity: data.severity,
          host: data.host,
          service: data.service,
          details: data.details,
          isAlarm: data.isAlarm,
          status: "active",
        },
      });

      if (existingAlert) {
        await existingAlert.destroy();
        return res.json({
          message: "Alert cleared and deleted from active list",
        });
      } else {
        return res
          .status(404)
          .json({ message: "No matching active alert found to clear" });
      }
    }

    res
      .status(400)
      .json({ message: "Alert status must be 'cleared' to delete" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/alerts", async (req, res) => {
  const { Alert } = req.app.get("models");
  try {
    const severity = req.query.severity;
    const host = req.query.host;

    const query = {
      where: {},
    };

    if (severity) query.where.severity = severity;
    if (host) query.where.host = host;

    const alerts = await Alert.findAll(query);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/alerts/:alertId", async (req, res) => {
  const { Alert } = req.app.get("models");
  try {
    const data = req.body;
    const alert = await Alert.findByPk(req.params.alertId);

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    await alert.update(data);
    res.json({ message: "Alert updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/alerts/:alertId", async (req, res) => {
  const { Alert } = req.app.get("models");
  try {
    const alert = await Alert.findByPk(req.params.alertId);

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    await alert.destroy();
    res.json({ message: "Alert deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/clear-all-alerts", async (req, res) => {
  const { Alert } = req.app.get("models");
  try {
    const alertsToClear = await Alert.findAll({
      where: {
        status: "active",
      },
    });

    for (let alert of alertsToClear) {
      await alert.destroy();
    }

    res.json({ message: "All alerts cleared successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
