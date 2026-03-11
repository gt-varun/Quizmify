import mongoose from 'mongoose';

const answerDetailSchema = new mongoose.Schema({
  question_id: String,
  user_answer: String,
  correct_answer: String,
  is_correct: Boolean,
  time_spent: Number,
  difficulty: String,
  points: Number,
  booster_used: String,
}, { _id: false });

const boosterSchema = new mongoose.Schema({
  id: String,
  type: String,
  used: { type: Boolean, default: false },
}, { _id: false });

const participantSchema = new mongoose.Schema({
  quiz_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  answers: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  answer_details: {
    type: [answerDetailSchema],
    default: [],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  total_time_spent: {
    type: Number,
    default: 0,
  },
  boosters: {
    type: [boosterSchema],
    default: [],
  },
  is_host: {
    type: Boolean,
    default: false,
  },
  completed_at: {
    type: Date,
    default: null,
  },
}, { timestamps: { createdAt: 'joined_at', updatedAt: 'updatedAt' } });

export default mongoose.model('Participant', participantSchema);
