'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { VideoCard } from '@/components/VideoCard';
import { VideoModal } from '@/components/VideoModal';
import { HeroBanner } from '@/components/HeroBanner';
import { getAllVideos, getSeries, getCategories } from '@/app/actions';

interface UIVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  categories: string[];
  duration: string;
  author: string;
  uploadDate: string;
  description: string;
  views: number;
  featured: boolean;
  successStory: boolean;
  series?: string;
}

type CategoryWithVideos = {
  name: string;
  videos: UIVideo[];
  totalCount: number;
};

export default function Home() {
  const [playingVideo, setPlayingVideo] = useState<UIVideo | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [videos, setVideos] = useState<UIVideo[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<CategoryWithVideos[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dbVideos, dbSeries, dbCategories] = await Promise.all([
          getAllVideos(),
          getSeries(),
          getCategories()
        ]);

        // Map DB Video to UI Video
        const mapped: UIVideo[] = dbVideos.map((v: any) => ({
          id: v.id,
          title: v.title,
          url: v.urlVimeo,
          thumbnail: v.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
          categories: v.categories,
          duration: v.duration || '00:00',
          author: v.author,
          uploadDate: v.createdAt ? new Date(v.createdAt).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES'),
          description: v.description || '',
          views: v.views || 0,
          featured: v.featured,
          successStory: v.successStory,
          series: v.series
        }));

        setVideos(mapped);
        setSeriesList(dbSeries);

        // Get top 4-5 categories by video count
        const categoriesWithVideos: CategoryWithVideos[] = dbCategories.map((catName: string) => {
          const categoryVideos = mapped.filter(v => v.categories.includes(catName));
          return {
            name: catName,
            videos: categoryVideos.slice(0, 4), // Show max 4 videos per category
            totalCount: categoryVideos.length
          };
        }).filter(cat => cat.totalCount > 0) // Only categories with videos
          .sort((a, b) => b.totalCount - a.totalCount) // Sort by count
          .slice(0, 5); // Top 5 categories

        setTopCategories(categoriesWithVideos);
      } catch (error) {
        console.error("Error loading home data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(vid => vid !== id) : [...prev, id]
    );
  };

  const bannerVideos = videos.filter(v => v.featured).slice(0, 5);
  const successStories = videos.filter(v => v.successStory).slice(0, 4);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Navbar />

      {/* Hero Banner */}
      {bannerVideos.length > 0 && (
        <HeroBanner videos={bannerVideos} onPlay={setPlayingVideo} />
      )}

      <main style={{ padding: '2rem' }}>
        {/* Series Section */}
        {seriesList.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>📚 Formaciones y Series</h2>
              <Link href="/series" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                Ver todas →
              </Link>
            </div>
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
              {seriesList.slice(0, 6).map((s: any) => {
                const seriesVideos = videos.filter(v => v.series === s.title);
                const thumbnail = seriesVideos[0]?.thumbnail || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80';

                return (
                  <Link key={s.id} href={`/search?series=${encodeURIComponent(s.title)}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                    <div style={{
                      width: '200px',
                      backgroundColor: 'var(--background-card)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s'
                    }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
                        <img src={thumbnail} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '1rem' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>{s.title}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{seriesVideos.length} píldoras</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Categories Section */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>🏷️ Píldoras por Categorías</h2>
          </div>

          {topCategories.map((category, index) => (
            <div key={category.name} style={{ marginBottom: '3rem' }}>
              {/* Category Header - Only title */}
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                {category.name}
              </h3>

              {/* Videos Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '1rem'
              }}>
                {category.videos.map(video => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onClick={setPlayingVideo}
                    isFavorite={favorites.includes(video.id)}
                    onToggleFavorite={() => toggleFavorite(video.id)}
                  />
                ))}
              </div>

              {/* Ver más button below videos */}
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link
                  href={`/categorias/${encodeURIComponent(category.name)}`}
                  style={{ textDecoration: 'none' }}
                >
                  <button style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--background-card)',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    transition: 'all 0.2s'
                  }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary-glow)';
                      e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--background-card)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    Ver más ({category.totalCount}) →
                  </button>
                </Link>
              </div>
            </div>
          ))}

          {/* Ver más categorías button */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/categorias">
              <button style={{
                padding: '1rem 2rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--background-card)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '1rem',
                transition: 'all 0.2s'
              }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-glow)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--background-card)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                Ver más categorías
              </button>
            </Link>
          </div>
        </section>

        {/* Success Stories */}
        {/* Success Stories - Always show */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>🏆 Historias de Éxito</h2>
          {successStories.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {successStories.map(video => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={setPlayingVideo}
                  isFavorite={favorites.includes(video.id)}
                  onToggleFavorite={() => toggleFavorite(video.id)}
                />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              backgroundColor: 'var(--background-card)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                Próximamente encontrarás aquí casos de éxito de nuestros clientes.
              </p>
            </div>
          )}
        </section>
      </main>

      <VideoModal video={playingVideo} onClose={() => setPlayingVideo(null)} />
    </div>
  );
}
