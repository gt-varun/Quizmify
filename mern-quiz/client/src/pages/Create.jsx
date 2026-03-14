import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Sparkles, PenLine, Wand2, Zap } from 'lucide-react';
import api from '../lib/api.js';
import AIQuestionGenerator from '../components/quiz-creation/AIQuestionGenerator.jsx';
import ManualQuestionCreator from '../components/quiz-creation/ManualQuestionCreator.jsx';

export default function Create() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [timer, setTimer] = useState(30);
  const [optionCount, setOptionCount] = useState(4);
  const [boostersEnabled, setBoostersEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  const [finalQuestions, setFinalQuestions] = useState([]);
  const [manualQuestions, setManualQuestions] = useState([]);

  const handleAddFromAI = (qs) => setFinalQuestions(prev => [...prev, ...qs.map(q => ({ ...q, selected: undefined }))]);

  const addManualToFinal = () => {
    const valid = manualQuestions.filter(q => q.question.trim() && q.correct_answer.trim());
    if (!valid.length) return toast.error('Fill in at least question and correct answer');
    setFinalQuestions(prev => [...prev, ...valid]);
    setManualQuestions([]);
    toast.success(`${valid.length} manual questions added!`);
  };

  const removeQuestion = (id) => setFinalQuestions(prev => prev.filter(q => q.id !== id));

  const handleCreate = async () => {
    if (!topic.trim()) return toast.error('Please enter a quiz topic');
    if (!finalQuestions.length) return toast.error('Add at least one question');

    setLoading(true);
    try {
      const res = await api.post('/quizzes', {
        topic,
        difficulty,
        timerPerQuestion: timer,
        boostersEnabled,
        questions: finalQuestions.map(q => ({
          type: q.type,
          question: q.question,
          options: q.options?.slice(0, optionCount),
          correct_answer: q.correct_answer,
          difficulty: q.difficulty,
          subtopic: q.subtopic,
        })),
      });

      toast.success(`Quiz created! Code: ${res.data.code}`);
      navigate(`/quiz/${res.data.code}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-foreground">Create Your Quiz</h1>
          <p className="text-muted-foreground mt-1">Use AI, create manually, or combine both</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings */}
          <div className="card p-6 border-primary/30 h-fit">
            <h2 className="text-xl font-semibold mb-4">Quiz Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Quiz Topic</label>
                <input className="input" placeholder="e.g., World History, JavaScript"
                  value={topic} onChange={e => setTopic(e.target.value)} />
              </div>
              <div>
                <label className="label">Options per Question</label>
                <select className="input" value={optionCount} onChange={e => setOptionCount(parseInt(e.target.value))}>
                  {[2, 3, 4].map(n => <option key={n} value={n}>{n} Options</option>)}
                </select>
              </div>
              <div>
                <label className="label">Difficulty</label>
                <select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                  {['easy', 'medium', 'hard'].map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Time per Question (sec)</label>
                <input className="input" type="number" min={10} max={300}
                  value={timer} onChange={e => setTimer(parseInt(e.target.value) || 30)} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-primary/30">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Power Boosters</span>
                </div>
                <button onClick={() => setBoostersEnabled(p => !p)}
                  className={`w-11 h-6 rounded-full transition-colors ${boostersEnabled ? 'bg-primary' : 'bg-muted'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${boostersEnabled ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Question Creation */}
          <div className="card p-6 border-primary/30 lg:col-span-2">
            <div className="flex rounded-lg bg-muted p-1 mb-6">
              {[['ai', Sparkles, 'AI Generate'], ['manual', PenLine, 'Manual Entry']].map(([t, Icon, label]) => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === t ? 'bg-card text-foreground shadow' : 'text-muted-foreground'}`}>
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>

            {activeTab === 'ai' ? (
              <AIQuestionGenerator topic={topic} difficulty={difficulty} optionCount={optionCount} onAddQuestions={handleAddFromAI} />
            ) : (
              <div>
                <ManualQuestionCreator questions={manualQuestions} onQuestionsChange={setManualQuestions}
                  optionCount={optionCount} defaultDifficulty={difficulty} />
                {manualQuestions.length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <button onClick={addManualToFinal} className="btn-primary">
                      Add to Quiz ({manualQuestions.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Final Questions */}
        {finalQuestions.length > 0 ? (
          <div className="card p-6 border-accent/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Quiz Questions ({finalQuestions.length})</h2>
              <button onClick={handleCreate} disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Quiz'}
              </button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {finalQuestions.map((q, i) => (
                <div key={q.id} className="card p-4 border-border flex items-start gap-3">
                  <span className="text-muted-foreground text-sm w-6 flex-shrink-0">{i + 1}.</span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{q.question}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-green-400">✓ {q.correct_answer}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${q.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' : q.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                        {q.difficulty}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => removeQuestion(q.id)} className="text-muted-foreground hover:text-destructive">✕</button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card p-8 text-center border-dashed border-2 border-muted-foreground/20">
            <Wand2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Questions Yet</h3>
            <p className="text-muted-foreground text-sm">Generate questions with AI or create them manually.</p>
          </div>
        )}
      </div>
    </div>
  );
}
