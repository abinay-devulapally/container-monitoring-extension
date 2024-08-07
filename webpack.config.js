const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  target: "node", // since this is a VSCode extension

  entry: "./extension.js", // Adjust the entry point to extension.js

  output: {
    filename: "extension.bundle.js", // Output bundle name
    path: path.resolve(__dirname, "out"),
    libraryTarget: "commonjs2",
  },

  externals: [
    nodeExternals({
      allowlist: ["dockerode", "async", "sequelize", "sqlite3"],
    }),
  ], // Exclude node_modules

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },

  resolve: {
    extensions: [".js", ".jsx"],
  },
};
