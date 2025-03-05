import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationsProvider } from './context/NotificationContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import ProtectedRoute from './components/privateRoute';
import { AuthUserProvider } from './context/AuthUserContext';
import PassReset from './pages/Passreset';
import PassNew from './pages/Passnew';
import { PinnedProvider } from './context/PinnedContext';
import { ThemeProvider } from './context/ThemeContext';
const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <Router>
      <ThemeProvider>
        <AuthUserProvider>
          <NotificationsProvider>
            <PinnedProvider>
              <Routes>
                {/* Public Routes */}
                <Route path='/' element={<Landing />} />
                <Route path='/signin' element={<Signin />} />
                <Route path='/signup' element={<Signup />} />
                <Route path='/test' element={<Signin />} />
                <Route path='/test1' element={<UserDashboard active='Posts' />} />
                <Route path='/pass-reset' element={<PassReset />} />
                <Route path='/pass-new/:token' element={<PassNew />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path='/community'>
                    <Route path='' element={<Navigate to='/community/posts' />} />
                    <Route path='posts' element={<Community active='Posts' />} />
                    <Route path='users' element={<Community active='Users' />} />
                    <Route path='groups' element={<Community active='Groups' />} />
                    <Route path='projects' element={<Community active='Projects' />} />
                  </Route>
                  <Route path='/feed' element={<Feed type='feed' />} />
                  <Route path='/saves' element={<Feed type='stored' />} />
                  <Route path='/notifications' element={<Notifications />} />
                  <Route path='/post/:postId' element={<PostView />} />
                  <Route path='/group/:groupId'>
                    <Route path='' element={<GroupDashboard active='Posts' />} />
                    <Route path='posts' element={<GroupDashboard active='Posts' />} />
                    <Route path='members' element={<GroupDashboard active='Members' />} />
                    <Route path='projects' element={<GroupDashboard active='Projects' />} />
                    <Route path='myposts' element={<GroupDashboard active='My posts' />} />
                    <Route
                      path='pendingposts'
                      element={<GroupDashboard active='Pending posts' />}
                    />
                  </Route>
                  <Route path='/user/:userId'>
                    <Route path='' element={<UserDashboard active='Posts' />} />
                    <Route path='posts' element={<UserDashboard active='Posts' />} />
                    <Route path='users' element={<UserDashboard active='Users' />} />
                    <Route path='projects' element={<UserDashboard active='Projects' />} />
                    <Route path='groups' element={<UserDashboard active='Groups' />} />
                  </Route>
                  <Route path='/project/:projectId'>
                    <Route path='' element={<ProjectDashboard viewMember={false} />} />
                    <Route path='members' element={<ProjectDashboard viewMember={true} />} />
                    <Route path='sections/:sectionId'>
                      <Route
                        path=''
                        element={<ProjectDashboard viewMember={false} viewParticipant={false} />}
                      />
                      <Route
                        path='posts'
                        element={<ProjectDashboard viewMember={false} viewParticipant={false} />}
                      />
                      <Route
                        path='participants'
                        element={<ProjectDashboard viewMember={false} viewParticipant={true} />}
                      />
                    </Route>
                  </Route>
                </Route>

                {/* 404 Page */}
                <Route path='/*' element={<NotFound />} />
              </Routes>
            </PinnedProvider>
          </NotificationsProvider>
        </AuthUserProvider>
      </ThemeProvider>

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

