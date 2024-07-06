const express = require("express");
const router = express.Router();
const { checkAllContainers } = require("../utils");

// Define your container routes here
router.get("/all", async (req, res) => {
  try {
    const containers = await checkAllContainers();
    // console.log(containers);
    res.status(200).json(containers); // Ensure 200 status code if successful
  } catch (error) {
    console.error("Error fetching containers:", error.message); // Log error for debugging
    res.status(500).json({ error: "Failed to fetch containers" }); // Send error response
  }
});

module.exports = router;
