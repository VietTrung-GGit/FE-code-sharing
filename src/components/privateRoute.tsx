import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthUser } from '../context/AuthUserContext';
import Logo from '../assets/logo.svg';
import LoadingSpinner from '../components/loadingAnimate';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, authLoading } = useAuthUser();

  if (authLoading) {
    return (
      <div className='flex flex-col text-lg justify-center bg-Background/Bottom items-center text-Accent/Light h-screen'>
        <img src={Logo} alt='CoDash Logo' className='w-10 h-auto m-2' />
        <p>Loading page...</p>
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/signin' replace />;
  }

  return <Outlet />; // This allows nested routes to be rendered inside <ProtectedRoute>
};

export default ProtectedRoute;

