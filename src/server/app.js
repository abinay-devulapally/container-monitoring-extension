const express = require("express");
const sqlite3 = require("sqlite3");
const { Sequelize, DataTypes } = require("sequelize");
const alertRoutes = require("./routes/alert");
const globalErrorHandler = require("./errorController");
const containerRoutes = require("./routes/container");
const azureRoutes = require("./routes/azure");
const portfinder = require("portfinder");
const cors = require("cors");
const AppError = require("./appError");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// Database setup
const sequelize = new Sequelize({
  dialect: "sqlite",
  dialectModule: sqlite3,
  storage: "./alerts.db",
  // logging: console.log,
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

// const SubscriptionResource = sequelize.define("SubscriptionResource", {
//   id: {
//     type: DataTypes.UUID,
//     defaultValue: DataTypes.UUIDV4,
//     primaryKey: true,
//   },
//   subscriptionId: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   resourceLabel: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
// });

// Attach sequelize and models to the app
app.set("sequelize", sequelize);
app.set("models", { Alert });
// app.set("models", { Alert, SubscriptionResource });

// Routes
app.use("/api/v1/", alertRoutes);
app.use("/api/v1/containers", containerRoutes);
app.use("/api/v1/azure", azureRoutes);

// Error handling
app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);

const resetDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log("Database reset completed...");
  } catch (error) {
    console.error("Error resetting database:", error.message);
  }
};

let server;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected...");

    // Optionally reset the database
    await resetDatabase();

    // Synchronize models with the database
    await sequelize.sync();
    console.log("Database synchronized...");

    // Use portfinder to find an available port
    portfinder
      .getPortPromise({
        startPort: 8000,
        stopPort: 9000,
      })
      .then((port) => {
        console.log(`Found available port: ${port}`);

        // Start your server on the found port
        server = app.listen(port, () => {
          console.log(`Server running on http://0.0.0.0:${port}`);
        });
      })
      .catch((err) => {
        console.error(`No available port found: ${err.message}`);
      });
  } catch (err) {
    console.error(`Failed to start server: ${err.message}`);
  }
};

const stopServer = () => {
  if (server) {
    server.close(() => {
      console.log("Server stopped.");
    });
  }
};

// Start the server
// startServer();

module.exports = { startServer, stopServer };