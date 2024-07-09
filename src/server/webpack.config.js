const path = require("path");

module.exports = {
  // Entry point of your application
  entry: "./app.js",

  // Output configuration
  output: {
    path: path.resolve(__dirname, "..", "..", "out", "server"),
    filename: "server.bundle.js",
    libraryTarget: "commonjs2",
  },

  // Target environment
  target: "node",

  // Module rules
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader", // If using Babel for ES6+ support
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },

  // Mode configuration
  mode: "production", // or 'development' for development mode

  // Resolve extensions
  resolve: {
    fallback: {
      "cpu-features": false,
      "./crypto/build/Release/sshcrypto.node": false,
    },
    extensions: [".js"],
  },
  // External dependencies configuration
  externals: {
    sequelize: "commonjs sequelize", // Exclude sequelize from the bundle
    sqlite3: "commonjs sqlite3", // Exclude sqlite3 from the bundle
  },
};
