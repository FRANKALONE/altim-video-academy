
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import {
    getAllVideos, createVideo, deleteVideo, updateVideo, toggleFeaturedVideo,
    getUsers, createUser, deleteUser, bulkUpsertUsers,
    getSeries, createSeries, deleteSeries, updateSeries,
    getCategories, createCategoriesBulk, deleteCategory
} from '@/app/actions';

// -- TYPES (Adapted for UI state) --

type UI_Video = {
    id: string;
    title: string;
    url: string;
    thumbnail: string | null;
    categories: string[];
    duration: string | null;
    author: string;
    uploadDate: string;
    description: string | null;
    series?: string; // Series Name
    views: number;
    featured: boolean;
    successStory: boolean;
};

type UI_User = {
    id: string;
    email: string;
    role: 'ADMIN' | 'CLIENT';
    client: string;
    status: string;
    accepted_terms: boolean;
};

export default function AdminPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'videos' | 'users' | 'categories' | 'series'>('videos');

    // -- STATE: VIDEOS --
    const [videos, setVideos] = useState<UI_Video[]>([]);
    const [videoSearch, setVideoSearch] = useState('');
    const [videoLoading, setVideoLoading] = useState(false);

    // -- STATE: GLOBAL DATA --
    const [users, setUsers] = useState<UI_User[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [seriesList, setSeriesList] = useState<string[]>([]);

    // -- LOADING STATES --
    const [loadingData, setLoadingData] = useState(true);

    // -- STATE: EDITING --
    const [seriesInput, setSeriesInput] = useState('');
    const [editingSeries, setEditingSeries] = useState<{ original: string, current: string } | null>(null);
    const [editingVideo, setEditingVideo] = useState<UI_Video | null>(null);

    // -- STATE: FORMS --
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        selectedCategories: [] as string[],
        description: '',
        series: '',
        successStory: false
    });

    const [assignment, setAssignment] = useState({ targetId: '', videoSelect: '' });

    const [singleUser, setSingleUser] = useState({ email: '', client: '', role: 'CLIENT' });
    const [userBulkText, setUserBulkText] = useState('');
    const [catBulkText, setCatBulkText] = useState('');
    const [userFilter, setUserFilter] = useState({ text: '', role: 'ALL' });

    // --- EFFECT: DATA FETCHING ---
    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoadingData(true);
        try {
            // Parallel fetch
            const [fetchedVideos, fetchedUsers, fetchedSeries, fetchedCats] = await Promise.all([
                getAllVideos(),
                getUsers(),
                getSeries(),
                getCategories()
            ]);

            // Transform to UI types
            const mappedVideos: UI_Video[] = fetchedVideos.map((v: any) => ({
                id: v.id,
                title: v.title,
                url: v.urlVimeo,
                thumbnail: v.thumbnailUrl,
                categories: v.categories, // Array of strings
                duration: v.duration || '00:00',
                author: v.author,
                uploadDate: v.createdAt ? new Date(v.createdAt).toISOString().split('T')[0] : '',
                description: v.description || '',
                series: v.series, // Name resolved in backend action
                views: v.views || 0,
                featured: v.featured,
                successStory: v.successStory
            }));
            setVideos(mappedVideos);

            const mappedUsers: UI_User[] = fetchedUsers.map((u: any) => ({
                id: u.id,
                email: u.email,
                role: u.role as 'ADMIN' | 'CLIENT',
                client: u.clientName,
                status: u.status,
                accepted_terms: u.acceptedTerms
            }));
            setUsers(mappedUsers);

            setSeriesList(fetchedSeries.map((s: any) => s.title));
            setCategories(fetchedCats);
        } catch (error) {
            console.error('Failed to load data:', error);
            alert('Error cargando datos de la base de datos (SQLite).');
        } finally {
            setLoadingData(false);
        }
    };

    // -- HANDLERS: VIDEOS --
    const handleVideoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setVideoLoading(true);

        const allSeriesObjs = await getSeries();
        const selectedSeriesObj = allSeriesObjs.find(s => s.title === formData.series);

        try {
            await createVideo({
                title: formData.title,
                urlVimeo: formData.url,
                categories: formData.selectedCategories,
                description: formData.description,
                author: 'Admin',
                seriesId: selectedSeriesObj ? selectedSeriesObj.id : null,
                featured: false,
                successStory: formData.successStory,
                thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80'
            });
            alert('Vídeo creado correctamente.');
            setFormData({ title: '', url: '', selectedCategories: [], description: '', series: '', successStory: false });
            loadAllData();
        } catch (e) {
            alert('Error creando vídeo');
            console.error(e);
        } finally {
            setVideoLoading(false);
        }
    };

    const handleToggleFeatured = async (videoId: string) => {
        const v = videos.find(v => v.id === videoId);
        if (!v) return;
        await toggleFeaturedVideo(videoId, v.featured);
        setVideos(prev => prev.map(vi => vi.id === videoId ? { ...vi, featured: !vi.featured } : vi));
    };

    const handleDeleteVideo = async (videoId: string) => {
        if (!confirm('¿Eliminar permanentemente este vídeo?')) return;
        await deleteVideo(videoId);
        setVideos(prev => prev.filter(v => v.id !== videoId));
    };

    // -- HANDLER: EDIT VIDEO --
    const handleSaveEditedVideo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingVideo) return;

        const allSeriesObjs = await getSeries();
        const selectedSeriesObj = allSeriesObjs.find(s => s.title === editingVideo.series);

        await updateVideo(editingVideo.id, {
            title: editingVideo.title,
            urlVimeo: editingVideo.url,
            seriesId: selectedSeriesObj ? selectedSeriesObj.id : null,
            categories: editingVideo.categories
        });

        loadAllData();
        setEditingVideo(null);
        alert('Vídeo actualizado.');
    };

    const toggleCategory = (cat: string) => {
        setFormData(prev => ({
            ...prev,
            selectedCategories: prev.selectedCategories.includes(cat)
                ? prev.selectedCategories.filter(c => c !== cat)
                : [...prev.selectedCategories, cat]
        }));
    };

    // -- HANDLERS: SERIES --
    const handleCreateSeries = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!seriesInput.trim()) return;
        const res = await createSeries(seriesInput.trim());
        if (res.success) {
            alert('Serie creada');
            setSeriesInput('');
            loadAllData();
        } else {
            alert('Error: ' + res.error);
        }
    };

    const handleUpdateSeries = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSeries) return;
        await updateSeries(editingSeries.original, editingSeries.current);
        setEditingSeries(null);
        alert('Serie actualizada');
        loadAllData();
    };

    const handleDeleteSeries = async (seriesName: string) => {
        if (!confirm('¿Borrar serie Y desvincularla de todos los vídeos?')) return;
        await deleteSeries(seriesName);
        loadAllData();
    };

    // -- HANDLERS: USERS --
    const handleSingleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await createUser({
            email: singleUser.email,
            clientName: singleUser.client,
            role: singleUser.role as any,
            status: 'PENDIENTE',
            acceptedTerms: false
        });
        if (res.success) {
            alert('Usuario creado');
            setSingleUser({ email: '', client: '', role: 'CLIENT' });
            loadAllData(); // reload to get ID and Date
        } else {
            alert('Error: ' + res.error);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('¿Borrar usuario?')) return;
        await deleteUser(id);
        setUsers(prev => prev.filter(u => u.id !== id));
    };

    const downloadUsersCSV = () => {
        const headers = 'email,client,role,action';
        const rows = users.map(u => `${u.email},${u.client},${u.role},UPDATE`);
        const csvContent = [headers, ...rows].join('\n');
        // Add UTF-8 BOM to ensure Excel recognizes the encoding correctly
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'usuarios_altim.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            const separator = lines[0].includes(';') ? ';' : ',';
            const usersPayload = [];

            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(separator).map(p => p.trim());
                if (parts.length >= 3) {
                    usersPayload.push({
                        email: parts[0],
                        client: parts[1],
                        role: parts[2].toUpperCase(),
                        action: parts[3] ? parts[3].toUpperCase() : 'CREATE'
                    });
                }
            }

            const res = await bulkUpsertUsers(usersPayload);
            alert(`Procesado. Creados: ${res.created}, Actualizados: ${res.updated}, Errores: ${res.errors}`);
            loadAllData();
            e.target.value = '';
        };
        reader.readAsText(file);
    };

    // -- HANDLERS: CATEGORIES --
    const handleBulkCatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const names = catBulkText.split(',').map(s => s.trim()).filter(Boolean);
        if (names.length > 0) {
            const count = await createCategoriesBulk(names);
            alert(`Añadidas ${count} categorías.`);
            setCatBulkText('');
            loadAllData();
        }
    };

    const handleDeleteCategory = async (categoryName: string) => {
        if (!confirm(`¿Eliminar la categoría "${categoryName}"? Se desvinculará de todos los vídeos.`)) return;
        await deleteCategory(categoryName);
        loadAllData();
    };

    // -- CSV VIDEOS --
    const downloadVideosCSV = () => {
        const headers = 'id,title,url,series,author,categories,action';
        const rows = videos.map(v => {
            const cats = v.categories.join('|'); // Use pipe instead of semicolon
            // Proper CSV escaping: wrap fields in quotes if they contain commas, semicolons, quotes, or newlines
            const escapeCSV = (field: string | undefined | null) => {
                if (!field) return '';
                const str = String(field);
                // Wrap in quotes if contains comma, semicolon, quote, or newline
                if (str.includes(',') || str.includes(';') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };
            return `${escapeCSV(v.id)},${escapeCSV(v.title)},${escapeCSV(v.url)},${escapeCSV(v.series)},${escapeCSV(v.author)},${escapeCSV(cats)},UPDATE`;
        });
        const csvContent = [headers, ...rows].join('\n');
        // Add UTF-8 BOM to ensure Excel recognizes the encoding correctly
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'videos_altim_academy.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            const separator = lines[0].includes(';') ? ';' : ',';

            let stats = { created: 0, updated: 0, deleted: 0, errors: 0 };
            const allSeries = await getSeries(); // Fetch latest for ID mapping
            const errorDetails: string[] = [];

            console.log(`📊 Procesando ${lines.length - 1} filas del CSV...`);

            for (let i = 1; i < lines.length; i++) {
                try {
                    // Proper CSV parsing: handle quoted fields
                    const parseCSVLine = (line: string, separator: string) => {
                        const result = [];
                        let current = '';
                        let inQuotes = false;

                        for (let j = 0; j < line.length; j++) {
                            const char = line[j];
                            const nextChar = line[j + 1];

                            if (char === '"') {
                                if (inQuotes && nextChar === '"') {
                                    current += '"';
                                    j++; // Skip next quote
                                } else {
                                    inQuotes = !inQuotes;
                                }
                            } else if (char === separator && !inQuotes) {
                                result.push(current.trim());
                                current = '';
                            } else {
                                current += char;
                            }
                        }
                        result.push(current.trim());
                        return result;
                    };

                    const parts = parseCSVLine(lines[i], separator);

                    // More lenient validation - at least title and URL
                    if (parts.length < 2) {
                        errorDetails.push(`Fila ${i + 1}: Datos insuficientes (mínimo: título, URL)`);
                        stats.errors++;
                        continue;
                    }

                    const [id, title, url, seriesName, author, catsRaw, actionRaw] = parts;

                    // Validate required fields
                    if (!title || !url) {
                        errorDetails.push(`Fila ${i + 1}: Título o URL vacío`);
                        stats.errors++;
                        continue;
                    }

                    const action = (actionRaw || 'CREATE').toUpperCase(); // Default to CREATE for new imports
                    const cats = catsRaw ? catsRaw.split('|').map(c => c.trim()).filter(Boolean) : []; // Use pipe instead of semicolon


                    const seriesObj = allSeries.find(s => s.title === seriesName);

                    if (action === 'DELETE') {
                        if (id) {
                            await deleteVideo(id);
                            stats.deleted++;
                            console.log(`✅ Fila ${i + 1}: Video eliminado (${title})`);
                        } else {
                            errorDetails.push(`Fila ${i + 1}: DELETE requiere ID`);
                            stats.errors++;
                        }
                    } else if (action === 'UPDATE' && id) {
                        await updateVideo(id, {
                            title,
                            urlVimeo: url,
                            categories: cats,
                            seriesId: seriesObj?.id || null
                        });
                        stats.updated++;
                        console.log(`✅ Fila ${i + 1}: Video actualizado (${title})`);
                    } else if (action === 'CREATE' || !id) {
                        await createVideo({
                            title: title,
                            urlVimeo: url,
                            categories: cats,
                            author: author || 'Admin',
                            seriesId: seriesObj?.id || null,
                            description: 'Importado vía CSV',
                            featured: false,
                            successStory: false,
                            thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80'
                        });
                        stats.created++;
                        console.log(`✅ Fila ${i + 1}: Video creado (${title})`);
                    }
                } catch (e: any) {
                    const errorMsg = `Fila ${i + 1}: ${e.message || 'Error desconocido'}`;
                    errorDetails.push(errorMsg);
                    console.error(`❌ ${errorMsg}`, e);
                    stats.errors++;
                }
            }

            // Show detailed results
            let message = `📊 Proceso CSV Finalizado\n\n`;
            message += `✅ Creados: ${stats.created}\n`;
            message += `🔄 Actualizados: ${stats.updated}\n`;
            message += `🗑️ Eliminados: ${stats.deleted}\n`;
            message += `❌ Errores: ${stats.errors}\n`;

            if (errorDetails.length > 0) {
                message += `\n⚠️ Detalles de errores (ver consola para más info):\n`;
                message += errorDetails.slice(0, 5).join('\n');
                if (errorDetails.length > 5) {
                    message += `\n... y ${errorDetails.length - 5} errores más (ver consola)`;
                }
                console.error('📋 Errores completos:', errorDetails);
            }

            alert(message);
            loadAllData();
            e.target.value = '';
        };
        reader.readAsText(file);
    };

    const handleAssignSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Gestión de Permisos (RBAC) aún en desarrollo en backend.');
    };

    // Filter Logic
    const filteredVideos = videos.filter(v => {
        const query = videoSearch.toLowerCase();
        return v.title.toLowerCase().includes(query) ||
            v.series?.toLowerCase().includes(query) ||
            v.author.toLowerCase().includes(query) ||
            v.categories.some(c => c.toLowerCase().includes(query));
    });

    const filteredUsers = users.filter(u => {
        const matchText = u.email.toLowerCase().includes(userFilter.text.toLowerCase()) ||
            u.client.toLowerCase().includes(userFilter.text.toLowerCase());
        const matchRole = userFilter.role === 'ALL' || u.role === userFilter.role;
        return matchText && matchRole;
    });

    return (
        <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar onSearch={() => { }} />

            <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '2rem', color: '#1e293b' }}>
                        Panel de Administración
                        {loadingData && <span style={{ fontSize: '1rem', color: '#64748b', marginLeft: '1rem', fontWeight: 400 }}>🔄 Conectando SQLite...</span>}
                    </h1>
                    <Link href="/" style={{ color: 'var(--primary)' }}>← Volver a la App</Link>
                </div>

                <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
                    <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Gestión integral centralizada. <strong style={{ color: '#059669' }}>Base de Datos: SQLite (Persistente)</strong>
                        </p>
                    </header>

                    {/* TABS NAVIGATION */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        {[
                            { id: 'videos', label: '📹 Vídeos' },
                            { id: 'users', label: '👥 Usuarios' },
                            { id: 'categories', label: '🏷️ Categorías' },
                            { id: 'series', label: '📚 Series' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    border: 'none',
                                    backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'var(--background-card)',
                                    color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* --- TAB CONTENT: VIDEOS --- */}
                    {activeTab === 'videos' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                            <section>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>Subir Nueva Píldora</h2>
                                <form onSubmit={handleVideoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'var(--background-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 0 }}>
                                            <label style={{ fontSize: '0.85rem' }}>Título</label>
                                            <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', width: '100%' }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 0 }}>
                                            <label style={{ fontSize: '0.85rem' }}>URL (Vimeo)</label>
                                            <input type="url" required value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', width: '100%' }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.85rem' }}>Categorías</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '100px', overflowY: 'auto' }}>
                                            {categories.map(cat => (
                                                <button key={cat} type="button" onClick={() => toggleCategory(cat)} style={{ padding: '4px 10px', borderRadius: '16px', border: formData.selectedCategories.includes(cat) ? '1px solid var(--primary)' : '1px solid var(--border-color)', backgroundColor: formData.selectedCategories.includes(cat) ? 'var(--primary-glow)' : 'transparent', color: formData.selectedCategories.includes(cat) ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem' }}>{cat}</button>
                                            ))}
                                            {categories.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No hay categorías creadas. Ve a la pestaña Categorías.</span>}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.85rem' }}>Serie / Formación</label>
                                        <select value={formData.series} onChange={e => setFormData({ ...formData, series: e.target.value })} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', width: '100%' }}>
                                            <option value="">-- Sin Serie --</option>
                                            {seriesList.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <input type="checkbox" id="successStory" checked={formData.successStory} onChange={e => setFormData({ ...formData, successStory: e.target.checked })} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                                        <label htmlFor="successStory" style={{ fontSize: '0.9rem', cursor: 'pointer', fontWeight: 500 }}>Es una Historia de Éxito 🏆</label>
                                    </div>

                                    <button disabled={videoLoading} type="submit" style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--primary)', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', width: 'fit-content' }}>
                                        {videoLoading ? 'Guardando...' : 'Publicar Píldora'}
                                    </button>
                                </form>
                            </section>

                            <section style={{ gridColumn: '1 / -1' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', margin: 0 }}>Catálogo de Vídeos</h2>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button onClick={downloadVideosCSV} style={{ padding: '0.6rem 1rem', borderRadius: '6px', backgroundColor: '#059669', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>📥 Exportar CSV</button>
                                        <input type="text" placeholder="🔍 Filtrar..." value={videoSearch} onChange={e => setVideoSearch(e.target.value)} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', minWidth: '300px' }} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '1rem', padding: '1.5rem', backgroundColor: 'var(--background-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 0.75rem 0', fontWeight: 600 }}>📤 Carga Masiva de Vídeos (CSV)</h3>
                                    <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', fontSize: '0.85rem', lineHeight: '1.6' }}>
                                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#0369a1' }}>📋 Formato del CSV:</p>
                                        <code style={{ display: 'block', backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px', marginBottom: '0.5rem', fontSize: '0.8rem' }}>id,title,url,series,author,categories,action</code>
                                        <ul style={{ margin: '0.5rem 0 0 1.2rem', padding: 0 }}>
                                            <li><strong>id</strong>: Dejar vacío para crear nuevos vídeos</li>
                                            <li><strong>title</strong>: Título del vídeo (requerido)</li>
                                            <li><strong>url</strong>: URL de Vimeo (requerido)</li>
                                            <li><strong>series</strong>: Nombre de la serie (opcional)</li>
                                            <li><strong>author</strong>: Autor (opcional, por defecto "Admin")</li>
                                            <li><strong>categories</strong>: Separadas por punto y coma (ej: SAP;FIORI)</li>
                                            <li><strong>action</strong>: CREATE, UPDATE o DELETE (por defecto CREATE)</li>
                                        </ul>
                                        <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>💡 Tip: Exporta el CSV actual para ver el formato correcto</p>
                                    </div>
                                    <input type="file" accept=".csv" onChange={handleVideoFileUpload} style={{ width: '100%' }} />
                                </div>
                                <div style={{ backgroundColor: 'var(--background-card)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead style={{ backgroundColor: 'var(--background-hover)' }}>
                                            <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                                                <th style={{ padding: '1rem' }}>Título</th><th style={{ padding: '1rem' }}>Serie</th><th style={{ padding: '1rem' }}>Autor</th><th style={{ padding: '1rem' }}>Categorías</th><th style={{ padding: '1rem', textAlign: 'center' }}>Destacado</th><th style={{ padding: '1rem', textAlign: 'center' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredVideos.map(video => (
                                                <tr key={video.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{video.title}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{video.series || '-'}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{video.author}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                            {video.categories.map(c => <span key={c} style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#f1f5f9' }}>{c}</span>)}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                        <button onClick={() => handleToggleFeatured(video.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: video.featured ? 1 : 0.3, filter: video.featured ? 'none' : 'grayscale(100%)' }}>⭐</button>
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                                        <button onClick={() => setEditingVideo(video)} style={{ border: 'none', background: '#fef3c7', color: '#b45309', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>✏️</button>
                                                        <button onClick={() => handleDeleteVideo(video.id)} style={{ border: 'none', background: '#fee2e2', color: '#991b1b', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>🗑️</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* --- TAB CONTENT: USERS --- */}
                    {activeTab === 'users' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                            <section>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', margin: 0 }}>Gestión de Usuarios</h2>
                                    <button onClick={downloadUsersCSV} style={{ padding: '0.6rem 1rem', borderRadius: '6px', backgroundColor: '#059669', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>📥 Exportar CSV</button>
                                </div>
                                <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'var(--background-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)' }}>Crear Usuario Manualmente</h3>
                                    <form onSubmit={handleSingleUserSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                        <div style={{ flex: 2, minWidth: '200px' }}><label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Email</label><input type="email" required value={singleUser.email} onChange={e => setSingleUser({ ...singleUser, email: e.target.value })} style={{ padding: '0.6rem', width: '100%', borderRadius: '6px', border: '1px solid var(--border-color)' }} /></div>
                                        <div style={{ flex: 1, minWidth: '150px' }}><label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Cliente</label><input type="text" required value={singleUser.client} onChange={e => setSingleUser({ ...singleUser, client: e.target.value })} style={{ padding: '0.6rem', width: '100%', borderRadius: '6px', border: '1px solid var(--border-color)' }} /></div>
                                        <div style={{ flex: 1, minWidth: '120px' }}><label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Rol</label><select value={singleUser.role} onChange={e => setSingleUser({ ...singleUser, role: e.target.value })} style={{ padding: '0.6rem', width: '100%', borderRadius: '6px', border: '1px solid var(--border-color)' }}><option value="CLIENT">CLIENT</option><option value="ADMIN">ADMIN</option></select></div>
                                        <button type="submit" style={{ padding: '0.65rem 1.2rem', borderRadius: '6px', backgroundColor: 'var(--primary)', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Crear</button>
                                    </form>
                                </div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Listado y Filtros</h3>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                    <input type="text" placeholder="Buscar..." value={userFilter.text} onChange={e => setUserFilter({ ...userFilter, text: e.target.value })} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', minWidth: '250px' }} />
                                    <select value={userFilter.role} onChange={e => setUserFilter({ ...userFilter, role: e.target.value })} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}><option value="ALL">Todos</option><option value="ADMIN">ADMIN</option><option value="CLIENT">CLIENT</option></select>
                                </div>
                                <div style={{ overflowX: 'auto', backgroundColor: 'var(--background-card)', borderRadius: '12px', border: '1px solid var(--border-color)', maxHeight: '400px', overflowY: 'auto', marginBottom: '2rem' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--background-card)', zIndex: 1 }}><tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}><th style={{ padding: '1rem' }}>Email</th><th style={{ padding: '1rem' }}>Rol</th><th style={{ padding: '1rem' }}>Cliente</th><th style={{ padding: '1rem' }}>Estado</th><th style={{ padding: '1rem' }}>Acciones</th></tr></thead>
                                        <tbody>
                                            {filteredUsers.map(u => (<tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}><td style={{ padding: '1rem' }}>{u.email}</td><td style={{ padding: '1rem' }}><span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: u.role === 'ADMIN' ? '#fef3c7' : '#e0f2fe', color: u.role === 'ADMIN' ? '#d97706' : '#0369a1' }}>{u.role}</span></td><td style={{ padding: '1rem' }}>{u.client}</td><td style={{ padding: '1rem' }}><span style={{ color: u.status === 'ACTIVO' ? 'green' : 'orange' }}>{u.status}</span></td><td style={{ padding: '1rem' }}><button onClick={() => handleDeleteUser(u.id)} style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Eliminar</button></td></tr>))}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{ backgroundColor: 'var(--background-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)' }}>📤 Carga Masiva (CSV)</h3>
                                    <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', fontSize: '0.85rem', lineHeight: '1.6' }}>
                                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#0369a1' }}>📋 Formato del CSV:</p>
                                        <code style={{ display: 'block', backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px', marginBottom: '0.5rem', fontSize: '0.8rem' }}>email,client,role,action</code>
                                        <ul style={{ margin: '0.5rem 0 0 1.2rem', padding: 0 }}>
                                            <li><strong>email</strong>: Email del usuario (requerido)</li>
                                            <li><strong>client</strong>: Nombre del cliente (requerido)</li>
                                            <li><strong>role</strong>: ADMIN o CLIENT (requerido)</li>
                                            <li><strong>action</strong>: CREATE, UPDATE o DELETE (opcional, por defecto CREATE)</li>
                                        </ul>
                                        <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>💡 Tip: Exporta el CSV actual para ver el formato correcto</p>
                                    </div>
                                    <input type="file" accept=".csv" onChange={handleFileUpload} style={{ width: '100%' }} />
                                </div>
                            </section>
                        </div>
                    )}

                    {/* --- TAB CONTENT: CATEGORIES --- */}
                    {activeTab === 'categories' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <section>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>Añadir Categorías</h2>
                                <div style={{ backgroundColor: 'var(--background-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <form onSubmit={handleBulkCatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <textarea rows={4} value={catBulkText} onChange={e => setCatBulkText(e.target.value)} placeholder="Cat1, Cat2, ..." style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                                        <button type="submit" style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--primary)', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', width: 'fit-content' }}>Crear</button>
                                    </form>
                                </div>
                            </section>
                            <section>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>Categorías ({categories.length})</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: 'var(--background-card)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', maxHeight: '500px', overflowY: 'auto' }}>
                                    {categories.map(cat => (
                                        <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{cat}</span>
                                            <button onClick={() => handleDeleteCategory(cat)} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>🗑️ Eliminar</button>
                                        </div>
                                    ))}
                                    {categories.length === 0 && <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>No hay categorías creadas.</p>}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* --- TAB CONTENT: SERIES --- */}
                    {activeTab === 'series' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <section>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>{editingSeries ? 'Editar Serie' : 'Crear Serie'}</h2>
                                <div style={{ backgroundColor: 'var(--background-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <form onSubmit={editingSeries ? handleUpdateSeries : handleCreateSeries} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <input type="text" required value={editingSeries ? editingSeries.current : seriesInput} onChange={e => editingSeries ? setEditingSeries({ ...editingSeries, current: e.target.value }) : setSeriesInput(e.target.value)} placeholder="Nombre Serie" style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                                        <button type="submit" style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: editingSeries ? '#ca8a04' : 'var(--primary)', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }}>{editingSeries ? 'Guardar' : 'Crear'}</button>
                                        {editingSeries && <button type="button" onClick={() => setEditingSeries(null)} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'transparent' }}>Cancelar</button>}
                                    </form>
                                </div>
                            </section>
                            <section>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>Series ({seriesList.length})</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto' }}>
                                    {seriesList.map(item => (
                                        <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--background-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                            <span style={{ fontWeight: 500 }}>{item}</span>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => setEditingSeries({ original: item, current: item })} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', backgroundColor: '#fef3c7', color: '#b45309', border: 'none', cursor: 'pointer' }}>Editar</button>
                                                <button onClick={() => handleDeleteSeries(item)} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer' }}>Borrar</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL EDIT VIDEO --- */}
            {editingVideo && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Editar Vídeo</h2>
                        <form onSubmit={handleSaveEditedVideo} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div><label>Título</label><input type="text" value={editingVideo.title} onChange={e => setEditingVideo({ ...editingVideo, title: e.target.value })} style={{ width: '100%', padding: '0.7rem', border: '1px solid var(--border-color)', borderRadius: '6px' }} /></div>
                            <div><label>URL</label><input type="text" value={editingVideo.url} onChange={e => setEditingVideo({ ...editingVideo, url: e.target.value })} style={{ width: '100%', padding: '0.7rem', border: '1px solid var(--border-color)', borderRadius: '6px' }} /></div>
                            <div><label>Serie</label><select value={editingVideo.series || ''} onChange={e => setEditingVideo({ ...editingVideo, series: e.target.value || undefined })} style={{ width: '100%', padding: '0.7rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}><option value="">-- Sin Serie --</option>{seriesList.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                            <div>
                                <label>Categorías</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {categories.map(cat => {
                                        const isSelected = editingVideo.categories.includes(cat);
                                        return <button key={cat} type="button" onClick={() => { const newCats = isSelected ? editingVideo.categories.filter(c => c !== cat) : [...editingVideo.categories, cat]; setEditingVideo({ ...editingVideo, categories: newCats }); }} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', backgroundColor: isSelected ? 'var(--primary)' : '#f1f5f9', color: isSelected ? 'white' : 'black', border: 'none' }}>{cat}</button>
                                    })}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" style={{ flex: 1, padding: '0.8rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Guardar</button>
                                <button type="button" onClick={() => setEditingVideo(null)} style={{ flex: 1, padding: '0.8rem', backgroundColor: '#e2e8f0', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
