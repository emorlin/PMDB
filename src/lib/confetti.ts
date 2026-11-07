// Konfetti ska visas varje besök på 31 januari. Missade man den dagen helt
// (ingen inloggad visning alls) visas den istället en gång vid nästa
// inloggade besök senare samma år, och sen inte igen förrän nästa 31 januari.
export function shouldShowConfetti(now: Date, lastShownYear: string | null): boolean {
  const isJan31 = now.getMonth() === 0 && now.getDate() === 31
  if (isJan31) return true

  // Första gången funktionen någonsin körs (t.ex. direkt efter att featuren
  // driftsätts, mitt i året) finns ingen sparad flagga alls. Det ska INTE
  // tolkas som att årets 31 januari missades – annars visas konfetti direkt
  // vid driftsättning istället för att vänta in nästa 31 januari. Se
  // JubileeConfetti.tsx, som sätter flaggan även i detta fall utan att visa
  // konfetti, så att framtida år fortfarande kan räknas som missade.
  if (lastShownYear === null) return false

  const year = now.getFullYear()
  const pastJan31ThisYear = now >= new Date(year, 0, 31)
  const alreadyShownThisYear = lastShownYear === String(year)
  return pastJan31ThisYear && !alreadyShownThisYear
}
