import { ReactNode } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { PageShell } from '@/components/ui/PageShell';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="flex h-screen bg-muted-50 dark:bg-muted-950 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 bg-muted-50 dark:bg-muted-950">
            <div className="max-w-7xl mx-auto w-full">
              <PageShell>
                {children}
              </PageShell>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
