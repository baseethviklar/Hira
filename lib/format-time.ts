export function formatDuration(minutes: number): string {
    if (!minutes) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
}

export function parseDuration(input: string): number {
    // Simple parser: "1h 30m", "1.5h", "90m", "90" (minutes)
    const lower = input.toLowerCase().replace(/\s/g, '');
    let totalMinutes = 0;

    // Check for hours
    const hoursMatch = lower.match(/(\d+(\.\d+)?)h/);
    if (hoursMatch) {
        totalMinutes += parseFloat(hoursMatch[1]) * 60;
    }

    // Check for minutes
    const minsMatch = lower.match(/(\d+)m/);
    if (minsMatch) {
        totalMinutes += parseInt(minsMatch[1]);
    }

    // If just a number, treat as minutes
    if (!hoursMatch && !minsMatch && /^\d+$/.test(lower)) {
        totalMinutes = parseInt(lower);
    }

    return Math.floor(totalMinutes);
}
