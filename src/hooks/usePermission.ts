import { useState, useEffect } from 'react';

export const usePermission = () => {
    // Synchronously initialize state to avoid race conditions during navigation
    const [permissions, setPermissions] = useState<string[]>(() => {
        try {
            const stored = localStorage.getItem('permissions');
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    });
    const [role, setRole] = useState<string | null>(() => {
        // Prioritize 'active_role' set during welcome/role-selection
        const active = localStorage.getItem('active_role');
        if (active) return active;
        return localStorage.getItem('user_role');
    });

    useEffect(() => {
        // Still keep listener in case localStorage changes in another tab
        const handleStorageChange = () => {
            const stored = localStorage.getItem('permissions');
            if (stored) {
                try {
                    setPermissions(JSON.parse(stored));
                } catch (e) {
                    console.error('Failed to parse permissions', e);
                }
            }
            
            const active = localStorage.getItem('active_role') || localStorage.getItem('user_role');
            if (active) setRole(active);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const hasPermission = (requiredPermission: string | string[]) => {
        // SuperAdmin/is_superuser always has all permissions
        const isSuperUser = (() => {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    // Match any common admin flags
                    return parsed.is_superuser === true || parsed.is_admin === true || parsed.role?.toUpperCase() === 'SUPERADMIN';
                }
                return false;
            } catch { return false; }
        })();

        const currentRole = role?.toUpperCase();
        if (currentRole === 'SUPERADMIN' || isSuperUser) return true;
        
        const check = (req: string) => {
            const reqLower = req.toLowerCase();

            // Exact match
            if (permissions.map(p => p.toLowerCase()).includes(reqLower)) return true;

            // Smart matching: If checking for 'view_xxx', and user has 'add_xxx', 'change_xxx', etc., allow it
            if (reqLower.startsWith('view_')) {
                const modelName = reqLower.replace('view_', '');
                return permissions.some(p => p.toLowerCase().endsWith(modelName));
            }

            return false;
        };

        if (Array.isArray(requiredPermission)) {
            return requiredPermission.some(p => check(p));
        }
        
        return check(requiredPermission);
    };

    return { permissions, role, hasPermission };
};
