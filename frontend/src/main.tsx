import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './api/axios';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 5000,
          }}
          containerStyle={{
            right: 20,
            bottom: 20,
          }}
      />
        <App />
    </BrowserRouter>
  </StrictMode>,
)
