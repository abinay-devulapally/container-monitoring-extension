const express = require("express");
const router = express.Router();
const { checkAllContainers } = require("../utils");

// Define your container routes here
router.get("/all", async (req, res, next) => {
  try {
    const containers = await checkAllContainers();
    // console.log(containers);
    res.status(200).json(containers); // Ensure 200 status code if successful
  } catch (error) {
    console.error("Error fetching containers:", error.message); // Log error for debugging
    next(error); // Pass the error to the error handler middleware (in app.js
  }
});

module.exports = router;
