import { useEffect, useState } from 'react';
import Header from './layout/Header/Header';
import ProgressionChart from './components/ProgressionChart/ProgressionChart';

function App() {
  return (
    <>
      <Header/>
      <main>
        <ProgressionChart/> 
      </main>
    </>
  );
}

export default App
