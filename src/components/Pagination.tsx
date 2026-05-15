import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    itemName?: string;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalCount,
    itemsPerPage,
    onPageChange,
    itemName = 'items'
}) => {
    if (totalCount === 0 || totalPages <= 1) return null;
    
    const handlePageChange = (page: number) => {
        if (page === currentPage) return;
        onPageChange(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
            <p className="text-muted text-sm font-medium">
                Showing <span className="text-foreground">{Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}</span> to{' '}
                <span className="text-foreground">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of{' '}
                <span className="text-foreground">{totalCount}</span> {itemName}
            </p>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${currentPage === 1
                        ? 'bg-muted/5 border-border text-muted/30 cursor-not-allowed'
                        : 'bg-card border-border text-foreground hover:bg-muted/10'
                        }`}
                >
                    Previous
                </button>
                <div className="flex items-center space-x-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                        .map((page, index, array) => (
                            <React.Fragment key={page}>
                                {index > 0 && array[index - 1] !== page - 1 && (
                                    <span className="text-muted font-bold px-1">...</span>
                                )}
                                <button
                                    onClick={() => handlePageChange(page)}
                                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === page
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                                        : 'bg-card text-muted hover:bg-muted/10 hover:text-primary border border-border'
                                        }`}
                                >
                                    {page}
                                </button>
                            </React.Fragment>
                        ))}
                </div>
                <button
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${currentPage === totalPages
                        ? 'bg-muted/5 border-border text-muted/30 cursor-not-allowed'
                        : 'bg-card border-border text-foreground hover:bg-muted/10'
                        }`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Pagination;
