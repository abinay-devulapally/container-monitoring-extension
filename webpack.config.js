const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  target: "node",
  entry: "./extension.js",
  output: {
    filename: "extension.bundle.js",
    path: path.resolve(__dirname, "out"),
    libraryTarget: "commonjs2",
  },
  externals: [
    nodeExternals({
      allowlist: ["dockerode", "async"],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
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
    extensions: [".js", ".jsx", ".node"],
  },
};
