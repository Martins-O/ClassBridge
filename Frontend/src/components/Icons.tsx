import { type LucideProps } from 'lucide-react';
import dynamic from 'next/dynamic';
import { type ComponentType } from 'react';

// Icons are dynamically imported to reduce bundle size
const createIcon = (iconName: string): ComponentType<LucideProps> => {
  return dynamic(
    () =>
      import(`lucide-react`).then(
        (mod) => mod[iconName as keyof typeof mod] as ComponentType<LucideProps>
      ) || (() => null),
    { ssr: false }
  );
};

export const Icons = {
  // UI Icons
  search: createIcon('Search'),
  bell: createIcon('Bell'),
  sun: createIcon('Sun'),
  moon: createIcon('Moon'),
  user: createIcon('User'),
  settings: createIcon('Settings'),
  logout: createIcon('LogOut'),
  chevronDown: createIcon('ChevronDown'),
  menu: createIcon('Menu'),
  x: createIcon('X'),
  
  // Navigation Icons
  home: createIcon('Home'),
  bookOpen: createIcon('BookOpen'),
  clipboardList: createIcon('ClipboardList'),
  barChart: createIcon('BarChart'),
  fileText: createIcon('FileText'),
  school: createIcon('School'),
  
  // Action Icons
  plus: createIcon('Plus'),
  edit: createIcon('Edit'),
  trash: createIcon('Trash'),
  download: createIcon('Download'),
  upload: createIcon('Upload'),
  
  // Status Icons
  check: createIcon('Check'),
  xCircle: createIcon('XCircle'),
  alertCircle: createIcon('AlertCircle'),
  info: createIcon('Info'),
  
  // Social Icons
  mail: createIcon('Mail'),
  github: createIcon('Github'),
  twitter: createIcon('Twitter'),
  linkedin: createIcon('Linkedin'),
};

export type IconName = keyof typeof Icons;
