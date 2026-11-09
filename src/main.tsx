import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/m-plus-rounded-1c/400.css';
import '@fontsource/m-plus-rounded-1c/500.css';
import '@fontsource/m-plus-rounded-1c/700.css';
import '@fontsource/m-plus-rounded-1c/800.css';
import './styles/game.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
