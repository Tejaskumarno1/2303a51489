import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import { setAuthToken } from '../../logging-middleware/src/logger';

setAuthToken(import.meta.env.VITE_TOKEN || "");

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
