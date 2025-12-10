'use client';

import { Video } from '@/lib/video-data';
import { getVimeoThumbnail } from '@/lib/vimeo-utils';

interface VideoCardProps {
    video: Video;
    onClick: (video: Video) => void;
    isFavorite?: boolean;
    onToggleFavorite?: (e: React.MouseEvent) => void;
}

export function VideoCard({ video, onClick, isFavorite, onToggleFavorite }: VideoCardProps) {
    // Use stored thumbnail from database
    const thumbnailUrl = getVimeoThumbnail(video.url, video.thumbnail);

    return (
        <div
            onClick={() => onClick(video)}
            style={{
                backgroundColor: 'var(--background-card)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: '1px solid var(--border-color)',
                position: 'relative'
            }}
            className="video-card group"
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
        >
            <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                <img
                    src={thumbnailUrl}
                    alt={video.title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s'
                    }}
                    className="card-thumb"
                />
                <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    fontSize: '0.75rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 600
                }}>
                    {video.duration}
                </div>
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    display: 'flex',
                    gap: '8px',
                    zIndex: 10
                }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite?.(e);
                        }}
                        style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            color: isFavorite ? '#ef4444' : '#cbd5e1',
                            fontSize: '1.2rem',
                            transition: 'all 0.2s'
                        }}
                        title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                    >
                        {isFavorite ? '❤️' : '🤍'}
                    </button>
                </div>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    fontSize: '3rem',
                }} className="play-overlay">
                    ▶
                </div>
            </div>

            <div style={{ padding: '1rem' }}>
                <h4 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }} title={video.title}>
                    {video.title}
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {video.categories.slice(0, 2).map(cat => (
                        <span key={cat} style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: 'var(--background-hover)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)'
                        }}>
                            {cat}
                        </span>
                    ))}
                    {video.categories.length > 2 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>+{video.categories.length - 2}</span>
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>{video.author}</span>
                    <span>{video.uploadDate}</span>
                </div>
            </div>
            <style jsx>{`
        .video-card:hover .play-overlay {
          opacity: 1 !important;
        }
        .video-card:hover .card-thumb {
          transform: scale(1.05);
        }
      `}</style>
        </div>
    );
}
