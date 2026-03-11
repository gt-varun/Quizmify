import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  quiz_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'open_ended'],
    default: 'multiple_choice',
  },
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    default: null,
  },
  correct_answer: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  points: {
    type: Number,
    default: 1,
  },
  time_limit: {
    type: Number,
    default: 30,
  },
  topic: String,
  subtopic: String,
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);
