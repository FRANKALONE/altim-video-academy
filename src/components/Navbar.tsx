import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

interface NavbarProps {
    onSearch?: (query: string) => void;
}

export function Navbar({ onSearch }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    const navLinks = [
        { href: '/pildoras', label: 'Píldoras', icon: '📹' },
        { href: '/series', label: 'Series', icon: '📚' },
        { href: '/categorias', label: 'Categorías', icon: '🏷️' },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <nav style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 2rem',
            backgroundColor: 'var(--background-card)',
            borderBottom: '1px solid var(--border-color)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            gap: '2rem'
        }}>
            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <img
                    src="/logo.png"
                    alt="Altim Logo"
                    style={{ height: '40px', objectFit: 'contain' }}
                />
            </Link>

            {/* Horizontal Menu */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                flexShrink: 0
            }}>
                {navLinks.map(link => (
                    <Link key={link.href} href={link.href}>
                        <button style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: isActive(link.href) ? 'var(--primary-glow)' : 'transparent',
                            color: isActive(link.href) ? 'var(--primary)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: isActive(link.href) ? 600 : 500,
                            fontSize: '0.95rem',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                            onMouseOver={(e) => {
                                if (!isActive(link.href)) {
                                    e.currentTarget.style.backgroundColor = 'var(--background-hover)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!isActive(link.href)) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <span>{link.icon}</span>
                            <span>{link.label}</span>
                        </button>
                    </Link>
                ))}
            </div>

            {/* Search Icon */}
            <button
                onClick={() => router.push('/search')}
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--background-hover)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    flexShrink: 0
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.color = 'var(--primary)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                title="Buscar"
            >
                🔍
            </button>

            {/* Right Side: Admin + Profile */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', position: 'relative', flexShrink: 0, marginLeft: 'auto' }}>
                {(session?.user as any)?.role === 'ADMIN' && (
                    <Link href="/admin">
                        <button style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: 500,
                            transition: 'all 0.2s'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--background-hover)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            Admin Panel
                        </button>
                    </Link>
                )}

                <div ref={menuRef} style={{ position: 'relative' }}>
                    <div
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), #60a5fa)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            userSelect: 'none'
                        }}
                        title={(session?.user as any)?.role || 'Invitado'}
                    >
                        {session?.user?.name ? session.user.name[0].toUpperCase() : 'U'}
                    </div>

                    {/* DROPDOWN MENU */}
                    {isMenuOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '120%',
                            right: 0,
                            backgroundColor: 'var(--background-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            padding: '0.5rem',
                            minWidth: '200px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            zIndex: 200
                        }}>
                            <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{session?.user?.name || 'Usuario'}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{(session?.user as any)?.role || 'Invitado'}</p>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    console.log('Cerrando sesión...');
                                    signOut({ callbackUrl: '/login' });
                                }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    textAlign: 'left',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    width: '100%'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                🚪 Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
