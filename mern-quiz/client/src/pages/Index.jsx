import { Link } from 'react-router-dom';
import { Brain, Zap, Users, Trophy, LogIn } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <Link to="/auth">
            <button className="btn-outline flex items-center gap-2">
              <LogIn className="w-4 h-4" /> Login / Sign Up
            </button>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary via-accent to-secondary mb-6 animate-glow">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-float">
              Quizmify
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Create intelligent quizzes in seconds. Share with anyone. Compete in real-time.
            </p>
            <p className="text-lg text-accent font-semibold italic">Built for the brilliant</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create">
              <button className="btn-primary flex items-center gap-2 px-8 py-4 text-lg shadow-lg shadow-primary/30 hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" /> Create Quiz
              </button>
            </Link>
            <Link to="/join">
              <button className="btn-outline flex items-center gap-2 px-8 py-4 text-lg hover:scale-105 transition-transform">
                <Users className="w-5 h-5" /> Join Quiz
              </button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {[
              { icon: Brain, title: 'AI-Powered', desc: 'Generate high-quality questions instantly using advanced AI', color: 'from-primary to-accent', border: 'border-primary/30 hover:border-primary/50 hover:shadow-primary/20' },
              { icon: Zap, title: 'Lightning Fast', desc: 'Create and share quizzes in seconds with unique codes', color: 'from-secondary to-accent', border: 'border-secondary/30 hover:border-secondary/50 hover:shadow-secondary/20' },
              { icon: Trophy, title: 'Real-Time', desc: 'Track participants and scores live as they compete', color: 'from-accent to-primary', border: 'border-accent/30 hover:border-accent/50 hover:shadow-accent/20' },
            ].map(({ icon: Icon, title, desc, color, border }) => (
              <div key={title} className={`card p-6 ${border} transition-all hover:shadow-lg group`}>
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${color} mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
