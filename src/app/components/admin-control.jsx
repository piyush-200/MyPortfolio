import { useState } from 'react';
import { Lock, Unlock, X } from 'lucide-react';
import { useAdmin } from '@/app/contexts/admin-context';
import { authAPI } from '@/lib/api';

export default function AdminControl() {
  const { isAuthenticated, adminMode, setIsAuthenticated, setAdminMode } = useAdmin();
  const [password, setPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuthenticate = async () => {
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authAPI.login(password);
      setIsAuthenticated(true);
      setAdminMode(true);
      setShowPasswordPrompt(false);
      setPassword('');
    } catch (err) {
      setError(err.message || 'Incorrect password!');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminMode = () => {
    if (!isAuthenticated) {
      setShowPasswordPrompt(true);
    } else {
      setAdminMode(!adminMode);
    }
  };

  const logout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setAdminMode(false);
  };

  return (
    <>
      <div className="fixed top-24 right-2 sm:right-4 z-50 flex gap-1.5 sm:gap-2">
        <button
          onClick={toggleAdminMode}
          className="p-2 sm:p-3 rounded-lg bg-white/90 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-white transition-colors shadow-lg backdrop-blur-sm border-2"
          style={{ borderColor: 'var(--theme-accent)' }}
          title={isAuthenticated ? (adminMode ? 'Lock Admin Mode' : 'Unlock Admin Mode') : 'Unlock Admin Mode'}
        >
          {adminMode ? <Unlock className="w-4 h-4 sm:w-5 sm:h-5" /> : <Lock className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
        {isAuthenticated && (
          <button
            onClick={logout}
            className="p-2 sm:p-3 rounded-lg bg-white/90 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-red-600 dark:text-red-400 transition-colors shadow-lg backdrop-blur-sm border-2 border-red-500"
            title="Logout"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full" style={{ borderColor: 'var(--theme-border)', borderWidth: '1px' }}>
            <h3 className="text-xl sm:text-2xl text-gray-900 dark:text-white mb-3 sm:mb-4">Admin Access</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">Enter password to edit content</p>
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-600 dark:text-red-400 px-3 sm:px-4 py-2 rounded-lg mb-3 sm:mb-4 text-xs sm:text-sm">
                {error}
              </div>
            )}
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleAuthenticate()}
              className="w-full bg-gray-100 dark:bg-slate-700 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-gray-900 dark:text-white mb-3 sm:mb-4 focus:outline-none text-sm sm:text-base"
              style={{ borderColor: 'var(--theme-border)', borderWidth: '1px' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--theme-accent)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--theme-border)';
              }}
              placeholder="Password"
              autoFocus
              disabled={loading}
            />
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handleAuthenticate}
                disabled={loading}
                className="flex-1 text-white px-6 py-3 rounded-lg transition-all disabled:opacity-50"
                style={{ background: 'var(--theme-gradient)' }}
              >
                {loading ? 'Authenticating...' : 'Unlock'}
              </button>
              <button
                onClick={() => {
                  setShowPasswordPrompt(false);
                  setPassword('');
                  setError('');
                }}
                disabled={loading}
                className="flex-1 bg-slate-700 text-gray-300 px-6 py-3 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}