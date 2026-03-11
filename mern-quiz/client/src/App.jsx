import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Index from './pages/Index.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Create from './pages/Create.jsx';
import Join from './pages/Join.jsx';
import Quiz from './pages/Quiz.jsx';
import Play from './pages/Play.jsx';
import Results from './pages/Results.jsx';
import HostResults from './pages/HostResults.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<Create />} />
        <Route path="/join" element={<Join />} />
        <Route path="/quiz/:code" element={<Quiz />} />
        <Route path="/play/:code/:participantId" element={<Play />} />
        <Route path="/results/:code/:participantId" element={<Results />} />
        <Route path="/host-results/:code" element={<HostResults />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
