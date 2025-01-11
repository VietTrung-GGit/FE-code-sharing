import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles
import './index.css';
import Landing from './pages/Landing';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import NotFound from './pages/Notfound';
import Feed from './pages/Feed';
import ProfileCard from './pages/Profile';
import ProtectedRoute from './components/privateRoute'; // Import the protected route component
import { AuthProvider } from './context/AuthContext';

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <StrictMode>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path='/' element={<Feed />} />
            <Route path='/signin' element={<Signin />} />
            <Route path='/signup' element={<Signup />} />

            {/* Protected routes wrapped with ProtectedRoute */}
            <Route
              path='/feed/:type'
              element={
                //<ProtectedRoute>
                <Feed />
                //</ProtectedRoute>
              }
            />
            <Route
              path='/profile'
              element={
                //<ProtectedRoute>
                <ProfileCard />
                //</ProtectedRoute>
              }
            />

            {/* Catch-all route for 404 */}
            <Route path='/*' element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>

      {/* Toast container */}
      <ToastContainer
        position='top-right'
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </StrictMode>,
  );
} else {
  console.error('Root element not found!');
}

