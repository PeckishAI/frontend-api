import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
import { Button } from 'shared-ui';
import viteLogo from '/vite.svg';

import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://192.168.2.1:8080/')
      .then((res) => res.text())
      .then((text) => setMessage(text));
  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer noopener">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer noopener">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Supplier Site -- {message}</h1>
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
