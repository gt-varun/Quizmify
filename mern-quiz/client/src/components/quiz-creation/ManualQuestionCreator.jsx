import { Plus, Trash2 } from 'lucide-react';

export default function ManualQuestionCreator({ questions, onQuestionsChange, optionCount, defaultDifficulty }) {
  const addQuestion = () => {
    onQuestionsChange([...questions, {
      id: crypto.randomUUID(),
      type: 'multiple_choice',
      question: '',
      options: Array(optionCount).fill(''),
      correct_answer: '',
      difficulty: defaultDifficulty || 'medium',
    }]);
  };

  const update = (id, field, value) => {
    onQuestionsChange(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (id, idx, value) => {
    onQuestionsChange(questions.map(q => {
      if (q.id !== id) return q;
      const options = [...q.options];
      options[idx] = value;
      return { ...q, options };
    }));
  };

  const remove = (id) => onQuestionsChange(questions.filter(q => q.id !== id));

  return (
    <div className="space-y-4">
      <button onClick={addQuestion} className="btn-outline w-full flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Add Question
      </button>

      {questions.map((q, i) => (
        <div key={q.id} className="card p-4 border-primary/30 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Question {i + 1}</h4>
            <button onClick={() => remove(q.id)} className="text-destructive hover:text-destructive/80">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="label">Question Text</label>
            <textarea className="input resize-none" rows={2} placeholder="Enter your question..."
              value={q.question} onChange={e => update(q.id, 'question', e.target.value)} />
          </div>

          <div>
            <label className="label">Type</label>
            <select className="input" value={q.type} onChange={e => update(q.id, 'type', e.target.value)}>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="open_ended">Open Ended</option>
            </select>
          </div>

          {q.type === 'multiple_choice' && (
            <div>
              <label className="label">Options</label>
              <div className="space-y-2">
                {Array(optionCount).fill(0).map((_, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <input type="radio" name={`correct-${q.id}`} checked={q.correct_answer === q.options[j]}
                      onChange={() => update(q.id, 'correct_answer', q.options[j])}
                      className="text-primary" />
                    <input className="input" placeholder={`Option ${j + 1}`}
                      value={q.options[j] || ''} onChange={e => updateOption(q.id, j, e.target.value)} />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">Select the radio button next to the correct answer</p>
              </div>
            </div>
          )}

          {q.type === 'open_ended' && (
            <div>
              <label className="label">Correct Answer</label>
              <input className="input" placeholder="Correct answer" value={q.correct_answer}
                onChange={e => update(q.id, 'correct_answer', e.target.value)} />
            </div>
          )}

          <div>
            <label className="label">Difficulty</label>
            <select className="input" value={q.difficulty} onChange={e => update(q.id, 'difficulty', e.target.value)}>
              {['easy', 'medium', 'hard'].map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
