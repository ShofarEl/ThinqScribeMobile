import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import AppLoader from './AppLoader';

/**
 * ProtectedRoute Component
 *
 * This component acts as a gatekeeper for routes that require authentication.
 * It uses the `useAuth` hook to access the authentication state.
 *
 * If the user is authenticated and not loading, it renders the `children` (the protected content).
 * If the authentication status is still loading, it uses the global app loader.
 * If the user is not authenticated, it redirects them to the '/signin' page.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be rendered if the user is authenticated.
 * @param {string} [props.allowedRoles] - Optional. A single role string or an array of roles.
 * If provided, the user must have one of these roles to access the route.
 * If not provided, any authenticated user can access.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated, checkAuthStatus } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!authChecked && !loading) {
      checkAuthStatus()
        .then(() => {
          // Reduced delay to prevent double loader overlap
          setTimeout(() => {
            setAuthChecked(true);
          }, 100);
        })
        .catch(() => {
          setTimeout(() => {
            setAuthChecked(true);
          }, 100);
        });
    }
  }, [authChecked, loading, checkAuthStatus]);

  // Show loader while checking authentication
  if (loading || !authChecked) {
    return (
      <AppLoader 
        fullScreen={true}
        tip="Verifying access..."
        size="large"
        showIcon={true}
        showTip={true}
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles) {
    const userRole = user?.role;
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!userRole || !rolesArray.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  // Use Fragment to preserve context
  return <React.Fragment>{children}</React.Fragment>;
};

export default ProtectedRoute;