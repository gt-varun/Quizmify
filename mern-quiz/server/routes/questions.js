import express from 'express';
import Question from '../models/Question.js';
import Quiz from '../models/Quiz.js';

const router = express.Router();

// GET /api/questions/:quizCode
router.get('/:quizCode', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ code: req.params.quizCode.toUpperCase() });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const questions = await Question.find({ quiz_id: quiz._id }).sort({ createdAt: 1 });
    res.json({ quiz, questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
