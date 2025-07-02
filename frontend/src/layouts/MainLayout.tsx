import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Common/Header';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50">
      {!isHomePage && <Header />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default MainLayout; 