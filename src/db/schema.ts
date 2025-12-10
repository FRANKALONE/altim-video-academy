
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// --- ENUMS (Simulated in SQLite as text check constraints or just text application-level) ---
// SQLite doesn't have native ENUMs, so we use text.
// Roles: 'ADMIN', 'CLIENT'
// Status: 'ACTIVO', 'PENDIENTE', 'BAJA'

// --- TABLES ---

export const users = sqliteTable('users', {
    id: text('id').primaryKey(), // UUID handled slightly differently, we'll store as text
    email: text('email').notNull().unique(),
    role: text('role').notNull().default('CLIENT'), // 'ADMIN' | 'CLIENT'
    clientName: text('client_name').notNull(),
    status: text('status').notNull().default('PENDIENTE'), // 'ACTIVO' | 'PENDIENTE'
    acceptedTerms: integer('accepted_terms', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const series = sqliteTable('series', {
    id: text('id').primaryKey(),
    title: text('title').notNull().unique(),
    description: text('description'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const videos = sqliteTable('videos', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    urlVimeo: text('url_vimeo').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    duration: text('duration'), // Storing as 'MM:SS' or seconds string for simplicity based on current app
    author: text('author').notNull(),
    featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
    successStory: integer('success_story', { mode: 'boolean' }).notNull().default(false),
    seriesId: text('series_id').references(() => series.id, { onDelete: 'set null' }),
    views: integer('views').default(0),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const categories = sqliteTable('categories', {
    id: text('id').primaryKey(), // We can use the name as ID or a UUID. Let's use UUID for consistency.
    name: text('name').notNull().unique(),
});

// Many-to-Many: Videos <-> Categories
export const videoCategories = sqliteTable('video_categories', {
    videoId: text('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
    categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (t) => ({
    pk: primaryKey({ columns: [t.videoId, t.categoryId] }),
}));

// Permissions: Client (Company Name) <-> Category (Tag)
// Simplified RBAC: "Client 'Coca-Cola' can view Category 'Internal-CocaCola'"
export const permissions = sqliteTable('permissions', {
    id: text('id').primaryKey(),
    clientName: text('client_name').notNull(), // Links to users.clientName (logic level)
    categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// --- TYPES (Derived) ---
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;

export type Series = typeof series.$inferSelect;
export type NewSeries = typeof series.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
