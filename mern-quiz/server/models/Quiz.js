import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  topic: {
    type: String,
    required: true,
    trim: true,
  },
  question_count: {
    type: Number,
    required: true,
  },
  difficulty_mode: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  timer_per_question: {
    type: Number,
    default: 30,
  },
  boosters_enabled: {
    type: Boolean,
    default: true,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);
