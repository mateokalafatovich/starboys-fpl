import ProgressionChart from '../../components/ProgressionChart/ProgressionChart';
import RankingsProgressionChart from '../../components/ProgressionChart/RankingsProgressionChart';

export default function SeasonalPage() {
  return (
    <>
    <div>
      <ProgressionChart />
    </div>
    <div>
      <RankingsProgressionChart/>
    </div>
    </>

  );
}