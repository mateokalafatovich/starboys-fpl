import { useEffect, useState } from 'react'

function App() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/health`)
      .then(res => res.json())
      .then(data => setStatus(data.status));
  }, [])

  return <div className='p-8 text-xl'>Backend status: {status}</div>
}

export default App
