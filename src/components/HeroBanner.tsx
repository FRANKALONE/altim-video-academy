'use client';

import { useState, useEffect } from 'react';
import { Video } from '@/lib/video-data';
import { getVimeoThumbnail } from '@/lib/vimeo-utils';

interface HeroBannerProps {
    videos: Video[];
    onPlay: (video: Video) => void;
}

export function HeroBanner({ videos, onPlay }: HeroBannerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % videos.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [videos.length]);

    if (!videos.length) return null;

    const currentVideo = videos[currentIndex];

    return (
        <div style={{
            margin: '2rem 2rem 0 2rem',
            height: '350px',
            borderRadius: '24px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3)',
            color: 'white'
        }}>
            {/* Background Images with Fade Effect */}
            {videos.map((video, index) => {
                const thumbnailUrl = getVimeoThumbnail(video.url, video.thumbnail);
                return (
                    <div
                        key={video.id}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${thumbnailUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: index === currentIndex ? 1 : 0,
                            transition: 'opacity 0.8s ease-in-out',
                            zIndex: 1
                        }}
                    />
                );
            })}

            {/* Content */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '0 4rem',
                maxWidth: '800px'
            }}>
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <span style={{
                        backgroundColor: '#ef4444',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 700
                    }}>
                        NUEVO
                    </span>
                    <span style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        backdropFilter: 'blur(4px)'
                    }}>
                        {currentVideo.categories[0]}
                    </span>
                </div>

                <h2 style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    marginBottom: '1rem',
                    lineHeight: 1.1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}>
                    {currentVideo.title}
                </h2>

                <p style={{
                    fontSize: '1.1rem',
                    marginBottom: '2rem',
                    opacity: 0.9,
                    maxWidth: '600px',
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {currentVideo.description}
                </p>

                <button
                    onClick={() => onPlay(currentVideo)}
                    style={{
                        width: 'fit-content',
                        padding: '1rem 2rem',
                        backgroundColor: 'var(--primary)', // Fallback if var not works
                        background: 'linear-gradient(45deg, var(--primary), #60a5fa)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    ▶ Reproducir Ahora
                </button>
            </div>

            {/* Indicators */}
            <div style={{
                position: 'absolute',
                bottom: '2rem',
                right: '2rem',
                zIndex: 3,
                display: 'flex',
                gap: '0.5rem'
            }}>
                {videos.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        style={{
                            width: currentIndex === idx ? '24px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
                            backgroundColor: 'white',
                            opacity: currentIndex === idx ? 1 : 0.5,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
