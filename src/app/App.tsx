import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { AdminProvider } from '@/app/contexts/admin-context';
import { Toaster } from '@/app/components/ui/sonner';
import Navigation from '@/app/components/navigation';
import AdminControl from '@/app/components/admin-control';
import Hero from '@/app/components/hero';
import About from '@/app/components/about';
import Projects from '@/app/components/projects';
import Skills from '@/app/components/skills';
import Contact from '@/app/components/contact';
import Experience from '@/app/components/experience';
import Education from '@/app/components/education';
import Resume from '@/app/components/resume';
import Achievements from '@/app/components/achievements';
import Footer from '@/app/components/footer';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');

  console.log('Current active page:', activePage);

  useEffect(() => {
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage]);

  useEffect(() => {
    // Apply dark mode permanently
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    // Initialize default theme variables with vibrant cyan/purple theme
    const root = document.documentElement;
    
    // Dark mode theme - cyan/purple
    root.style.setProperty('--theme-primary-start', '#00d9ff');
    root.style.setProperty('--theme-primary-end', '#a855f7');
    root.style.setProperty('--theme-accent', '#00d9ff');
    root.style.setProperty('--theme-text-accent', '#00d9ff');
    root.style.setProperty('--theme-border', 'rgba(0, 217, 255, 0.3)');
    root.style.setProperty('--theme-gradient', 'linear-gradient(to right, #00d9ff, #a855f7)');
    root.style.setProperty('--theme-gradient-hover', 'linear-gradient(to right, #00f2ff, #b967ff)');
    root.style.setProperty('--theme-bg-subtle', 'rgba(0, 217, 255, 0.1)');
    root.style.setProperty('--theme-bg-muted', 'rgba(0, 217, 255, 0.05)');
    root.style.setProperty('--theme-shadow', 'rgba(0, 217, 255, 0.5)');
    root.style.setProperty('--theme-shadow-sm', 'rgba(0, 217, 255, 0.3)');
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Hero setActivePage={setActivePage} />;
      case 'experience':
        return <Experience />;
      case 'projects':
        return <Projects setActivePage={setActivePage} />;
      case 'skills':
        return <Skills />;
      case 'education':
        return <Education />;
      case 'resume':
        return <Resume />;
      case 'contact':
        return <Contact />;
      case 'about':
        return <About />;
      case 'achievements':
        return <Achievements />;
      default:
        return <Hero setActivePage={setActivePage} />;
    }
  };

  return (
    <AdminProvider>
      <div className="min-h-screen transition-colors duration-300 bg-gradient-to-b from-slate-950 via-slate-900 to-black">
        <Navigation 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen}
          activePage={activePage}
          setActivePage={setActivePage}
        />
        <AdminControl />
        
        {/* Main Content - Page-based Navigation */}
        <main className="min-h-screen">
          {renderPage()}
        </main>
        
        {/* Footer */}
        <Footer setActivePage={setActivePage} />
        
        {/* Toast Notifications */}
        <Toaster />
      </div>
    </AdminProvider>
  );
}