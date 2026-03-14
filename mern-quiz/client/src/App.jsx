import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar.jsx';
import Index from './pages/Index.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Create from './pages/Create.jsx';
import Join from './pages/Join.jsx';
import Quiz from './pages/Quiz.jsx';
import Play from './pages/Play.jsx';
import Results from './pages/Results.jsx';
import HostResults from './pages/HostResults.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';

const HIDE_NAVBAR_PATTERNS = ['/play/'];

export default function App() {
  const location = useLocation();
  const showNavbar = !HIDE_NAVBAR_PATTERNS.some(p => location.pathname.startsWith(p));

  return (
    <>
      <Toaster richColors position="top-right" />
      {showNavbar && <Navbar />}
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
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
