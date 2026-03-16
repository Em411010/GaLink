import { interpretProblem, chatWithAI } from "../services/ai.service.js";
import { findMatches } from "../services/match.service.js";
import User from "../models/User.model.js";

// POST /api/chatbot/interpret
export async function interpretUserProblem(req, res, next) {
  try {
    const { message, dialect = null } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // AI interpretation
    const interpretation = await interpretProblem(message, dialect);

    // Find matching freelancers
    const matches = await findMatches({
      requiredSkills: interpretation.requiredSkills,
      urgencyLevel: interpretation.urgencyLevel,
      locationRelevant: interpretation.locationRelevant,
      userLocation: req.user?.location,
    });

    // Store chatbot query for personalization
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          chatbotQueries: {
            $each: [{
              query: message,
              extractedSkills: interpretation.requiredSkills,
            }],
            $slice: -50,
          },
        },
      });
    }

    res.json({
      interpretation,
      recommendations: matches,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/chatbot/chat
export async function chat(req, res, next) {
  try {
    const { messages, dialect = null } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Messages array is required" });
    }

    const reply = await chatWithAI(messages, dialect);

    res.json({ reply });
  } catch (error) {
    next(error);
  }
}
