import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <main className="flex-1 relative overflow-y-auto focus:outline-none">
                <div className="py-6 h-full">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-full">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
