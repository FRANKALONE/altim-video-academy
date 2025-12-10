'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { VideoCard } from '@/components/VideoCard';
import { VideoModal } from '@/components/VideoModal';
import { getAllVideos } from '@/app/actions';

type UIVideo = {
    id: string;
    title: string;
    url: string;
    thumbnail: string | null;
    categories: string[];
    duration: string | null;
    author: string;
    uploadDate: string;
    description: string | null;
    series?: string;
    views: number;
    featured: boolean;
    successStory: boolean;
};

export default function CategoryDetailPage() {
    const params = useParams();
    const categoryName = decodeURIComponent(params.slug as string);

    const [videos, setVideos] = useState<UIVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<UIVideo | null>(null);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    useEffect(() => {
        const loadVideos = async () => {
            setLoading(true);
            const dbVideos = await getAllVideos();
            const filtered = dbVideos.filter((v: any) => v.categories?.includes(categoryName));

            const mapped: UIVideo[] = filtered.map((v: any) => ({
                id: v.id,
                title: v.title,
                url: v.urlVimeo,
                thumbnail: v.thumbnailUrl,
                categories: v.categories || [],
                duration: v.duration || '00:00',
                author: v.author || 'Altim',
                uploadDate: new Date(v.createdAt).toLocaleDateString('es-ES'),
                description: v.description,
                series: v.series,
                views: 0,
                featured: v.featured || false,
                successStory: v.successStory || false
            }));

            setVideos(mapped);
            setLoading(false);
        };
        loadVideos();
    }, [categoryName]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
            <Navbar />

            <main style={{ padding: '2rem' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        🏷️ {categoryName}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        {videos.length} píldoras en esta categoría
                    </p>
                </div>

                {/* Videos Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        Cargando píldoras...
                    </div>
                ) : videos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        No hay píldoras en esta categoría.
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {videos.map(video => (
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
