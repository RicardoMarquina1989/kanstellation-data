const path = require("path")
const DotEnv = require("dotenv-webpack")
const webpack = require("webpack")

const isDev = process.env.NODE_ENV === "development"

module.exports = {
  reactScriptsVersion: "react-scripts",
  target: "ES6",
  lib: ["DOM", "ES6", "DOM.Iterable", "ScriptHost", "ES2016.Array.Include"],
  style: {
    sass: {
      loaderOptions: {
        sassOptions: {
          includePaths: ["node_modules", "src/assets"]
        }
      }
    },
    postcss: {
      plugins: [require("postcss-rtlcss")()]
    }
  },
  webpack: {
    alias: {
      "@src": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "src/@core/assets"),
      "@components": path.resolve(__dirname, "src/@core/components"),
      "@layouts": path.resolve(__dirname, "src/@core/layouts"),
      "@store": path.resolve(__dirname, "src/redux"),
      "@styles": path.resolve(__dirname, "src/@core/scss"),
      "@configs": path.resolve(__dirname, "src/configs"),
      "@utils": path.resolve(__dirname, "src/utility/Utils"),
      "@hooks": path.resolve(__dirname, "src/utility/hooks")
    },
    configure: {
      mode: isDev ? "development" : "production",
      devtool: isDev ? "eval-source-map" : false,
      optimization: {
        sideEffects: false,
        innerGraph: !isDev,
        minimize: !isDev
      },
      cache: {
        type: "filesystem",
        compression: "gzip"
      }
    },
    plugins: [
      new DotEnv(),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
      })
    ]
  }
}
