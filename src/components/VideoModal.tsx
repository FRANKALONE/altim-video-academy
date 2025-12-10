'use client';

import { Video } from '@/lib/video-data';
import { extractVimeoId } from '@/lib/vimeo-utils';

interface VideoModalProps {
    video: Video | null;
    onClose: () => void;
}

export function VideoModal({ video, onClose }: VideoModalProps) {
    if (!video) return null;

    // Extract Vimeo ID and create proper embed URL
    const vimeoId = extractVimeoId(video.url);
    const embedUrl = vimeoId
        ? `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=1&byline=1&portrait=1`
        : video.url;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backdropFilter: 'blur(5px)'
        }} onClick={onClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '1200px',
                    backgroundColor: '#000',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    animation: 'fadeUp 0.3s ease-out'
                }}
            >
                <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                    {/* Vimeo iframe player */}
                    <iframe
                        src={embedUrl}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none'
                        }}
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={video.title}
                    />
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            border: '2px solid rgba(255,255,255,0.3)',
                            cursor: 'pointer',
                            fontSize: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(4px)',
                            zIndex: 10,
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.9)';
                            e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        ×
                    </button>
                </div>
                <div style={{ padding: '2rem', backgroundColor: '#18181b' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'white' }}>{video.title}</h2>
                    <div style={{ display: 'flex', gap: '1rem', color: '#a1a1aa', marginBottom: '1.5rem', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                        <span>{video.author}</span>
                        {video.duration && video.duration !== '00:00' && (
                            <>
                                <span>•</span>
                                <span>{video.duration}</span>
                            </>
                        )}
                        {video.categories && video.categories.length > 0 && (
                            <>
                                <span>•</span>
                                <span>{video.categories.join(', ')}</span>
                            </>
                        )}
                        {video.uploadDate && (
                            <>
                                <span>•</span>
                                <span>{video.uploadDate}</span>
                            </>
                        )}
                    </div>
                    {video.description && (
                        <p style={{ lineHeight: 1.6, color: '#d4d4d8' }}>
                            {video.description}
                        </p>
                    )}
                </div>
            </div>
            <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
