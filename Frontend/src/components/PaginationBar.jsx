import React from 'react';
import { Pagination, Form } from 'react-bootstrap';

/**
 * Reusable pagination bar component.
 * Props: page, totalPages, totalItems, startItem, endItem, setPage, pageSize, setPageSize
 */
const PaginationBar = ({ page, totalPages, totalItems, startItem, endItem, setPage, pageSize, setPageSize }) => {
    if (totalItems === 0) return null;

    const pageSizeOptions = [10, 25, 50, 100];

    // Build page numbers to show (window of 5 around current)
    const getPageNumbers = () => {
        const pages = [];
        const delta = 2;
        const left = Math.max(1, page - delta);
        const right = Math.min(totalPages, page + delta);

        if (left > 1) {
            pages.push(1);
            if (left > 2) pages.push('...');
        }
        for (let i = left; i <= right; i++) pages.push(i);
        if (right < totalPages) {
            if (right < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3 px-1">
            <div className="d-flex align-items-center gap-2">
                <small className="text-muted">
                    Mostrando <strong>{startItem}–{endItem}</strong> de <strong>{totalItems}</strong>
                </small>
                <Form.Select
                    size="sm"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    style={{ width: 'auto' }}
                >
                    {pageSizeOptions.map(s => (
                        <option key={s} value={s}>{s} por página</option>
                    ))}
                </Form.Select>
            </div>

            <Pagination className="mb-0" size="sm">
                <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />
                {getPageNumbers().map((p, i) =>
                    p === '...'
                        ? <Pagination.Ellipsis key={`e-${i}`} disabled />
                        : <Pagination.Item key={p} active={p === page} onClick={() => setPage(p)}>{p}</Pagination.Item>
                )}
                <Pagination.Next disabled={page === totalPages} onClick={() => setPage(page + 1)} />
            </Pagination>
        </div>
    );
};

export default PaginationBar;
