'use client';

import { CATEGORIES, Category } from '@/lib/video-data';

interface CategoryFilterProps {
    selectedCategory: Category | 'All';
    onSelectCategory: (category: Category | 'All') => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
    return (
        <aside style={{
            width: '260px',
            height: 'calc(100vh - 80px)', // adjust based on navbar height
            overflowY: 'auto',
            padding: '1.5rem',
            borderRight: '1px solid var(--border-color)',
            backgroundColor: 'var(--background-dark)',
            position: 'sticky',
            top: '80px',
            flexShrink: 0,
            display: 'none', // Hidden on mobile by default, handled by CSS media queries in a real app
        }} className="category-sidebar">

            <h3 style={{
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '1rem',
                letterSpacing: '1px'
            }}>
                Módulos SAP
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <button
                    onClick={() => onSelectCategory('All')}
                    style={{
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: selectedCategory === 'All' ? 'var(--background-hover)' : 'transparent',
                        color: selectedCategory === 'All' ? 'var(--primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontWeight: selectedCategory === 'All' ? 600 : 400
                    }}
                >
                    Todas las Píldoras
                </button>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => onSelectCategory(cat)}
                        style={{
                            textAlign: 'left',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: selectedCategory === cat ? 'var(--background-hover)' : 'transparent',
                            color: selectedCategory === cat ? 'var(--primary)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontWeight: selectedCategory === cat ? 600 : 400
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </aside>
    );
}
