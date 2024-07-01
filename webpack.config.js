const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./src/client/index.jsx",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "out", "client"),
  },
  module: {
    rules: [
      {
        test: /\.jsx$/,
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
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  require("tailwindcss"), // Example: Tailwind CSS plugin
                  require("autoprefixer"), // Example: Autoprefixer plugin
                  // Add more PostCSS plugins as needed
                ],
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "styles.css", // Output CSS filename
    }),
  ],
  optimization: {
    minimize: true, // Optionally minimize CSS
  },
};
