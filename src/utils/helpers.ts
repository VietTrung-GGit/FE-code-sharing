import { useDropzone, Accept } from 'react-dropzone';

export const formatNumber = (num?: number): string => {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0'; // Default value if num is undefined or not a number
  }

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
  if (diffInSeconds < 60) {
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

export const formatDateSimple = (date: string): string => {
  const inputDate = new Date(date);
  if (isNaN(inputDate.getTime())) {
    return 'Invalid Date'; // Handle incorrect date formats
  }

  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return inputDate.toLocaleDateString('en-US', options); // Example: "12 Feb 2025"
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

export const urlToFile = async (imageUrl: string): Promise<File> => {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return new File([blob], 'image');
};

export const getEditorLanguage = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (!extension || extension === '') {
    return 'markdown'; // Handle files without extension or empty extensions
  }

  switch (extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return 'javascript';
    case 'html':
      return 'html';
    case 'css':
      return 'less';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'cpp':
      return 'cpp';
    case 'php':
      return 'php';
    case 'sql':
      return 'sql';
    case 'rs':
      return 'rust';
    case 'json':
      return 'json';
    case 'xml':
      return 'xml';
    case 'md':
      return 'markdown';
    case 'sass':
      return 'sass';
    case 'clj':
      return 'clojure';
    case 'cs':
      return 'csharp';
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

export const tags = [
  'Javascript',
  'Python',
  'Java',
  'C++',
  'C#',
  'PHP',
  'CSS',
  'HTML',
  'SQL',
  'Typescript',
  'Go',
  'Swift',
  'Kotlin',
  'Rust',
  'Android',
  'IOS',
  'AI',
  'Algorithms',
  'Web Dev',
  'Software',
  'Optimization',
  'DevOps',
  'Concurrency',
  'Databases',
  'Bash/Shell',
  'Debug',
  'Idea',
  'News',
  'Powershell',
  'C',
];

export const tagColors: Record<string, string> = {
  Javascript: 'bg-amber-200',
  Python: 'bg-green-200',
  Java: 'bg-rose-200',
  'C++': 'bg-cyan-200',
  'C#': 'bg-purple-200',
  PHP: 'bg-indigo-200',
  CSS: 'bg-blue-200',
  HTML: 'bg-pink-200',
  SQL: 'bg-lime-200',
  Typescript: 'bg-blue-300',
  Go: 'bg-emerald-200',
  Swift: 'bg-red-300',
  Kotlin: 'bg-fuchsia-200',
  Rust: 'bg-orange-300',
  Android: 'bg-lime-300',
  IOS: 'bg-purple-300',
  AI: 'bg-violet-300',
  Algorithms: 'bg-green-300',
  'Web Dev': 'bg-rose-300',
  Software: 'bg-cyan-300',
  Optimization: 'bg-amber-300',
  DevOps: 'bg-green-400',
  Concurrency: 'bg-yellow-300',
  Databases: 'bg-gray-400',
  'Bash/Shell': 'bg-teal-200',
  Debug: 'bg-red-200',
  Idea: 'bg-orange-200',
  News: 'bg-yellow-200',
  Powershell: 'bg-indigo-300',
  C: 'bg-blue-100',
};

