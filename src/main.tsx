import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationsProvider } from './context/NotificationContext';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles
import './index.css';
import Landing from './pages/Landing';
import 'react-tooltip/dist/react-tooltip.css';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import NotFound from './pages/Notfound';
import Community from './pages/Community';
import Feed from './pages/Feed';
import UserDashboard from './pages/UserDashboard';
import Test from './pages/Test';
import Notifications from './pages/Notifications';
import ProfileCard from './pages/Profile';
import ProfileTemp from './pages/Profiletemp';
import GroupDashboard from './pages/GroupDashboard';
import ProjectDashboard from './pages/ProjectDashboard';
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
            <Route path='/signup' element={<UserDashboard />} />
            <Route path='/test' element={<Test />} />
            <Route path='/pass-reset' element={<PassReset />} />
            <Route path='/pass-new/:token' element={<PassNew />} />
            <Route
              path='/community'
              element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              }
            />
            <Route
              path='/feed'
              element={
                <ProtectedRoute>
                  <Feed />
                </ProtectedRoute>
              }
            />
            <Route
              path='/saves'
              element={
                <ProtectedRoute>
                  <Feed />
                </ProtectedRoute>
              }
            />
            <Route
              path='/community/posts'
              element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              }
            />
            <Route
              path='/community/users'
              element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              }
            />
            <Route
              path='/community/groups'
              element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              }
            />
            <Route
              path='/community/projects'
              element={
                <ProtectedRoute>
                  <Community />
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
              path='/home'
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/project/:projectId'
              element={
                <ProtectedRoute>
                  <ProjectDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/project'
              element={
                <ProtectedRoute>
                  <ProjectDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/user/:userId'
              element={
                //<ProtectedRoute>
                <UserDashboard />
                //</ProtectedRoute>
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
              path='/group/:groupId'
              element={
                <ProtectedRoute>
                  <GroupDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/group'
              element={
                <ProtectedRoute>
                  <GroupDashboard />
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

