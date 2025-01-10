import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { refreshAccessToken } from '../services/authService';

const PrivateRoute: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuthentication = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    // Try refreshing the token to ensure it's valid
                    await refreshAccessToken();
                    setIsAuthenticated(true);
                } catch (error) {
                    setIsAuthenticated(false);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            } else {
                setIsAuthenticated(false);
            }
        };

        checkAuthentication();
    }, []);

    if (isAuthenticated === null) {
        return <div>Loading...</div>; // Show a loading spinner or similar while checking authentication
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;
