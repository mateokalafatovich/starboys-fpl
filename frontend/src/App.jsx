import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './layout/Header/Header';
import GameweekPage from './pages/GameweekPage/GameweekPage';
import WeeklyPage from './pages/WeeklyPage/WeeklyPage';
import SeasonalPage from './pages/SeasonalPage/SeasonalPage';

function App() {
  return (
    <>
      <Header/>
      <br/>
      <Routes>
        <Route path="/" element={<Navigate to="/gameweek" replace />} />
        <Route path="/gameweek" element={<GameweekPage />} />
        <Route path="/weekly" element={<WeeklyPage />} />
        <Route path="/seasonal" element={<SeasonalPage />} />
      </Routes>
    </>
  );
}

export default App
