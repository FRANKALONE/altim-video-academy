
'use server';

import { db } from '@/db';
import { videos, users, series, categories, permissions, videoCategories, type NewVideo, type NewUser } from '@/db/schema';
import { eq, like, or, desc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// --- VIDEOS ---

export async function getVideos(query: string = '') {
    const allVideos = await db.query.videos.findMany({
        with: {
            series: true,
            // videoCategories: { with: { category: true } } // This is complex in simplified query, letting's use simple select for now or join
        },
        orderBy: [desc(videos.createdAt)],
    });

    // Drizzle doesn't have easy M2M include in query builder without defining relations in schema.ts (which implies more code).
    // For MVP speed, let's fetch categories separately or just rely on text search if needed.
    // Actually, let's just return what we have. We need to join categories manually if we want them in the list.

    // To keep it simple and fast: We'll fetch all and filter in memory if the dataset is small (MVP), 
    // OR we implement proper search via SQL.
    // Let's implement proper search.

    const searchPattern = `%${query}%`;

    // For now, let's just return the raw videos and we'll "enrich" them in the component if needed, 
    // OR we update schema to have relations()
    return allVideos;
}

// Simpler: Just get all videos with basic fields
export async function getAllVideos() {
    // We need categories too. 
    // Let's use a raw query or multiple queries.
    const rawVideos = await db.select().from(videos).orderBy(desc(videos.createdAt));

    // Fetch categories for each video (N+1 problem but fine for MVP < 100 videos)
    const result = await Promise.all(rawVideos.map(async (v) => {
        const cats = await db.select({ name: categories.name })
            .from(videoCategories)
            .innerJoin(categories, eq(videoCategories.categoryId, categories.id))
            .where(eq(videoCategories.videoId, v.id));

        // Get series name
        let seriesName: string | undefined = undefined;
        if (v.seriesId) {
            const s = await db.select({ title: series.title }).from(series).where(eq(series.id, v.seriesId)).get();
            seriesName = s?.title || undefined;
        }

        return {
            ...v,
            categories: cats.map(c => c.name),
            series: seriesName
        };
    }));

    return result;
}

export async function createVideo(data: Omit<NewVideo, 'id' | 'createdAt'> & { categories: string[] }) {
    const newId = crypto.randomUUID();

    // 1. Create Video
    await db.insert(videos).values({
        id: newId,
        title: data.title,
        urlVimeo: data.urlVimeo,
        description: data.description,
        author: data.author,
        seriesId: data.seriesId, // This expects ID, not name. Admin form sends name? We need to fix that interaction.
        successStory: data.successStory,
        featured: data.featured,
        thumbnailUrl: data.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
        duration: '00:00'
    });

    // 2. Link Categories (Find or Create?)
    // For now, assume categories exist or we create them? Requirements said "Create Single & Bulk".
    // Let's try to find ID by name.
    for (const catName of data.categories) {
        let cat = await db.select().from(categories).where(eq(categories.name, catName)).get();
        if (!cat) {
            // Create if not exists (Auto-create tags)
            const catId = crypto.randomUUID();
            await db.insert(categories).values({ id: catId, name: catName });
            cat = { id: catId, name: catName };
        }
        await db.insert(videoCategories).values({ videoId: newId, categoryId: cat.id });
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, id: newId };
}

export async function updateVideo(id: string, data: Partial<NewVideo> & { categories?: string[] }) {
    await db.update(videos).set(data).where(eq(videos.id, id));

    if (data.categories) {
        // Wipe and rewrite categories (simplest impl)
        await db.delete(videoCategories).where(eq(videoCategories.videoId, id));
        for (const catName of data.categories) {
            let cat = await db.select().from(categories).where(eq(categories.name, catName)).get();
            if (!cat) {
                const catId = crypto.randomUUID();
                await db.insert(categories).values({ id: catId, name: catName });
                cat = { id: catId, name: catName };
            }
            await db.insert(videoCategories).values({ videoId: id, categoryId: cat.id });
        }
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}

export async function deleteVideo(id: string) {
    await db.delete(videos).where(eq(videos.id, id));
    revalidatePath('/admin');
    return { success: true };
}

export async function toggleFeaturedVideo(id: string, currentStatus: boolean) {
    await db.update(videos).set({ featured: !currentStatus }).where(eq(videos.id, id));
    revalidatePath('/admin');
    revalidatePath('/');
}

// --- USERS ---

export async function getUsers() {
    return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function createUser(data: Omit<NewUser, 'id' | 'createdAt'>) {
    // Check if exists
    const existing = await db.select().from(users).where(eq(users.email, data.email)).get();
    if (existing) return { success: false, error: 'User already exists' };

    await db.insert(users).values({
        id: crypto.randomUUID(),
        ...data
    });
    revalidatePath('/admin');
    return { success: true };
}

export async function deleteUser(id: string) {
    await db.delete(users).where(eq(users.id, id));
    revalidatePath('/admin');
    return { success: true };
}

export async function bulkUpsertUsers(usersList: any[]) {
    let created = 0;
    let updated = 0;
    let deleted = 0;
    let errors = 0;

    for (const u of usersList) {
        // u = { email, client, role, action }
        try {
            const existing = await db.select().from(users).where(eq(users.email, u.email)).get();

            if (u.action === 'DELETE') {
                if (existing) {
                    await db.delete(users).where(eq(users.id, existing.id));
                    deleted++;
                } else {
                    errors++;
                }
            } else if (u.action === 'UPDATE') {
                if (existing) {
                    await db.update(users).set({
                        clientName: u.client,
                        role: u.role
                    }).where(eq(users.id, existing.id));
                    updated++;
                } else {
                    errors++;
                }
            } else { // CREATE
                if (!existing) {
                    await db.insert(users).values({
                        id: crypto.randomUUID(),
                        email: u.email,
                        clientName: u.client,
                        role: u.role,
                        status: 'PENDIENTE'
                    });
                    created++;
                } else {
                    errors++;
                }
            }
        } catch (e) {
            console.error(e);
            errors++;
        }
    }

    revalidatePath('/admin');
    return { created, updated, deleted, errors };
}

// --- SERIES ---

export async function getSeries() {
    return await db.select().from(series);
}

export async function createSeries(title: string) {
    const existing = await db.select().from(series).where(eq(series.title, title)).get();
    if (existing) return { success: false, error: 'Series exists' };

    await db.insert(series).values({
        id: crypto.randomUUID(),
        title
    });
    revalidatePath('/admin');
    return { success: true };
}

export async function updateSeries(oldTitle: string, newTitle: string) {
    // Find ID
    const s = await db.select().from(series).where(eq(series.title, oldTitle)).get();
    if (!s) return { success: false, error: 'Not found' };

    await db.update(series).set({ title: newTitle }).where(eq(series.id, s.id));
    revalidatePath('/admin');
    return { success: true };
}

export async function deleteSeries(title: string) {
    // Drizzle references set null automatically if configured, or we do it manually?
    // Schema says "onDelete: set null"
    const s = await db.select().from(series).where(eq(series.title, title)).get();
    if (s) {
        await db.delete(series).where(eq(series.id, s.id));
    }
    revalidatePath('/admin');
    return { success: true };
}

// --- CATEGORIES ---

export async function getCategories() {
    const cats = await db.select().from(categories);
    return cats.map(c => c.name);
}

export async function createCategoriesBulk(names: string[]) {
    let count = 0;
    for (const name of names) {
        const existing = await db.select().from(categories).where(eq(categories.name, name)).get();
        if (!existing) {
            await db.insert(categories).values({
                id: crypto.randomUUID(),
                name
            });
            count++;
        }
    }
    revalidatePath('/admin');
    return count;
}

export async function deleteCategory(name: string) {
    // Find category by name
    const cat = await db.select().from(categories).where(eq(categories.name, name)).get();
    if (cat) {
        // Delete will cascade to videoCategories due to schema onDelete: 'cascade'
        await db.delete(categories).where(eq(categories.id, cat.id));
    }
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
}
