import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import AlphabetFilter from '../components/AlphabetFilter'
import PosterGrid from '../components/PosterGrid'
import { compareMovies, isWishlistMovie } from '../lib/movies'
import { useMovies } from '../lib/movies-context'

function letterOf(title: string) {
  const c = title.trim()[0]?.toUpperCase() ?? '#'
  return /[A-ZÅÄÖ]/.test(c) ? c : '#'
}

export default function WishlistPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { movies, loading } = useMovies()

  const letter = searchParams.get('letter')

  const wishlist = useMemo(
    () =>
      movies.filter((m) => isWishlistMovie(m)).sort((a, b) => compareMovies(a, b, 'title', 'asc')),
    [movies],
  )

  const filtered = useMemo(
    () => wishlist.filter((m) => !letter || letterOf(m.title) === letter),
    [wishlist, letter],
  )

  function handleLetterSelect(l: string | null) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (l) next.set('letter', l)
      else next.delete('letter')
      return next
    })
  }

  return (
    <div>
      <h1 className="text-xl font-medium mb-4">Önskelista</h1>

      {loading ? (
        <div role="status" className="text-text-muted text-sm">
          Laddar...
        </div>
      ) : (
        <>
          <AlphabetFilter active={letter} onSelect={handleLetterSelect} disabled={false} />
          <PosterGrid
            movies={filtered}
            emptyMessage={
              wishlist.length === 0
                ? 'Önskelistan är tom. Lägg till en plats som heter "Önskelista" under Inställningar och sätt filmer dit.'
                : 'Inga filmer matchar bokstaven.'
            }
          />
        </>
      )}
    </div>
  )
}
