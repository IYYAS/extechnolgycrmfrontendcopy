import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
    requiredRoles?: string[];
}

const ProtectedRoute = ({ requiredRoles }: ProtectedRouteProps) => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('token') || localStorage.getItem('isLoggedIn');

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If no specific roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
        return <Outlet />;
    }

    // Check user role
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const is_superuser = user?.is_superuser;
    const is_admin = user?.is_admin;

    // SuperAdmin has access to everything
    if (is_superuser) {
        return <Outlet />;
    }

    // Check if user has required role
    const hasRequiredRole = requiredRoles.some(role => {
        if (role === 'admin' && is_admin) return true;
        if (role === 'superuser' && is_superuser) return true;
        if (role === 'Developer' && user?.role === 'Developer') return true;
        if (role.toLowerCase() === 'billing' && user?.role === 'Billing') return true;
        return false;
    });

    if (hasRequiredRole) {
        return <Outlet />;
    }

    // If user doesn't have required role, redirect them to the first available page
    // Billing users go to /billing, others to /projects
    if (user?.role === 'Billing') {
        return <Navigate to="/billing" replace />;
    }
    return <Navigate to="/projects" replace />;
};

export default ProtectedRoute;
