import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './lib/theme-context.tsx'
import { MoviesProvider } from './lib/movies-context.tsx'

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPublishableKey) {
  console.warn(
    'VITE_CLERK_PUBLISHABLE_KEY saknas. Inloggning (lägg till/redigera/ta bort) kommer inte att fungera.',
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey ?? ''}>
      <ThemeProvider>
        <MoviesProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MoviesProvider>
      </ThemeProvider>
    </ClerkProvider>
  </StrictMode>,
)
