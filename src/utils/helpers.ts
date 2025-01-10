export const formatNumber = (num: number): string => {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (num >= 1e6) {
        return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1e3) {
        return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
};

export const formatDate = (date: string): string => {
    const now = new Date();
    const inputDate = new Date(date);
    const diffInMilliseconds = now.getTime() - inputDate.getTime();
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // If the date is within the last 24 hours, show relative time
    if (diffInDays === 0) {
        if (diffInHours === 0) {
            if (diffInMinutes === 0) {
                if (diffInSeconds < 60) {
                    return `${diffInSeconds} seconds ago`; // Less than a minute ago
                }
            }
            return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`; // Minutes ago
        }
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`; // Hours ago
    }

    // If the date is 1 day ago
    if (diffInDays === 1) {
        return 'Yesterday'; // Yesterday
    }

    // Show the formatted date for older dates
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return inputDate.toLocaleDateString(undefined, options); // Long formatted date for older dates
};


// Function for validating email format
export const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Function for validating password strength
export const isStrongPassword = (password: string) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
};

export const getMimeTypeForExtension = (extension: string): string | undefined => {
    const mimeTypes: Record<string, string> = {
        '.js': 'text/javascript',
        '.jsx': 'text/javascript',
        '.md': 'text/x-markdown',
        '.markdown': 'text/x-markdown',
        '.txt': 'text/plain', // Add any other file types you want to support
        // Add more MIME types as needed
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'; // Default to a generic binary MIME type if not found
};