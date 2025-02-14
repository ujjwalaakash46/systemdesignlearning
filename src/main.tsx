import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './provider/theme-provider.tsx'
import { AuthProvider } from './provider/AuthProvider.tsx'
import { supabase } from './utils/supabase.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider supabase={supabase}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
)
