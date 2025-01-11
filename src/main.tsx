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
import PrivateRoute from './components/privateRoute';

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <StrictMode>
      <Router>
        <Routes>
          <Route path='/' element={<Feed />} />
          <Route path='/signin' element={<Signin />} />
          <Route path='/signup' element={<Signup />} />
          <Route element={<PrivateRoute />}>
            <Route path='/feed/:des' element={<Feed />} />
            <Route path='/profile' element={<ProfileCard />} />
          </Route>
          <Route path='/*' element={<NotFound />} />
        </Routes>
      </Router>
      <ToastContainer
        position='top-right'
        autoClose={5000}
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

