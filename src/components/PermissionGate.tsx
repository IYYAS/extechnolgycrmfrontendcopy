import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ROLES_PERMISSIONS } from '../pages/login/auth';

interface PermissionGateProps {
    children: React.ReactNode;
    path: string;
}

const PermissionGate: React.FC<PermissionGateProps> = ({ children, path }) => {
    const location = useLocation();
    const activeRole = localStorage.getItem('active_role');
    const storedUser = localStorage.getItem('user');
    
    let userRoles: string[] = [];
    let isSuperAdmin = false;
    
    try {
        if (storedUser) {
            const user = JSON.parse(storedUser);
            userRoles = (user.roles || []).map((r: any) => ((r.name || r) as string).toUpperCase());
            isSuperAdmin = user.is_superuser || userRoles.includes('SUPERADMIN');
        }
    } catch (e) {
        console.error('PermissionGate: Error parsing user', e);
    }

    // SuperAdmin always has access if no active role is set, 
    // or if they are in a view they have permission for.
    if (isSuperAdmin && !activeRole) return <>{children}</>;

    const effectiveRoles = activeRole ? [activeRole.toUpperCase()] : userRoles;
    
    const hasPermission = effectiveRoles.some(role => {
        const permissions = ROLES_PERMISSIONS[role] || [];
        return permissions.includes('*') || permissions.includes(path);
    });

    if (!hasPermission) {
        // Redirect to a safe page they HAVE permission for, or profile as fallback
        const permissions = ROLES_PERMISSIONS[effectiveRoles[0]] || [];
        const fallbackPath = permissions.length > 0 && permissions[0] !== '*' ? permissions[0] : '/profile';
        
        console.warn(`Access denied for path ${path}. Redirecting to ${fallbackPath}`);
        return <Navigate to={fallbackPath} replace state={{ from: location }} />;
    }

    return <>{children}</>;
};

export default PermissionGate;
