
import React from 'react';
import ReactDOM from 'react-dom/client';
import { useState } from 'react';
import './index.css';
import LandingPage from './LandingPage.jsx';
import RunLabApp from './RunLabApp.jsx';

function App() {
  const [view, setView] = useState('landing');

  if (view === 'app') {
    return <RunLabApp onBack={() => setView('landing')} />;
  }

  return <LandingPage onLaunch={() => setView('app')} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
