import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import MovieTablePage from './pages/MovieTablePage'
import DiscoverPage from './pages/DiscoverPage'
import MovieDetailPage from './pages/MovieDetailPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<MovieTablePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
      </Route>
    </Routes>
  )
}

export default App
