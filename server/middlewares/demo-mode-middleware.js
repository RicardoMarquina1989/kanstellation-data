const keys = require("../keys");


/**
 * @type {import("express").RequestHandler}
 */
const demoModeMiddleware = (req, res, next) => {
  if (keys.demoMode === "enabled") {
    console.log("Request to '%s' blocked by Demo Blocker", req.path);
    return res.status(403).json({
      status: false,
      message: "demo mode doesn't support this operation",
    });
  } else {
    next();
  }
};

module.exports = demoModeMiddleware;
