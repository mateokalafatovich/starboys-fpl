import Header from './layout/Header/Header';
import ProgressionChart from './components/ProgressionChart/ProgressionChart';
import RankingsProgressionChart from './components/ProgressionChart/RankingsProgressionChart';

function App() {
  return (
    <>
      <Header/>
      <br/>
      <ProgressionChart/> 
      <RankingsProgressionChart/>
    </>
  );
}

export default App
