import type { ReactNode } from 'react';

interface LoadingProps {
  children?: ReactNode;
  fullScreen?: boolean;
}

export function Loading({ children, fullScreen = false }: LoadingProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          {children && <p className="text-text-secondary">{children}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        {children && <p className="text-text-secondary text-sm">{children}</p>}
      </div>
    </div>
  );
}

export default Loading;