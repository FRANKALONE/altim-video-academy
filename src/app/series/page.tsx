'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { getAllVideos, getSeries } from '@/app/actions';

type SeriesWithCount = {
    id: string;
    title: string;
    videoCount: number;
    thumbnail: string | null;
};

export default function SeriesPage() {
    const [seriesList, setSeriesList] = useState<SeriesWithCount[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSeries = async () => {
            setLoading(true);
            const [dbSeries, dbVideos] = await Promise.all([getSeries(), getAllVideos()]);

            const seriesWithCount: SeriesWithCount[] = dbSeries.map((s: any) => {
                const videosInSeries = dbVideos.filter((v: any) => v.series === s.title);
                const firstVideo = videosInSeries[0];

                return {
                    id: s.id,
                    title: s.title,
                    videoCount: videosInSeries.length,
                    thumbnail: firstVideo?.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80'
                };
            });

            setSeriesList(seriesWithCount);
            setLoading(false);
        };
        loadSeries();
    }, []);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
            <Navbar />

            <main style={{ padding: '2rem' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        📚 Formaciones y Series
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        {seriesList.length} series disponibles
                    </p>
                </div>

                {/* Series Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        Cargando series...
                    </div>
                ) : seriesList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        No hay series disponibles.
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '2rem'
                    }}>
                        {seriesList.map(series => (
                            <Link
                                key={series.id}
                                href={`/search?series=${encodeURIComponent(series.title)}`}
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
                                            src={series.thumbnail}
                                            alt={series.title}
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
                                            {series.videoCount} píldoras
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
                                            {series.title}
                                        </h3>
                                        <p style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.9rem'
                                        }}>
                                            Explora todas las píldoras de esta formación →
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
