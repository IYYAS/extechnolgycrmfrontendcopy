import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
            <Sidebar />
            <main style={{
                marginLeft: '280px',
                padding: '2rem',
                minHeight: '100vh',
                width: 'calc(100% - 280px)'
            }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
