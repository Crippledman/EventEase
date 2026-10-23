
import express from "express";
import mongoose from "mongoose";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/events
// Create a new event
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      location,
      capacity
    } = req.body;

    // Validate required fields
    if (
      !title?.trim() ||
      !description?.trim() ||
      !date ||
      !location?.trim() ||
      capacity === undefined ||
      capacity === null
    ) {
      return res.status(400).json({
        message: "All event fields are required"
      });
    }

    const parsedDate = new Date(date);
    const parsedCapacity = Number(capacity);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        message: "Please provide a valid event date"
      });
    }

    if (
      !Number.isInteger(parsedCapacity) ||
      parsedCapacity < 1
    ) {
      return res.status(400).json({
        message: "Capacity must be a positive whole number"
      });
    }

    const event = await Event.create({
  title: title.trim(),
  description: description.trim(),
  date: parsedDate,
  location: location.trim(),
  capacity: parsedCapacity,
  createdBy: req.adminId
    });

    return res.status(201).json({
      message: "Event created successfully",
      event
    });
  } catch (error) {
    console.error("Create event error:", error.message);

    return res.status(500).json({
      message: "Failed to create event"
    });
  }
});

// GET /api/events
// Retrieve all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ date: 1 });

    return res.status(200).json({
      count: events.length,
      events
    });
  } catch (error) {
    console.error("Fetch events error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch events"
    });
  }
});

// GET /api/events/:id
// Retrieve one event by its MongoDB ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid event ID"
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    return res.status(200).json({ event });
  } catch (error) {
    console.error("Fetch event error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch event"
    });
  }
});


// PUT /api/events/:id
// Update event details
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid event ID"
      });
    }

    const allowedFields = [
      "title",
      "description",
      "date",
      "location",
      "capacity"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided"
      });
    }

    if (
      updates.capacity !== undefined &&
      (!Number.isInteger(Number(updates.capacity)) ||
        Number(updates.capacity) < 1)
    ) {
      return res.status(400).json({
        message: "Capacity must be a positive whole number"
      });
    }

    if (updates.capacity !== undefined) {
      const existing = await Event.findById(id);

      if (!existing) {
        return res.status(404).json({
          message: "Event not found"
        });
      }

      if (Number(updates.capacity) < existing.registeredCount) {
        return res.status(409).json({
          message: "Capacity cannot be below registered count"
        });
      }

      updates.capacity = Number(updates.capacity);
    }

    if (updates.date !== undefined) {
      const parsedDate = new Date(updates.date);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          message: "Invalid event date"
        });
      }

      updates.date = parsedDate;
    }

    for (const field of ["title", "description", "location"]) {
      if (updates[field] !== undefined) {
        if (
          typeof updates[field] !== "string" ||
          !updates[field].trim()
        ) {
          return res.status(400).json({
            message: `${field} cannot be empty`
          });
        }

        updates[field] = updates[field].trim();
      }
    }

    const event = await Event.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    return res.status(200).json({
      message: "Event updated successfully",
      event
    });
  } catch (error) {
    console.error("Update event error:", error.message);

    return res.status(500).json({
      message: "Failed to update event"
    });
  }
});

// DELETE /api/events/:id
// Delete an event only if it has no registrations
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid event ID"
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    const hasRegistrations = await Registration.exists({
      eventId: id
    });

    if (hasRegistrations) {
      return res.status(409).json({
        message: "Cancel registrations before deleting this event"
      });
    }

    await Event.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Event deleted successfully"
    });
  } catch (error) {
    console.error("Delete event error:", error.message);

    return res.status(500).json({
      message: "Failed to delete event"
    });
  }
});


export default router;
