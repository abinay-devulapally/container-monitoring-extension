const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const alertRoutes = require("./routes/alert");
const portfinder = require("portfinder");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// Database setup
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./alerts.db",
  logging: console.log,
});

// Define models
const Alert = sequelize.define("Alert", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  time_raised: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  severity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  host: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  service: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isAlarm: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "active",
  },
});

// Attach sequelize and models to the app
app.set("sequelize", sequelize);
app.set("models", { Alert });

// Routes
app.use("/", alertRoutes);

// Error handling
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

// Sync database and start server
const process_backend_server = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected...");

    // Synchronize models with the database
    await sequelize.sync();
    console.log("Database synchronized...");
    // Use portfinder to find an available port
    const port = await portfinder.getPortPromise({
      startPort: 8000,
      stopPort: 9000,
    });

    // Start your server on the found port
    const server = await app.listen(port);
    console.log(`Server running on http://0.0.0.0:${port}`);
  } catch (err) {
    console.error(`Failed to start server: ${err.message}`);
  }
};

module.exports = process_backend_server;