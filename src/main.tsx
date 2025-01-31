import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationsProvider } from './context/NotificationContext';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles
import './index.css';
import Landing from './pages/Landing';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import NotFound from './pages/Notfound';
import Feed from './pages/Feed';
import Test from './pages/Test';
import Notifications from './pages/Notifications';
import ProfileCard from './pages/Profile';
import ProfileTemp from './pages/Profiletemp';
import Groups from './pages/Groups';
import ProtectedRoute from './components/privateRoute'; // Import the protected route component
import { AuthUserProvider } from './context/AuthUserContext';
import PassReset from './pages/Passreset';
import PassNew from './pages/Passnew';

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <Router>
      <AuthUserProvider>
        <NotificationsProvider>
          <Routes>
            <Route path='/' element={<Landing />} />
            <Route path='/signin' element={<Signin />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/test' element={<Test />} />
            <Route path='/pass-reset' element={<PassReset />} />
            <Route path='/pass-new/:token' element={<PassNew />} />

            <Route
              path='/feed'
              element={
                <ProtectedRoute>
                  <Feed />
                </ProtectedRoute>
              }
            />
            <Route
              path='/feed/:type'
              element={
                <ProtectedRoute>
                  <Feed />
                </ProtectedRoute>
              }
            />
            <Route
              path='/profile'
              element={
                <ProtectedRoute>
                  <ProfileCard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/notifications'
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path='/profiletemp'
              element={
                <ProtectedRoute>
                  <ProfileTemp />
                </ProtectedRoute>
              }
            />
            <Route
              path='/groups'
              element={
                <ProtectedRoute>
                  <Groups />
                </ProtectedRoute>
              }
            />
            <Route path='/*' element={<NotFound />} />
          </Routes>
        </NotificationsProvider>
      </AuthUserProvider>
      <ToastContainer
        position='top-right'
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>,
  );
} else {
  console.error('Root element not found!');
}

