import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { jwtDecode } from "jwt-decode";

// Define the types for the user context
interface UserContextType {
    userId: string | null;
    username: string | null;
    displayname: string | null;
    avatarUrl: string | undefined;
    email: string | null;
    setUser: (user: User) => void;  // Function to set the user data
}

// Define the structure of the user data
interface User {
    userId: string | null;
    username: string | null;
    displayname: string | null;
    avatarUrl: string | undefined;
    email: string | null;
}

const defaultContextValue: UserContextType = {
    userId: null,
    username: null,
    displayname: null,
    avatarUrl: undefined,
    email: null,
    setUser: () => { },
};

// Create the context
const UserContext = createContext<UserContextType>(defaultContextValue);

// Custom hook to use the UserContext
export const useUser = () => useContext(UserContext);

// UserProvider component with children prop type
interface UserProviderProps {
    children: ReactNode; // Accepts any valid React children
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User>({
        userId: null,
        username: null,
        displayname: null,
        avatarUrl: undefined,
        email: null,
    });

    useEffect(() => {
        // On component mount, check if a token exists
        const token = localStorage.getItem('accessToken');
        if (token) {
            const decoded: { userId: string; username: string; displayname: string; avatarUrl: string; email: string } = jwtDecode(token);
            setUser({
                userId: decoded.userId,
                username: decoded.username,
                displayname: decoded.displayname,
                avatarUrl: decoded.avatarUrl,
                email: decoded.email,
            });
        }
    }, []);

    return (
        <UserContext.Provider value={{ ...user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};
