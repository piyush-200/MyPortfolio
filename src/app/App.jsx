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
import Achievements from '@/app/components/achievements';
import Contact from '@/app/components/contact';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Initialize default theme variables
    const root = document.documentElement;
    if (!root.style.getPropertyValue('--theme-primary-start')) {
      root.style.setProperty('--theme-primary-start', '#a855f7');
      root.style.setProperty('--theme-primary-end', '#ec4899');
      root.style.setProperty('--theme-accent', '#a855f7');
      root.style.setProperty('--theme-text-accent', '#d8b4fe');
      root.style.setProperty('--theme-border', 'rgba(168, 85, 247, 0.3)');
      root.style.setProperty('--theme-gradient', 'linear-gradient(to right, #a855f7, #ec4899)');
      root.style.setProperty('--theme-gradient-hover', 'linear-gradient(to right, #9333ea, #db2777)');
      root.style.setProperty('--theme-bg-subtle', 'rgba(168, 85, 247, 0.1)');
      root.style.setProperty('--theme-bg-muted', 'rgba(168, 85, 247, 0.05)');
      root.style.setProperty('--theme-shadow', 'rgba(168, 85, 247, 0.5)');
      root.style.setProperty('--theme-shadow-sm', 'rgba(168, 85, 247, 0.3)');
    }
  }, []);

  return (
    <AdminProvider>
      <div className="min-h-screen bg-black">
        <Navigation mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <AdminControl />
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Achievements />
        <Contact />
        
        {/* Toast Notifications */}
        <Toaster />
        
        {/* Footer */}
        <footer className="border-t py-4" style={{ borderColor: 'var(--theme-border)' }}>
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
            <p className="text-xs">© 2026 AI Portfolio. Built with React & Tailwind CSS.</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-accent)' }}>
              Powered by Advanced Technologies
            </p>
          </div>
        </footer>
      </div>
    </AdminProvider>
  );
}