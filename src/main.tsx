import { StrictMode } from 'react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import './index.css';
import Landing from './pages/Landing';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import NotFound from './pages/Notfound';
import Home from './pages/Home';
import Community from './pages/Community';
import Saved from './pages/Saved';
import Test from './pages/Test';
import ProfileCard from './pages/Profile';
import axios from 'axios';

// Interceptor for handling token expiration globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle Unauthorized error (e.g., token expired)
      localStorage.removeItem('authToken');
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route index element={<Landing/>} /> {/*change back to Landing later*/}
          <Route path='signin' element={<Signin />} />
          <Route path='signup' element={<Signup />} />
          <Route path='home' element={<Home />} />
          <Route path='community' element={<Community  />} />
          <Route path='saved' element={<Saved />} />
          <Route path='test' element={<Test />} />
          <Route path='profile' element={<ProfileCard />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>,
  );
} else {
  console.error('Root element not found!');
}
