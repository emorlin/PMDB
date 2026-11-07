import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useUser } from '@clerk/clerk-react'
import { shouldShowConfetti } from './confetti'

const CONFETTI_YEAR_KEY = 'pmdb-confetti-year'

interface JubileeContextValue {
  // True resten av besöket när konfetti/rubrikbytet ska visas. Avgörs en gång
  // per inloggat besök och delas mellan konfettin och rubriken så de alltid
  // är i synk (annars skulle båda läsa/skriva samma localStorage-nyckel var
  // för sig och kunna råka ur synk med varandra).
  isJubilee: boolean
  // Manuell testtrigger (se "Mathias" i footern, AppLayout.tsx) – beter sig
  // som en riktig 31 januari för resten av besöket, men rör aldrig
  // localStorage, så den kan klickas om och om igen för att testa.
  triggerJubilee: () => void
}

const JubileeContext = createContext<JubileeContextValue | null>(null)

export function JubileeProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser()
  const [isJubilee, setIsJubilee] = useState(false)
  const decided = useRef(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || decided.current) return
    decided.current = true

    const now = new Date()
    const lastShownYear = localStorage.getItem(CONFETTI_YEAR_KEY)
    const fire = shouldShowConfetti(now, lastShownYear)

    if (fire) setIsJubilee(true)
    // Sätts även när vi inte visar något men det är allra första körningen
    // (lastShownYear null) – se shouldShowConfetti för varför.
    if (fire || lastShownYear === null) {
      localStorage.setItem(CONFETTI_YEAR_KEY, String(now.getFullYear()))
    }
  }, [isLoaded, isSignedIn])

  function triggerJubilee() {
    setIsJubilee(true)
  }

  return <JubileeContext.Provider value={{ isJubilee, triggerJubilee }}>{children}</JubileeContext.Provider>
}

export function useJubilee() {
  const ctx = useContext(JubileeContext)
  if (!ctx) throw new Error('useJubilee måste användas inom JubileeProvider')
  return ctx
}
