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
import PostView from './pages/PostView';
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

const ProtectedRouteWrapper = (Component: React.FC) => (
  <ProtectedRoute>
    <Component />
  </ProtectedRoute>
);

if (root) {
  ReactDOM.createRoot(root).render(
    <Router>
      <AuthUserProvider>
        <NotificationsProvider>
          <Routes>
            {/* Public Routes */}
            <Route path='/' element={<Landing />} />
            <Route path='/signin' element={<Signin />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/test' element={<Test />} />
            <Route path='/pass-reset' element={<PassReset />} />
            <Route path='/pass-new/:token' element={<PassNew />} />

            {/* Protected Routes */}
            <Route path='/community' element={ProtectedRouteWrapper(Community)} />
            <Route path='/feed' element={ProtectedRouteWrapper(Feed)} />
            <Route path='/saves' element={ProtectedRouteWrapper(Feed)} />
            {/* <Route path='/profile' element={ProtectedRouteWrapper(ProfileCard)} /> */}
            <Route path='/project/:projectId' element={ProtectedRouteWrapper(ProjectDashboard)} />
            <Route path='/project' element={ProtectedRouteWrapper(ProjectDashboard)} />
            <Route path='/notifications' element={ProtectedRouteWrapper(Notifications)} />
            <Route path='/profiletemp' element={ProtectedRouteWrapper(ProfileTemp)} />
            <Route path='/post/:postId' element={ProtectedRouteWrapper(PostView)} />

            {/* Nested Community Routes */}
            <Route path='/community' element={ProtectedRouteWrapper(Community)}>
              <Route path='posts' element={<Community />} />
              <Route path='users' element={<Community />} />
              <Route path='groups' element={<Community />} />
              <Route path='projects' element={<Community />} />
            </Route>

            <Route path='/group/:groupId' element={ProtectedRouteWrapper(GroupDashboard)}>
              <Route path='posts' element={<GroupDashboard />} />
              <Route path='members' element={<GroupDashboard />} />
              <Route path='projects' element={<GroupDashboard />} />
              <Route path='myposts' element={<GroupDashboard />} />
              <Route path='pendingposts' element={<GroupDashboard />} />
            </Route>

            <Route path='/user/:userId' element={ProtectedRouteWrapper(UserDashboard)}>
              <Route path='posts' element={<UserDashboard />} />
              <Route path='followers' element={<UserDashboard />} />
              <Route path='projects' element={<UserDashboard />} />
              <Route path='groups' element={<UserDashboard />} />
            </Route>

            <Route path='/project/:projectId' element={ProtectedRouteWrapper(ProjectDashboard)}>
              <Route path=':sectionId' element={<ProjectDashboard />} />
              <Route path='members' element={<ProjectDashboard />} />
            </Route>

            {/* 404 Page */}
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

