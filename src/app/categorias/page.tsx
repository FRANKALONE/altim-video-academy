'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { getAllVideos, getCategories } from '@/app/actions';

type CategoryWithCount = {
    name: string;
    videoCount: number;
    thumbnail: string;
};

export default function CategoriasPage() {
    const [categories, setCategories] = useState<CategoryWithCount[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCategories = async () => {
            setLoading(true);
            const [dbCategories, dbVideos] = await Promise.all([getCategories(), getAllVideos()]);

            const categoriesWithCount: CategoryWithCount[] = dbCategories.map((catName: string) => {
                const videosInCategory = dbVideos.filter((v: any) => v.categories?.includes(catName));
                const firstVideo = videosInCategory[0];

                return {
                    name: catName,
                    videoCount: videosInCategory.length,
                    thumbnail: firstVideo?.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80'
                };
            }).sort((a, b) => b.videoCount - a.videoCount); // Sort by video count

            setCategories(categoriesWithCount);
            setLoading(false);
        };
        loadCategories();
    }, []);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
            <Navbar />

            <main style={{ padding: '2rem' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        🏷️ Todas las Categorías
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        {categories.length} categorías disponibles
                    </p>
                </div>

                {/* Categories Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        Cargando categorías...
                    </div>
                ) : categories.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        No hay categorías disponibles.
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {categories.map(category => (
                            <Link
                                key={category.name}
                                href={`/categorias/${encodeURIComponent(category.name)}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <div
                                    style={{
                                        backgroundColor: 'var(--background-card)',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        border: '1px solid var(--border-color)'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                    }}
                                >
                                    {/* Thumbnail */}
                                    <div style={{
                                        position: 'relative',
                                        aspectRatio: '16/9',
                                        overflow: 'hidden',
                                        backgroundColor: '#1e293b'
                                    }}>
                                        <img
                                            src={category.thumbnail}
                                            alt={category.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '12px',
                                            right: '12px',
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                            color: 'white',
                                            fontSize: '0.85rem',
                                            padding: '4px 12px',
                                            borderRadius: '6px',
                                            fontWeight: 600
                                        }}>
                                            {category.videoCount} píldoras
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ padding: '1.5rem' }}>
                                        <h3 style={{
                                            fontSize: '1.25rem',
                                            fontWeight: 600,
                                            marginBottom: '0.5rem',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {category.name}
                                        </h3>
                                        <p style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.9rem'
                                        }}>
                                            Ver todas las píldoras →
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
