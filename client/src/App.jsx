import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-background text-gray-100">
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard/:owner/:repo" element={<Dashboard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
