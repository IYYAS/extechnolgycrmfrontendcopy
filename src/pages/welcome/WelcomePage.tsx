import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';

const WelcomePage: React.FC = () => {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    let user: any = {};
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) user = JSON.parse(storedUser);
    } catch (e) {
        console.error('WelcomePage: Failed to parse user data', e);
    }


    const { hasPermission } = usePermission();

    const handleRoleClick = (roleName: string) => {
        const roleKey = roleName.toUpperCase();
        localStorage.setItem('active_role', roleKey);
        
        // Smart Redirect: Find the best landing page the user actually has access to
        if (hasPermission('view_project')) {
            navigate('/dashboard');
        } else if (hasPermission('view_user')) {
            navigate('/users');
        } else if (hasPermission('view_employee')) {
            navigate('/employees');
        } else if (hasPermission('view_team')) {
            navigate('/teams');
        } else {
            // Default fallback if they have restricted access
            navigate('/profile');
        }
    };

    const allItems = (() => {
        const items = (user.roles || []).map((r: any) => ({
            label: typeof r === 'string' ? r : (r.name || r.label || 'Unknown Role'),
            isDesignation: false
        }));

        // Fallback for single role
        if (items.length === 0 && user.role) {
            items.push({ label: user.role, isDesignation: false });
        }

        // Emergency SuperAdmin access if no roles assigned
        if (items.length === 0 && user.is_superuser) {
            items.push({ label: 'SUPERADMIN (SYSTEM)', isDesignation: false });
        }

        return items;
    })();

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col items-center justify-center p-6 sm:p-12">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[70%] h-[70%] bg-primary/20 blur-[140px] rounded-full animate-pulse transition-all duration-[10s]"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[70%] h-[70%] bg-blue-500/20 blur-[140px] rounded-full animate-pulse [animation-delay:4s] transition-all duration-[10s]"></div>
                <div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s] transition-all duration-[10s]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            </div>

            <style>{`
                @keyframes fadeSlideDown {
                    from { opacity: 0; transform: translateY(-24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .anim-heading {
                    opacity: 0;
                    animation: fadeSlideDown 0.7s cubic-bezier(0.22,1,0.36,1) forwards;
                    animation-delay: 0.1s;
                }
                .anim-sub {
                    opacity: 0;
                    animation: fadeSlideDown 0.6s cubic-bezier(0.22,1,0.36,1) forwards;
                    animation-delay: 0.3s;
                }
                .anim-card {
                    opacity: 0;
                    animation: fadeSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) forwards;
                }
            `}</style>

            <div className="w-full max-w-3xl space-y-10">
                {/* Heading */}
                <div className={visible ? '' : 'invisible'}>
                    <h1 className="anim-heading text-5xl sm:text-7xl font-black tracking-tighter italic">
                        Welcome, <span className="text-primary">{user.first_name || user.username || 'Agent'}</span>.
                    </h1>
                    <p className="anim-sub text-muted text-base mt-3 font-medium">These are your allowed roles.</p>
                </div>

                {/* Role Cards */}
                <div className="flex flex-col gap-3">
                    {allItems.map((item: { label: string; isDesignation: boolean }, idx: number) => {
                        const isClickable = !item.isDesignation; // Everyone can click their role now
                        const delay = `${0.45 + idx * 0.1}s`;
                        return (
                            <div
                                key={idx}
                                onClick={() => !item.isDesignation && handleRoleClick(item.label)}
                                className={`anim-card group flex items-center justify-between px-6 py-4 rounded-2xl border backdrop-blur-md transition-all duration-300
                                    ${item.isDesignation
                                        ? 'bg-primary/10 border-primary/30 cursor-default'
                                        : isClickable
                                            ? 'bg-white/[0.04] border-white/10 cursor-pointer hover:bg-primary/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 active:scale-[0.99]'
                                            : 'bg-white/[0.04] border-white/10 cursor-default opacity-70'
                                    }`}
                                style={{ animationDelay: delay }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border
                                        ${item.isDesignation ? 'bg-primary/20 border-primary/30' : 'bg-white/5 border-white/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300'}`}>
                                        <Shield size={18} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-black uppercase tracking-widest ${item.isDesignation ? 'text-primary' : 'text-foreground'}`}>
                                            {item.label}
                                        </p>
                                        {!item.isDesignation && isClickable && (
                                            <p className="text-[11px] text-muted font-medium mt-0.5">Click to enter as this role</p>
                                        )}
                                    </div>
                                </div>
                                {isClickable && (
                                    <ArrowRight size={18} className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
