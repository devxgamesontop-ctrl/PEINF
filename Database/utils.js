/**
 * PEINF Global Utility Functions
 * Shared across multiple scripts for parsing and formatting values.
 */

window.parseValue = function(valStr) {
    if (!valStr || typeof valStr !== 'string') return 0;
    const cleanStr = valStr.toUpperCase();
    if (cleanStr === 'O/C' || cleanStr === 'OC') return 0;
    const val = parseFloat(cleanStr);
    if (cleanStr.includes('T')) return val * 1000000000000;
    if (cleanStr.includes('B')) return val * 1000000000;
    if (cleanStr.includes('M')) return val * 1000000;
    if (cleanStr.includes('K')) return val * 1000;
    return val || 0;
};

window.formatValue = function(val) {
    if (val >= 1000000000000) return (val / 1000000000000).toFixed(2) + 'T';
    if (val >= 1000000000) return (val / 1000000000).toFixed(2) + 'B';
    if (val >= 1000000) return (val / 1000000).toFixed(2) + 'M';
    return val.toLocaleString();
};