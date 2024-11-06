import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import MainTicketPage from './pages/main_ticket'
import AdminTicketPage from './pages/admin_barber'
import ProtectedRoute from './components/protectedRoute'
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainTicketPage />} />
        <Route path="/admin" element={<ProtectedRoute> <AdminTicketPage /> </ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App
