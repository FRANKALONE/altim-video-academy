/**
 * Extracts Vimeo video ID from various Vimeo URL formats
 * Supports:
 * - https://vimeo.com/123456789
 * - https://player.vimeo.com/video/123456789
 * - vimeo.com/123456789
 */
export function extractVimeoId(url: string): string | null {
    if (!url) return null;

    // Remove whitespace
    url = url.trim();

    // Pattern 1: player.vimeo.com/video/ID
    const playerMatch = url.match(/player\.vimeo\.com\/video\/(\d+)/);
    if (playerMatch) return playerMatch[1];

    // Pattern 2: vimeo.com/ID
    const directMatch = url.match(/vimeo\.com\/(\d+)/);
    if (directMatch) return directMatch[1];

    // Pattern 3: Just the ID (if someone pastes only numbers)
    if (/^\d+$/.test(url)) return url;

    return null;
}

/**
 * Generates Vimeo thumbnail URL from video URL
 * For now, uses a simple fallback approach
 * In production, you'd want to fetch this from Vimeo's oEmbed API
 */
export function getVimeoThumbnail(vimeoUrl: string, fallbackUrl?: string): string {
    // If we have a fallback URL (from database), use it
    if (fallbackUrl && fallbackUrl !== 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80') {
        return fallbackUrl;
    }

    const videoId = extractVimeoId(vimeoUrl);

    if (!videoId) {
        // Fallback to a generic video placeholder
        return fallbackUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80';
    }

    // For now, return a placeholder that indicates we need the real thumbnail
    // In a real app, you'd call Vimeo's oEmbed API: https://vimeo.com/api/oembed.json?url=https://vimeo.com/{id}
    // Or store the thumbnail URL when creating the video
    return fallbackUrl || `https://via.placeholder.com/1280x720/1e293b/ffffff?text=Video+${videoId}`;
}
