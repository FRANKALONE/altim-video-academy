'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { VideoCard } from '@/components/VideoCard';
import { VideoModal } from '@/components/VideoModal';
import { getAllVideos } from '@/app/actions';
import { useSession } from 'next-auth/react';
import { Video } from '@/lib/video-data';

export default function PildorasPage() {
    const { data: session } = useSession();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [filterSeries, setFilterSeries] = useState<string>('');

    useEffect(() => {
        const loadVideos = async () => {
            setLoading(true);
            const dbVideos = await getAllVideos();
            const mapped: Video[] = dbVideos.map((v: any) => ({
                id: v.id,
                title: v.title,
                url: v.urlVimeo,
                thumbnail: v.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
                categories: v.categories || [],
                duration: v.duration || '00:00',
                author: v.author || 'Altim',
                uploadDate: new Date(v.createdAt).toLocaleDateString('es-ES'),
                description: v.description || '',
                series: v.series,
                views: 0,
                featured: v.featured,
                successStory: v.successStory
            }));
            setVideos(mapped);
            setLoading(false);
        };
        loadVideos();
    }, []);

    const categories = Array.from(new Set(videos.flatMap(v => v.categories)));
    const seriesList = Array.from(new Set(videos.map(v => v.series).filter(Boolean))) as string[];

    const filteredVideos = videos.filter(video => {
        if (filterCategory && !video.categories.includes(filterCategory)) return false;
        if (filterSeries && video.series !== filterSeries) return false;
        return true;
    });

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
            <Navbar />

            <main style={{ padding: '2rem' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        📹 Todas las Píldoras
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        {filteredVideos.length} píldoras disponibles
                    </p>
                </div>

                {/* Filters */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
                    flexWrap: 'wrap'
                }}>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--background-card)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select
                        value={filterSeries}
                        onChange={(e) => setFilterSeries(e.target.value)}
                        style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--background-card)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">Todas las series</option>
                        {seriesList.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    {(filterCategory || filterSeries) && (
                        <button
                            onClick={() => {
                                setFilterCategory('');
                                setFilterSeries('');
                            }}
                            style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: '#fee2e2',
                                color: '#991b1b',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>

                {/* Videos Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        Cargando píldoras...
                    </div>
                ) : filteredVideos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        No se encontraron píldoras con los filtros seleccionados.
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {filteredVideos.map(video => (
                            <VideoCard
                                key={video.id}
                                video={video}
                                onClick={setSelectedVideo}
                                isFavorite={favorites.has(video.id)}
                                onToggleFavorite={(e) => {
                                    e.stopPropagation();
                                    setFavorites(prev => {
                                        const newSet = new Set(prev);
                                        if (newSet.has(video.id)) {
                                            newSet.delete(video.id);
                                        } else {
                                            newSet.add(video.id);
                                        }
                                        return newSet;
                                    });
                                }}
                            />
                        ))}
                    </div>
                )}
            </main>

            <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
        </div>
    );
}
