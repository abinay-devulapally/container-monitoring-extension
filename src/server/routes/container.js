const express = require("express");
const router = express.Router();
const {
  checkAllContainers,
  startContainer,
  stopContainer,
  restartContainer,
} = require("../utils");

// Define your container routes here
router.get("/all", async (req, res, next) => {
  try {
    const containers = await checkAllContainers();
    res.status(200).json(containers); // Ensure 200 status code if successful
  } catch (error) {
    console.error("Error fetching containers:", error.message); // Log error for debugging
    next(error); // Pass the error to the error handler middleware
  }
});

// Start container route
router.post("/start/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await startContainer(id);
    res.status(200).json({ message: `Container ${id} started` });
  } catch (error) {
    console.error("Error starting container:", error.message); // Log error for debugging
    next(error); // Pass the error to the error handler middleware
  }
});

// Stop container route
router.post("/stop/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await stopContainer(id);
    res.status(200).json({ message: `Container ${id} stopped` });
  } catch (error) {
    console.error("Error stopping container:", error.message); // Log error for debugging
    next(error); // Pass the error to the error handler middleware
  }
});

// Restart container route
router.post("/restart/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await restartContainer(id);
    res.status(200).json({ message: `Container ${id} restarted` });
  } catch (error) {
    console.error("Error restarting container:", error.message); // Log error for debugging
    next(error); // Pass the error to the error handler middleware
  }
});

// Search containers by name, image, or status (case-insensitive, partial match)
router.get("/search", async (req, res, next) => {
  try {
    const { name, image, status } = req.query;
    const containers = await checkAllContainers();

    // If no search params, return all
    if (!name && !image && !status) {
      return res.status(200).json(containers);
    }

    const filtered = containers.filter((container) => {
      let match = true;
      if (name) {
        match =
          match &&
          container.Name &&
          container.Name.toLowerCase().includes(name.toLowerCase());
      }
      if (image) {
        match =
          match &&
          container.Image &&
          container.Image.toLowerCase().includes(image.toLowerCase());
      }
      if (status) {
        match =
          match &&
          container.Status &&
          container.Status.toLowerCase().includes(status.toLowerCase());
      }
      return match;
    });

    res.status(200).json(filtered);
  } catch (error) {
    console.error("Error searching containers:", error.message);
    next(error);
  }
});

module.exports = router;
