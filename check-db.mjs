// Quick script to check database contents
import { db } from './src/db/index';
import { videos, users, series, categories } from './src/db/schema';

async function checkDatabase() {
    console.log('🔍 Checking database contents...\n');

    try {
        const allVideos = await db.select().from(videos);
        const allUsers = await db.select().from(users);
        const allSeries = await db.select().from(series);
        const allCategories = await db.select().from(categories);

        console.log(`📹 Videos: ${allVideos.length}`);
        if (allVideos.length > 0) {
            console.log('   Sample:', allVideos[0]);
        }

        console.log(`\n👥 Users: ${allUsers.length}`);
        console.log(`📚 Series: ${allSeries.length}`);
        console.log(`🏷️  Categories: ${allCategories.length}`);

        if (allVideos.length === 0) {
            console.log('\n⚠️  WARNING: No videos in database!');
            console.log('   Go to /admin and create some videos or import via CSV');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkDatabase();
