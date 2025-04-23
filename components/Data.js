
const timeDifference = (start) => {
    const startDate = new Date(start);
    const now = new Date();

    const msIn24Hours = 1000 * 60 * 60 * 24;
    const endDate = new Date(startDate.getTime() + msIn24Hours);
    const diffMs = endDate - now;

    if (diffMs <= 0) {
        return 'ready';
    }

    const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const diffSeconds = Math.floor((diffMs / 1000) % 60);

    return `${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
};

module.exports = { timeDifference };