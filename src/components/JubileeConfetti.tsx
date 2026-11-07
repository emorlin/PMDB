import { useEffect, useRef } from 'react'
import { confetti, useReward } from 'react-rewards'
import { useJubilee } from '../lib/jubilee-context'

export default function JubileeConfetti() {
  const { isJubilee } = useJubilee()
  const anchorRef = useRef<HTMLSpanElement>(null)
  const { reward } = useReward(anchorRef, confetti, { count: 200 })

  useEffect(() => {
    if (isJubilee) reward()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isJubilee])

  return <span ref={anchorRef} aria-hidden="true" className="fixed top-0 left-1/2 pointer-events-none" />
}
