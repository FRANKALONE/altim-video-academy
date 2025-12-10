'use client';

import Link from 'next/link';

export function Footer() {
    return (
        <footer style={{ backgroundColor: '#0f172a', color: 'white', padding: '3rem 2rem', marginTop: 'auto' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>

                {/* Column 1: Logo & Info */}
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#3b82f6' }}>▲</span> Altim
                    </h3>
                    <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '0.95rem' }}>
                        Consultoría líder en transformación digital SAP.
                        Ayudamos a las empresas a innovar y crecer con las mejores soluciones tecnológicas.
                    </p>
                </div>



                {/* Column 3: Contact (Mock) */}
                <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#f1f5f9' }}>Contacto</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#94a3b8', fontSize: '0.95rem' }}>
                        <li>📍 Madrid, España</li>
                        <li>📧 contacto@altim.es</li>
                        <li>📞 +34 91 123 45 67</li>
                    </ul>
                </div>
            </div>

            <div style={{ maxWidth: '1400px', margin: '3rem auto 0', borderTop: '1px solid #1e293b', paddingTop: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                © {new Date().getFullYear()} Altim Tecnologías de la Información. Todos los derechos reservados.
            </div>
        </footer>
    );
}
