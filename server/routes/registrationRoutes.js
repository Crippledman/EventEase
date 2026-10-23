
import express from "express";
import mongoose from "mongoose";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/registrations/:eventId
// Retrieve attendees for one event
router.get("/:eventId", authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        message: "Invalid event ID"
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    const registrations = await Registration.find({ eventId })
      .select("name email createdAt")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      event: {
        id: event._id,
        title: event.title,
        capacity: event.capacity,
        registeredCount: event.registeredCount,
        availableSeats:
          event.capacity - event.registeredCount
      },
      count: registrations.length,
      attendees: registrations
    });
  } catch (error) {
    console.error("Fetch attendees error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch attendees"
    });
  }
});

// POST /api/registrations/:eventId
router.post("/:eventId", async (req, res) => {
  const { eventId } = req.params;
  const name =
    typeof req.body.name === "string"
      ? req.body.name.trim()
      : "";
  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

  if (!mongoose.isValidObjectId(eventId)) {
    return res.status(400).json({
      message: "Invalid event ID"
    });
  }

  if (!name || !email) {
    return res.status(400).json({
      message: "Name and email are required"
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      message: "Please provide a valid email address"
    });
  }

  const session = await mongoose.startSession();

  try {
    let savedRegistration;

    await session.withTransaction(async () => {
      const event = await Event.findById(eventId).session(session);

      if (!event) {
        const error = new Error("EVENT_NOT_FOUND");
        throw error;
      }

      // Reserve one seat atomically, only if capacity remains.
      const updatedEvent = await Event.findOneAndUpdate(
        {
          _id: eventId,
          $expr: {
            $lt: ["$registeredCount", "$capacity"]
          }
        },
        {
          $inc: { registeredCount: 1 }
        },
        {
          new: true,
          session
        }
      );

      if (!updatedEvent) {
        const error = new Error("EVENT_FULL");
        throw error;
      }

      const registrations = await Registration.create(
        [{
          eventId,
          name,
          email
        }],
        { session }
      );

      savedRegistration = registrations[0];
    });

    return res.status(201).json({
      message: "Registration successful",
      registration: savedRegistration
    });
  } catch (error) {
    if (error.message === "EVENT_NOT_FOUND") {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    if (error.message === "EVENT_FULL") {
      return res.status(409).json({
        message: "Sorry, this event is full"
      });
    }

    // MongoDB duplicate-key error from the unique compound index.
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered for this event"
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Registration failed"
    });
  } finally {
    await session.endSession();
  }
});


 // DELETE /api/registrations/:eventId/:registrationId
router.delete(
  "/:eventId/:registrationId",
  authMiddleware,
  async (req, res) => {
    const { eventId, registrationId } = req.params;

    if (
      !mongoose.isValidObjectId(eventId) ||
      !mongoose.isValidObjectId(registrationId)
    ) {
      return res.status(400).json({
        message: "Invalid event or registration ID"
      });
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const registration = await Registration.findOneAndDelete(
          {
            _id: registrationId,
            eventId
          },
          { session }
        );

        if (!registration) {
          throw new Error("REGISTRATION_NOT_FOUND");
        }

        const event = await Event.findOneAndUpdate(
          {
            _id: eventId,
            registeredCount: { $gt: 0 }
          },
          {
            $inc: { registeredCount: -1 }
          },
          {
            new: true,
            session
          }
        );

        if (!event) {
          throw new Error("COUNTER_INCONSISTENT");
        }
      });

      return res.status(200).json({
        message: "Registration cancelled successfully"
      });
    } catch (error) {
      if (error.message === "REGISTRATION_NOT_FOUND") {
        return res.status(404).json({
          message: "Registration not found for this event"
        });
      }

      console.error("Cancellation error:", error.message);

      return res.status(500).json({
        message: "Failed to cancel registration"
      });
    } finally {
      await session.endSession();
    }
  }
);


export default router;
