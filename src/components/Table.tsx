import React from 'react';

export const Table = ({ children, style, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', ...style }} {...props}>
            {children}
        </table>
    </div>
);

export const Thead = ({ children, style, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)', ...style }} {...props}>
        {children}
    </thead>
);

export const Tbody = ({ children, style, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody style={style} {...props}>
        {children}
    </tbody>
);

export const Tr = ({ children, style, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr style={{ borderBottom: '1px solid var(--color-border-light)', transition: 'background 0.2s', ...style }}
        onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
        }}
        {...props}
    >
        {children}
    </tr>
);

export const Th = ({ children, style, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.875rem', ...style }} {...props}>
        {children}
    </th>
);

export const Td = ({ children, style, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td style={{ padding: '1rem', color: 'var(--color-text)', fontSize: '0.9rem', ...style }} {...props}>
        {children}
    </td>
);
