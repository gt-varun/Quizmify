import express from 'express';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import Participant from '../models/Participant.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getPoints(difficulty) {
  switch (difficulty) {
    case 'hard': return 3;
    case 'medium': return 2;
    case 'easy': return 1;
    default: return 1;
  }
}

// POST /api/quizzes — create quiz
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { topic, difficulty, timerPerQuestion, boostersEnabled, questions } = req.body;

    if (!topic || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Topic and questions are required' });
    }

    // Generate unique code
    let code;
    let attempts = 0;
    do {
      code = generateCode();
      attempts++;
    } while ((await Quiz.findOne({ code })) && attempts < 10);

    const quiz = await Quiz.create({
      code,
      topic,
      question_count: questions.length,
      difficulty_mode: difficulty || 'medium',
      timer_per_question: timerPerQuestion || 30,
      boosters_enabled: boostersEnabled !== false,
      created_by: req.user?._id || null,
    });

    const questionsToInsert = questions.map((q) => {
      let correctAnswer = q.correct_answer;
      const opts = q.options || [];

      // Normalize: ensure correct_answer exactly matches one of the options
      if (opts.length > 0 && !opts.includes(correctAnswer)) {
        const match = opts.find(o => o.toLowerCase().trim() === correctAnswer.toLowerCase().trim());
        if (match) correctAnswer = match;
      }

      return {
        quiz_id: quiz._id,
        type: q.type || 'multiple_choice',
        question: q.question,
        options: opts.length > 0 ? opts : null,
        correct_answer: correctAnswer,
        difficulty: q.difficulty || difficulty || 'medium',
        points: getPoints(q.difficulty || difficulty || 'medium'),
        time_limit: timerPerQuestion || 30,
        topic,
        subtopic: q.subtopic || null,
      };
    });

    await Question.insertMany(questionsToInsert);

    res.status(201).json({ success: true, code, quizId: quiz._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/quizzes/:code
router.get('/:code', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ code: req.params.code.toUpperCase() });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const participants = await Participant.find({ quiz_id: quiz._id, is_host: false })
      .sort({ score: -1 });

    res.json({ quiz, participants });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/quizzes/:code/stats
router.get('/:code/stats', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ code: req.params.code.toUpperCase() });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const participants = await Participant.find({ quiz_id: quiz._id, is_host: false, completed: true });

    if (participants.length === 0) {
      return res.json({ total_participants: 0, highest_score: 0, lowest_score: 0, average_score: 0 });
    }

    const scores = participants.map(p => p.score);
    const stats = {
      total_participants: participants.length,
      highest_score: Math.max(...scores),
      lowest_score: Math.min(...scores),
      average_score: scores.reduce((a, b) => a + b, 0) / scores.length,
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/quizzes/user/created — created quizzes for logged-in user
router.get('/user/created', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ created_by: req.user._id }).sort({ createdAt: -1 });

    const quizzesWithCounts = await Promise.all(quizzes.map(async (quiz) => {
      const count = await Participant.countDocuments({ quiz_id: quiz._id, is_host: false });
      return { ...quiz.toObject(), participant_count: count };
    }));

    res.json(quizzesWithCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
