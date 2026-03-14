import { Link } from 'react-router-dom';
import { Brain, Zap, Users, Trophy, ArrowRight, Sparkles, Shield, BarChart3 } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" /> AI-Powered Quiz Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Create Smart Quizzes
            </span>
            <br />
            <span className="text-foreground">in Seconds</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Generate intelligent quizzes with AI, share them instantly with unique codes,
            and track real-time results with detailed analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create">
              <button className="btn-primary flex items-center gap-2 px-8 py-4 text-lg group">
                <Zap className="w-5 h-5" /> Create Quiz
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <Link to="/join">
              <button className="btn-outline flex items-center gap-2 px-8 py-4 text-lg group">
                <Users className="w-5 h-5" /> Join Quiz
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">FEATURES</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete quiz platform with powerful features for creators and participants alike.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Generation',
                desc: 'Generate high-quality questions instantly using advanced AI. Just enter a topic and get a full quiz ready.',
                gradient: 'from-primary to-accent',
              },
              {
                icon: Zap,
                title: 'Instant Sharing',
                desc: 'Create quizzes and share them in seconds with unique 6-character codes. No sign-up required for participants.',
                gradient: 'from-secondary to-primary',
              },
              {
                icon: BarChart3,
                title: 'Real-Time Analytics',
                desc: 'Track live leaderboards, see participant scores, and get detailed performance reports after each quiz.',
                gradient: 'from-accent to-primary',
              },
            ].map(({ icon: Icon, title, desc, gradient }) => (
              <div key={title} className="card p-6 group hover:border-primary/30 transition-all duration-300">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} mb-4 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">HOW IT WORKS</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Three Simple Steps</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create', desc: 'Set your topic, choose settings, and generate questions with AI or write your own.', icon: Sparkles },
              { step: '02', title: 'Share', desc: 'Share the unique 6-character quiz code with your students, friends, or colleagues.', icon: Users },
              { step: '03', title: 'Analyze', desc: 'Watch live results, view detailed analytics, and track performance over time.', icon: Trophy },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">{step}</p>
                <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Power Boosters / Extra Features */}
      <section className="py-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">GAME MECHANICS</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Power Boosters & Streaks
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Make quizzes exciting with power boosters like 2x Points, Time Freeze, 50/50 elimination,
                and streak bonuses. Every quiz becomes a thrilling competition.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Zap, label: '2x Points', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
                  { icon: Shield, label: 'Streak Freeze', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
                  { icon: Trophy, label: 'Leaderboards', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
                  { icon: BarChart3, label: 'Analytics', color: 'text-green-500 bg-green-500/10 border-green-500/20' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border ${color}`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-8 border-primary/20">
              <div className="space-y-4">
                {['AI generates questions from any topic', 'Multiple choice & open-ended support', 'Adjustable difficulty and timers', 'Real-time live leaderboards', 'Comprehensive post-quiz reports', 'Host analytics dashboard'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6 animate-glow">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Create Your First Quiz?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Start for free. Create your first AI-powered quiz in under a minute.
          </p>
          <Link to="/create">
            <button className="btn-primary px-10 py-4 text-lg group">
              Get Started Free
              <ArrowRight className="w-5 h-5 inline ml-2 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Quizmify</span>
          </div>
          <p className="text-sm text-muted-foreground">Built for the brilliant</p>
        </div>
      </footer>
    </div>
  );
}
