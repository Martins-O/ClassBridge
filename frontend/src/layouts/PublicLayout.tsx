import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';

export function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default PublicLayout;
