import { pgTable, text, boolean, timestamp, uuid, primaryKey, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// --- TABLES ---

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    role: text('role').notNull().default('CLIENT'), // 'ADMIN' | 'CLIENT'
    clientName: text('client_name').notNull(),
    status: text('status').notNull().default('PENDIENTE'), // 'ACTIVO' | 'PENDIENTE'
    acceptedTerms: boolean('accepted_terms').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

export const series = pgTable('series', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull().unique(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const videos = pgTable('videos', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    urlVimeo: text('url_vimeo').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    duration: text('duration'), // Storing as 'MM:SS' or seconds string
    author: text('author').notNull(),
    featured: boolean('featured').notNull().default(false),
    successStory: boolean('success_story').notNull().default(false),
    seriesId: uuid('series_id').references(() => series.id, { onDelete: 'set null' }),
    views: integer('views').default(0),
    createdAt: timestamp('created_at').defaultNow(),
});

export const categories = pgTable('categories', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull().unique(),
});

// Many-to-Many: Videos <-> Categories
export const videoCategories = pgTable('video_categories', {
    videoId: uuid('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (t) => ({
    pk: primaryKey({ columns: [t.videoId, t.categoryId] }),
}));

// Permissions: Client (Company Name) <-> Category (Tag)
export const permissions = pgTable('permissions', {
    id: uuid('id').defaultRandom().primaryKey(),
    clientName: text('client_name').notNull(),
    categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
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
