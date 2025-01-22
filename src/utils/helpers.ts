import { useDropzone, Accept } from 'react-dropzone';

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
  // If the date string is 'Recent', return 'recent'
  if (date === 'Recently') {
    return 'Recently';
  }

  const now = new Date();
  const inputDate = new Date(date); // Ensure the input is in ISO 8601 or standard date format
  const diffInMilliseconds = now.getTime() - inputDate.getTime();
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // If the difference is less than 30 seconds, return "Recently"
  if (diffInSeconds < 30) {
    return 'Recently';
  }

  // If the date is within the last 24 hours, show relative time
  if (diffInDays === 0) {
    if (diffInHours === 0) {
      return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''}`; // Minutes ago
    }
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`; // Hours ago
  }

  // If the date is 1 day ago
  if (diffInDays === 1) {
    return 'Yesterday'; // Yesterday
  }

  // Show the formatted date for older dates
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return inputDate.toLocaleDateString('en-US', options); // Ensure 'en-US' format or adjust locale as needed
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

export const getEditorLanguage = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (!extension || extension === '') {
    return 'markdown'; // Handle files without extension or empty extensions
  }

  switch (extension) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'cs':
      return 'c#';
    case 'cpp':
      return 'c++';
    case 'php':
      return 'php';
    case 'sh':
      return 'bash/shell';
    case 'sql':
      return 'sql';
    case 'go':
      return 'go';
    case 'rs':
      return 'rust';
    case 'kt':
      return 'kotlin';
    case 'ps1':
      return 'powershell';
    case 'json':
      return 'json';
    case 'xml':
      return 'xml';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'swift':
      return 'swift';
    case 'rb':
      return 'ruby';
    case 'dart':
      return 'dart';
    case 'txt':
      return 'plain text';
    default:
      return 'markdown';
  }
};

export const acceptTypes: Accept = {
  'text/javascript': ['.js', '.jsx', '.mjs'],
  'text/x-typescript': ['.ts', '.tsx'],
  'text/x-markdown': ['.md', '.markdown', '.mdown', '.mkd'],
  'application/python': ['.py', '.pyw'],
  'application/java': ['.java', '.jar', '.class'],
  'text/x-csharp': ['.cs', '.csx'],
  'text/x-c++': ['.cpp', '.cc', '.cxx', '.h', '.hpp'],
  'application/php': ['.php', '.phtml'],
  'application/shellscript': ['.sh', '.bash'],
  'text/html': ['.html', '.htm'],
  'application/sql': ['.sql', '.db'],
  'text/go': ['.go'],
  'text/rust': ['.rs'],
  'text/kotlin': ['.kt', '.kts'],
  'application/powershell': ['.ps1', '.psm1'],
  'text/css': ['.css'],
  'application/json': ['.json'],
  'application/xml': ['.xml'],
  'application/yaml': ['.yaml', '.yml'],
  'text/x-swift': ['.swift'],
  'text/x-ruby': ['.rb'],
  'application/dart': ['.dart'],
  'text/plain': ['.txt'],
};

