import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import PublicLayout from './components/PublicLayout/PublicLayout.jsx';
import Home from './components/Home/Home.jsx';
import Login from './components/Login/Login.jsx';
import Signup from './components/Signup/Signup.jsx';
import Dashboard from './protected/Dashboard/Dashboard.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className='loading'>Loading...</div>;
  return user ? children : <Navigate to='/login' />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className='loading'>Loading...</div>;
  return user ? <Navigate to='/dashboard' /> : (
    <PublicLayout>{children}</PublicLayout>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<PublicRoute><Home /></PublicRoute>} />
          <Route path='/login' element={<PublicRoute><Login /></PublicRoute>} />
          <Route path='/signup' element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path='*' element={<Navigate to='/' />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
