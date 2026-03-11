import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Clock, Trophy } from 'lucide-react';
import api from '../lib/api.js';
import PowerBoosters, { generateRandomBoosters, BOOSTER_INFO } from '../components/quiz/PowerBoosters.jsx';

export default function Play() {
  const { code, participantId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [answerDetails, setAnswerDetails] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [quizInfo, setQuizInfo] = useState(null);
  const [streak, setStreak] = useState(0);
  const [boosters, setBoosters] = useState([]);
  const [activeBooster, setActiveBooster] = useState(null);
  const [timeFrozen, setTimeFrozen] = useState(false);
  const [streakProtected, setStreakProtected] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [boostersEnabled, setBoostersEnabled] = useState(true);
  const questionStartTime = useRef(Date.now());

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const [questionsRes, participantRes] = await Promise.all([
        api.get(`/questions/${code}`),
        api.get(`/participants/${participantId}`),
      ]);

      const { quiz, questions: qs } = questionsRes.data;
      setQuizInfo(quiz);
      setBoostersEnabled(quiz.boosters_enabled !== false);
      setQuestions(qs);
      setTimeRemaining(qs[0]?.time_limit || 30);

      const participant = participantRes.data;
      const enabled = quiz.boosters_enabled !== false;

      if (enabled) {
        if (participant.boosters?.length > 0) {
          setBoosters(participant.boosters);
        } else {
          const newBoosters = generateRandomBoosters();
          setBoosters(newBoosters);
          await api.patch(`/participants/${participantId}`, { boosters: newBoosters });
          toast.success(`You got boosters: ${newBoosters.map(b => BOOSTER_INFO[b.type].name).join(', ')}`);
        }
      }
    } catch (err) {
      toast.error('Failed to load quiz');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questions.length > 0 && currentIdx < questions.length) {
      setTimeRemaining(questions[currentIdx].time_limit || 30);
      questionStartTime.current = Date.now();
      setHiddenOptions([]);
      setActiveBooster(null);
      setTimeFrozen(false);
      setStreakProtected(false);
    }
  }, [currentIdx, questions]);

  useEffect(() => {
    if (timeRemaining > 0 && !showResult && !timeFrozen) {
      const t = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) { handleSubmit(null, true); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(t);
    }
  }, [timeRemaining, showResult, currentIdx, timeFrozen]);

  // Poll leaderboard
  useEffect(() => {
    if (!quizInfo) return;
    const fetchLB = async () => {
      try {
        const res = await api.get(`/participants/quiz/${code}/leaderboard`);
        setLeaderboard(res.data);
      } catch (_) {}
    };
    fetchLB();
    const interval = setInterval(fetchLB, 3000);
    return () => clearInterval(interval);
  }, [quizInfo]);

  const handleUseBooster = async (boosterId, type) => {
    const currentQ = questions[currentIdx];
    const updated = boosters.map(b => b.id === boosterId ? { ...b, used: true } : b);
    setBoosters(updated);
    api.patch(`/participants/${participantId}`, { boosters: updated });

    switch (type) {
      case 'double_points':
      case 'double_jeopardy':
        setActiveBooster(type);
        toast.success(`${BOOSTER_INFO[type].name} Activated!`);
        break;
      case 'time_freeze':
        setTimeFrozen(true);
        toast.success('Time Frozen!');
        break;
      case 'streak_freeze':
        setStreakProtected(true);
        toast.success('Streak Protected!');
        break;
      case 'eraser': {
        const wrong = currentQ.options?.filter(o => o !== currentQ.correct_answer && !hiddenOptions.includes(o));
        if (wrong?.length) {
          setHiddenOptions(p => [...p, wrong[Math.floor(Math.random() * wrong.length)]]);
          toast.success('One wrong answer removed!');
        }
        break;
      }
      case 'vaccine': {
        const wrong2 = currentQ.options?.filter(o => o !== currentQ.correct_answer && !hiddenOptions.includes(o));
        if (wrong2?.length) {
          setHiddenOptions(p => [...p, ...wrong2.slice(0, 2)]);
          toast.success('50/50 Activated!');
        }
        break;
      }
    }
  };

  const handleSubmit = async (e, timeExpired = false) => {
    if (e) e.preventDefault();
    const currentQ = questions[currentIdx];
    const userAnswer = timeExpired ? '' : (answers[currentQ._id] || '');
    const timeSpent = Math.floor((Date.now() - questionStartTime.current) / 1000);
    const isCorrect = userAnswer.toLowerCase().trim() === currentQ.correct_answer.toLowerCase().trim();

    let pointsEarned = 0;
    if (isCorrect) {
      pointsEarned = currentQ.points;
      if (activeBooster === 'double_points' || activeBooster === 'double_jeopardy') pointsEarned *= 2;
      setStreak(p => p + 1);
    } else {
      if (activeBooster === 'double_jeopardy') pointsEarned = -currentQ.points;
      if (!streakProtected) setStreak(0);
    }

    const detail = {
      question_id: currentQ._id,
      user_answer: userAnswer,
      correct_answer: currentQ.correct_answer,
      is_correct: isCorrect,
      time_spent: timeSpent,
      difficulty: currentQ.difficulty,
      points: pointsEarned,
      booster_used: activeBooster,
    };

    const newDetails = [...answerDetails, detail];
    setAnswerDetails(newDetails);
    const newScore = Math.max(0, score + pointsEarned);
    setScore(newScore);

    await api.patch(`/participants/${participantId}`, { score: newScore, answer_details: newDetails });

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setSubmitting(true);
      const totalTime = newDetails.reduce((s, d) => s + d.time_spent, 0);
      await api.patch(`/participants/${participantId}`, {
        score: newScore,
        answers,
        answer_details: newDetails,
        total_time_spent: totalTime,
        completed: true,
        completed_at: new Date().toISOString(),
      });
      setShowResult(true);
      setTimeout(() => navigate(`/results/${code}/${participantId}`), 1500);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (showResult) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-full max-w-2xl p-8 text-center border-primary/30">
        <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-4">Quiz Completed!</h2>
        <p className="text-xl text-muted-foreground">Your score: <span className="text-primary font-bold">{score} points</span></p>
        <p className="text-muted-foreground mt-2">Redirecting to results...</p>
      </div>
    </div>
  );

  const currentQ = questions[currentIdx];
  if (!currentQ) return null;
  const progress = ((currentIdx + 1) / questions.length) * 100;
  const visibleOptions = currentQ.options?.filter(o => !hiddenOptions.includes(o));

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#0F0F1A' }}>
      <div className="flex gap-4 max-w-7xl mx-auto">
        <div className="flex-1">
          <div className="p-8 rounded-xl border border-purple-500/30 shadow-xl" style={{ backgroundColor: '#252545' }}>
            {/* Header */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Question {currentIdx + 1} of {questions.length}</span>
                <div className="flex items-center gap-4">
                  {streak > 1 && (
                    <span className="text-sm font-semibold px-3 py-1 rounded bg-orange-500/20 text-orange-400 animate-pulse">
                      🔥 {streak} Streak
                    </span>
                  )}
                  <span className={`text-sm font-semibold px-3 py-1 rounded ${currentQ.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' : currentQ.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                    {currentQ.difficulty} ({currentQ.points}pts)
                  </span>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded ${timeFrozen ? 'bg-cyan-500/20 text-cyan-400' : timeRemaining <= 10 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-purple-500/20 text-purple-300'}`}>
                    <Clock className="w-4 h-4" />
                    <span className="font-bold">{timeFrozen ? '⏸️ ' : ''}{timeRemaining}s</span>
                  </div>
                </div>
              </div>
              <div className="w-full rounded-full h-2" style={{ backgroundColor: '#161630' }}>
                <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {boostersEnabled && (
              <div className="mb-4">
                <PowerBoosters boosters={boosters} onUseBooster={handleUseBooster} disabled={submitting}
                  activeBooster={activeBooster} isMultipleChoice={currentQ.type === 'multiple_choice'} />
              </div>
            )}

            {activeBooster && (
              <div className={`mb-4 p-2 rounded-lg text-center text-sm font-semibold border ${BOOSTER_INFO[activeBooster].color}`}>
                {BOOSTER_INFO[activeBooster].name} Active!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-2xl font-bold text-white leading-snug">{currentQ.question}</h3>

              {currentQ.type === 'multiple_choice' && visibleOptions ? (
                <div className="space-y-3">
                  {visibleOptions.map((opt, i) => (
                    <label key={i} style={{
                      backgroundColor: answers[currentQ._id] === opt ? '#3B2F6B' : '#1A1A38',
                      borderColor: answers[currentQ._id] === opt ? '#8B5CF6' : '#4B4B7A',
                      color: '#ffffff',
                    }}
                      className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all hover:brightness-110">
                      <input type="radio" name="answer" value={opt} checked={answers[currentQ._id] === opt}
                        onChange={e => setAnswers(p => ({ ...p, [currentQ._id]: e.target.value }))} className="sr-only" />
                      <span className="font-medium text-base">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Your Answer</label>
                  <textarea
                    style={{ backgroundColor: '#161630', borderColor: '#4B4B7A', color: '#ffffff' }}
                    className="w-full rounded-lg px-3 py-2 border resize-none min-h-[100px] placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                    placeholder="Type your answer here..."
                    value={answers[currentQ._id] || ''} onChange={e => setAnswers(p => ({ ...p, [currentQ._id]: e.target.value }))} />
                </div>
              )}

              <button type="submit" disabled={submitting}
                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2">
                {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : currentIdx < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
              </button>
            </form>
          </div>
        </div>

        {/* Live Leaderboard */}
        <div className="w-72 hidden lg:block">
          <div className="p-6 rounded-xl border border-purple-500/30 sticky top-4" style={{ backgroundColor: '#252545' }}>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl font-bold text-white">Live Leaderboard</h3>
            </div>
            <div className="space-y-2">
              {leaderboard.map((p, i) => (
                <div key={p._id} style={{
                  backgroundColor: p._id === participantId ? '#3B2F6B' : '#1A1A38',
                  borderColor: p._id === participantId ? '#8B5CF6' : '#4B4B7A',
                }} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-gray-500'}`}>
                        #{i + 1}
                      </span>
                      <span className="text-sm text-white truncate max-w-[100px]">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-purple-400 font-bold">{p.score}</span>
                      {p.completed && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
