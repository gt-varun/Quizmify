export const BOOSTER_INFO = {
  double_points: { name: '2x Points', description: 'Double your points for this question', icon: '⚡', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  double_jeopardy: { name: 'Double Jeopardy', description: 'Double points if right, lose points if wrong', icon: '🎰', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  time_freeze: { name: 'Time Freeze', description: 'Stop the timer for this question', icon: '❄️', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  streak_freeze: { name: 'Streak Freeze', description: 'Protect your streak even if wrong', icon: '🛡️', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  eraser: { name: 'Eraser', description: 'Remove one wrong answer', icon: '✏️', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  vaccine: { name: '50/50', description: 'Remove two wrong answers', icon: '💉', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
};

export const generateRandomBoosters = () => {
  const types = Object.keys(BOOSTER_INFO);
  const shuffled = types.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(type => ({ id: crypto.randomUUID(), type, used: false }));
};

export default function PowerBoosters({ boosters, onUseBooster, disabled, activeBooster, isMultipleChoice }) {
  if (!boosters?.length) return null;

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2 font-medium">Power Boosters</p>
      <div className="flex flex-wrap gap-2">
        {boosters.map(b => {
          const info = BOOSTER_INFO[b.type];
          const canUse = !b.used && !disabled;
          const isEraserType = b.type === 'eraser' || b.type === 'vaccine';
          const disabledEraser = isEraserType && !isMultipleChoice;

          return (
            <button key={b.id} disabled={!canUse || disabledEraser}
              onClick={() => canUse && !disabledEraser && onUseBooster(b.id, b.type)}
              title={info.description}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all
                ${b.used ? 'opacity-30 cursor-not-allowed bg-muted border-border' : info.color}
                ${canUse && !disabledEraser ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed'}
                ${activeBooster === b.type ? 'ring-2 ring-offset-1 ring-current' : ''}`}>
              <span>{info.icon}</span>
              <span>{info.name}</span>
              {b.used && <span className="text-xs opacity-60">(used)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
