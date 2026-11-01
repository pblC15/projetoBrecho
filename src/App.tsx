import Seo from './components/Seo'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import Footer from './components/Footer'
import Header from './components/Header'
import Admin from './pages/Admin'
import Home from './pages/Home'
import ProductPage from './pages/ProductPage'

function AdminSeo() {
  const location = useLocation()
  return location.pathname.startsWith('/admin') ? <Seo title="Administração | Brechó Luz do Luar" description="Área administrativa privada." path="/admin" noIndex /> : null
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminSeo />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produto/:id" element={<ProductPage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Footer />
      <FloatingWhatsApp />
    </BrowserRouter>
  )
}
