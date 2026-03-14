import express from 'express';
import Participant from '../models/Participant.js';
import Quiz from '../models/Quiz.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/participants/join — join a quiz
router.post('/join', optionalAuth, async (req, res) => {
  try {
    const { code, name } = req.body;
    if (!code || !name) return res.status(400).json({ message: 'Code and name are required' });

    const quiz = await Quiz.findOne({ code: code.toUpperCase() });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found. Please check the code.' });

    const participant = await Participant.create({
      quiz_id: quiz._id,
      name: name.trim(),
      user_id: req.user?._id || null,
    });

    res.status(201).json({ participant, quizCode: quiz.code });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/participants/:id
router.get('/:id', async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);
    if (!participant) return res.status(404).json({ message: 'Participant not found' });
    res.json(participant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/participants/:id — update score / answers
router.patch('/:id', async (req, res) => {
  try {
    const allowed = ['score', 'answers', 'answer_details', 'completed', 'completed_at', 'total_time_spent', 'boosters'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const participant = await Participant.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!participant) return res.status(404).json({ message: 'Participant not found' });

    res.json(participant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/participants/quiz/:quizCode/leaderboard
router.get('/quiz/:quizCode/leaderboard', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ code: req.params.quizCode.toUpperCase() });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const leaderboard = await Participant.find({ quiz_id: quiz._id, is_host: false })
      .select('_id name score completed')
      .sort({ score: -1 })
      .limit(10);

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/participants/user/history — quiz history for logged-in user
router.get('/user/history', protect, async (req, res) => {
  try {
    const participants = await Participant.find({ user_id: req.user._id, completed: true })
      .populate('quiz_id', 'topic code')
      .sort({ completed_at: -1 });

    const history = participants.map(p => ({
      id: p._id,
      quiz_id: p.quiz_id._id,
      name: p.name,
      score: p.score,
      completed_at: p.completed_at,
      total_time_spent: p.total_time_spent,
      quiz: { topic: p.quiz_id.topic, code: p.quiz_id.code },
    }));

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
