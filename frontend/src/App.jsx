import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './layout/Header/Header';
import SeasonalPage from './pages/SeasonalPage/SeasonalPage';
import GameweekPage from './pages/GameweekPage/GameweekPage';
import WeeklyPage from './pages/WeeklyPage/WeeklyPage';
import './App.css';

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/seasonal" replace />} />
          <Route path="/seasonal" element={<SeasonalPage />} />
          <Route path="/gameweek" element={<GameweekPage />} />
          <Route path="/weekly" element={<WeeklyPage />} />
          <Route path="*" element={<Navigate to="/seasonal" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App
