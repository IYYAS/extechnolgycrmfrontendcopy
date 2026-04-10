import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '../hooks/usePermission';
import { ShieldAlert, ArrowLeft, MessageSquare } from 'lucide-react';

interface PermissionGateProps {
    children: React.ReactNode;
    permission?: string | string[]; // Required permission codename(s)
}

const PermissionGate: React.FC<PermissionGateProps> = ({ children, permission }) => {
    const navigate = useNavigate();
    const { hasPermission } = usePermission();
    
    // If no permission specified, allow access
    if (!permission) return <>{children}</>;

    if (!hasPermission(permission)) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full animate-pulse"></div>
                    <div className="relative w-24 h-24 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-inner">
                        <ShieldAlert size={48} />
                    </div>
                </div>

                <div className="max-w-md space-y-4">
                    <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Access Restricted</h1>
                    <p className="text-muted font-medium leading-relaxed">
                        This role has no permission to access this module. 
                        Please contact your <span className="text-primary font-bold">Super Admin</span> to request access.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-6 py-3 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-2xl text-foreground font-bold transition-all hover:-translate-x-1"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                    <button
                        disabled
                        className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-bold opacity-60 cursor-not-allowed"
                    >
                        <MessageSquare size={18} />
                        Report to Admin
                    </button>
                </div>
                
                <div className="mt-12 pt-8 border-t border-border w-full max-w-xs opacity-50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                        RBAC Security Protocol v2.0
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default PermissionGate;
