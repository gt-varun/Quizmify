import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Sparkles, RefreshCw, Check } from 'lucide-react';
import api from '../../lib/api.js';

export default function AIQuestionGenerator({ topic, difficulty, optionCount, onAddQuestions }) {
  const [questions, setQuestions] = useState([]);
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return toast.error('Please enter a quiz topic first');
    setLoading(true);
    try {
      const res = await api.post('/ai/generate-questions', { topic, questionCount: count, difficulty, optionCount });
      const withIds = res.data.questions.map(q => ({
        ...q,
        id: crypto.randomUUID(),
        selected: false,
        options: q.options || Array(optionCount).fill(''),
      }));
      setQuestions(prev => [...prev, ...withIds]);
      toast.success(`${res.data.questions.length} questions generated!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) => setQuestions(prev => prev.map(q => q.id === id ? { ...q, selected: !q.selected } : q));
  const selectAll = () => setQuestions(prev => prev.map(q => ({ ...q, selected: true })));
  const deselectAll = () => setQuestions(prev => prev.map(q => ({ ...q, selected: false })));

  const addSelected = () => {
    const selected = questions.filter(q => q.selected);
    if (!selected.length) return toast.error('Select at least one question');
    onAddQuestions(selected);
    setQuestions(prev => prev.filter(q => !q.selected));
    toast.success(`${selected.length} questions added!`);
  };

  const selectedCount = questions.filter(q => q.selected).length;

  return (
    <div className="space-y-6">
      <div className="card p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/30">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="label">Generate Count</label>
            <input type="number" min={1} max={20} value={count}
              onChange={e => setCount(parseInt(e.target.value) || 10)}
              className="input" />
          </div>
          <button onClick={generate} disabled={loading || !topic.trim()} className="btn-primary flex items-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate</>}
          </button>
          {questions.length > 0 && (
            <button onClick={generate} disabled={loading} className="btn-outline flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> More
            </button>
          )}
        </div>
      </div>

      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Generated ({questions.length})</h3>
              <span className="text-sm text-primary">{selectedCount} selected</span>
            </div>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-sm text-muted-foreground hover:text-foreground">Select All</button>
              <button onClick={deselectAll} className="text-sm text-muted-foreground hover:text-foreground">Deselect All</button>
              <button onClick={addSelected} disabled={!selectedCount}
                className="btn-primary text-sm px-3 py-1">
                Add Selected ({selectedCount})
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {questions.map((q, i) => (
              <div key={q.id} onClick={() => toggle(q.id)}
                className={`card p-4 cursor-pointer transition-all border ${q.selected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${q.selected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                    {q.selected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-2">Q{i + 1}. {q.question}</p>
                    {q.options?.length > 0 && (
                      <div className="grid grid-cols-2 gap-1">
                        {q.options.slice(0, optionCount).map((opt, j) => (
                          <div key={j} className={`text-xs px-2 py-1 rounded ${opt === q.correct_answer ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${q.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' : q.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                        {q.difficulty}
                      </span>
                      {q.subtopic && <span className="text-xs text-muted-foreground">{q.subtopic}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
