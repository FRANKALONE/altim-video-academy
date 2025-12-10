// Helper function to properly escape CSV fields
function escapeCSVField(field: string | undefined | null): string {
    if (!field) return '';
    const str = String(field);
    // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

export { escapeCSVField };
