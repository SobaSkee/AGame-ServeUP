import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { GeneratedRecipesProvider } from './context/GeneratedRecipesContext'
import { PantryScanProvider } from './context/PantryScanContext'
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PantryScanProvider>
          <GeneratedRecipesProvider>
            <App />
          </GeneratedRecipesProvider>
        </PantryScanProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
