import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { Button } from 'shared-ui';

import './App.css';

function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Restaurants site</h1>
      <div className="card">
        <Button
          onClick={() => setCount((_count) => _count + 1)}
          count={count}
        />
      </div>
    </>
  );
}

export default App;
