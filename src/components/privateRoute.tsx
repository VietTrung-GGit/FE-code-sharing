import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthUser } from '../context/AuthUserContext';
import Logo from '../assets/logo.svg';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, authLoading } = useAuthUser();

  if (authLoading) {
    // Render a loading spinner or skeleton
    return (
      <div className='flex flex-col text-lg justify-center bg-Background/Bottom items-center text-Accent/Light h-screen'>
        <img src={Logo} alt='CoDash Logo' className='w-10 h-auto m-2' />
        <p>Loading page...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/signin' replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;

