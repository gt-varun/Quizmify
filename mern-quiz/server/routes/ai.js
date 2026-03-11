
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// POST /api/ai/generate-questions
router.post("/generate-questions", async (req, res) => {
  try {
    const { topic, questionCount = 3, difficulty = "medium", optionCount = 4 } =
      req.body;

    if (!topic) {
      return res.status(400).json({ message: "topic is required" });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: "GROQ_API_KEY not configured" });
    }

    const prompt = `
Generate ${questionCount} multiple-choice quiz questions about "${topic}" with ${difficulty} difficulty.

Return ONLY a JSON array in this format:

[
  {
    "type": "multiple_choice",
    "question": "Question text",
    "options": ["A","B","C","D"],
    "correct_answer": "A",
    "difficulty": "${difficulty}",
    "topic": "${topic}",
    "subtopic": "specific concept"
  }
]

Rules:
- Exactly ${optionCount} options
- correct_answer must match one option
- No markdown formatting
- Return only JSON
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq error:", err);
      return res.status(500).json({ message: "AI generation failed" });
    }

    const data = await response.json();

    let content = data?.choices?.[0]?.message?.content || "";

    // remove markdown formatting
    content = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let questions;

    try {
      questions = JSON.parse(content);
    } catch (e) {
      console.error("Invalid JSON from AI:", content);
      return res.status(500).json({
        message: "AI returned invalid JSON. Try again.",
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({
        message: "AI did not return valid questions",
      });
    }

    res.json({ questions });
  } catch (err) {
    console.error("AI generation error:", err);
    res.status(500).json({ message: "Server error generating questions" });
  }
});

export default router;
