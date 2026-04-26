import { BrowserRouter, Route, Routes} from 'react-router-dom' 

import Navbar from '../components/Navbar/Navbar.jsx'
import Home from '../components/Home/Home.jsx'
import Login from '../components/Login/Login.jsx'
import SignUp from '../components/SignUp/SignUp.jsx'
import ContactUs from '../components/ContactUs/ContactUs.jsx'
import Footer from '../components/Footer/Footer.jsx'
import EmailSent from '../components/VerifyEmailSent/VerifyEmailSent.jsx'

import ProtectedRoute from '../protected-components/ProtectedRoutes.jsx'
import Dashboard from '../protected-components/Dashboard/Dashboard.jsx'

import { AuthProvider } from '../contexts/AuthContext.jsx'

import './App.css'
import PublicRoute from '../components/PublicRoute.jsx'

const App = () => {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
          <Routes>

            <Route path="/" element={
              <PublicRoute>
                <Home />
              </PublicRoute>
            } />
            <Route path="/contact" element={
              <PublicRoute>
                <ContactUs />
              </PublicRoute>
            } />
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            } />
            <Route path="/verify-sent" element={
              <PublicRoute>
                <EmailSent />
              </PublicRoute>
            } />

            <Route 
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

          </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
