'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Onboarding State
    const [isOnboarding, setIsOnboarding] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // SIMULATION: Check if user is in 'PENDIENTE' status
        // In a real app, the backend would return specific error code or status
        if (email.toLowerCase() === 'nuevo@altim.es') {
            setIsOnboarding(true);
            return;
        }

        const res = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError('Credenciales inválidas');
        } else {
            router.push('/admin');
            router.refresh();
        }
    };

    const handleOnboardingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        if (!acceptedTerms) {
            setError('Debes aceptar los Términos y Condiciones');
            return;
        }

        // SIMULATION: Activate user
        alert('¡Cuenta activada con éxito! Ahora puedes acceder.');

        // Auto-login or ask to login again? 
        // Let's simluate auto-login by redirecting to admin for demo
        router.push('/admin');
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--background-card)',
            backgroundImage: 'radial-gradient(circle at 10% 20%, rgb(0, 96, 170, 0.05) 0%, rgb(255, 255, 255) 90.2%)'
        }}>
            <div style={{
                backgroundColor: 'var(--background-dark)', // White
                padding: '3rem',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                width: '100%',
                maxWidth: '450px',
                border: '1px solid var(--border-color)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <img
                        src="/logo.png"
                        alt="Altim Logo"
                        style={{ height: '50px', objectFit: 'contain', marginBottom: '1.5rem' }}
                    />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {isOnboarding ? 'Activar Cuenta' : 'Video Academy'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        {isOnboarding ? 'Configura tu acceso por primera vez' : 'Acceso Corporativo'}
                    </p>
                </div>

                {!isOnboarding ? (
                    /* --- LOGIN FORM --- */
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                Email Corporativo
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="usuario@altim.es"
                                style={{
                                    width: '100%',
                                    padding: '0.9rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--background-hover)',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                Contraseña
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '0.9rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--background-hover)',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {error && (
                            <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '1rem',
                                border: 'none',
                                cursor: 'pointer',
                                marginTop: '0.5rem',
                                boxShadow: '0 4px 12px rgba(0, 96, 170, 0.3)',
                                transition: 'transform 0.1s'
                            }}
                        >
                            Iniciar Sesión
                        </button>
                    </form>
                ) : (
                    /* --- ONBOARDING FORM --- */
                    <form onSubmit={handleOnboardingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                style={{
                                    width: '100%',
                                    padding: '0.9rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: '#f1f5f9',
                                    color: 'var(--text-secondary)',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                Nueva Contraseña
                            </label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                style={{ padding: '0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background-hover)', width: '100%' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                Confirmar Contraseña
                            </label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite la contraseña"
                                style={{ padding: '0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background-hover)', width: '100%' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                            <input
                                type="checkbox"
                                id="terms"
                                required
                                checked={acceptedTerms}
                                onChange={e => setAcceptedTerms(e.target.checked)}
                                style={{ marginTop: '0.25rem' }}
                            />
                            <label htmlFor="terms" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                He leído y acepto los <a href="#" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Términos y Condiciones</a> y la Política de Privacidad de Altim Video Academy.
                            </label>
                        </div>

                        {error && (
                            <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '1rem',
                                border: 'none',
                                cursor: 'pointer',
                                marginTop: '0.5rem',
                                boxShadow: '0 4px 12px rgba(0, 96, 170, 0.3)'
                            }}
                        >
                            Activar y Acceder
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
