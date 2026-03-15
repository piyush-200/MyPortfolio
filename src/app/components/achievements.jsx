import { useState, useEffect } from 'react';
import { Trophy, Award, Plus, X, Edit2, ExternalLink } from 'lucide-react';
import { useAdmin } from '@/app/contexts/admin-context';
import { supabase } from '@/lib/supabase';

export default function Achievements() {
  const { adminMode } = useAdmin();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    year: new Date().getFullYear().toString(),
    icon: 'Trophy',
    link: ''
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (err) {
      console.error('Error fetching achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  const addAchievement = async () => {
    if (!newAchievement.title.trim() || !newAchievement.description.trim()) return;

    try {
      const { data, error } = await supabase
        .from('achievements')
        .insert([{
          title: newAchievement.title,
          description: newAchievement.description,
          year: parseInt(newAchievement.year),
          icon: newAchievement.icon,
          link: newAchievement.link
        }])
        .select()
        .single();

      if (error) throw error;

      setAchievements([data, ...achievements]);
      setNewAchievement({
        title: '',
        description: '',
        year: new Date().getFullYear().toString(),
        icon: 'Trophy',
        link: ''
      });
    } catch (err) {
      console.error('Error adding achievement:', err);
      alert('Failed to add achievement: ' + err.message);
    }
  };

  const removeAchievement = async (id) => {
    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAchievements(achievements.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting achievement:', err);
      alert('Failed to delete achievement: ' + err.message);
    }
  };

  const getIcon = (iconName) => {
    return iconName === 'Award' ? Award : Trophy;
  };

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center py-10 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          Loading achievements...
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-slate-950/30 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Achievements & Certifications
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Recognition and certifications in AI and technology
          </p>
        </div>

        {/* Add Achievement Form (Admin Only) */}
        {adminMode && (
          <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Edit2 className="w-5 h-5" style={{ color: 'var(--theme-text-accent)' }} />
              <h3 className="text-xl text-white">Add New Achievement</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                value={newAchievement.title}
                onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                className="bg-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none"
                placeholder="Achievement title"
              />
              <textarea
                value={newAchievement.description}
                onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                className="bg-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none resize-none"
                placeholder="Achievement description"
                rows={2}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={newAchievement.year}
                  onChange={(e) => setNewAchievement({ ...newAchievement, year: e.target.value })}
                  className="bg-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none"
                  placeholder="Year"
                  min="1900"
                  max="2100"
                />
                <select
                  value={newAchievement.icon}
                  onChange={(e) => setNewAchievement({ ...newAchievement, icon: e.target.value })}
                  className="bg-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none"
                >
                  <option value="Trophy">Trophy</option>
                  <option value="Award">Award</option>
                </select>
              </div>
              <input
                type="text"
                value={newAchievement.link}
                onChange={(e) => setNewAchievement({ ...newAchievement, link: e.target.value })}
                className="bg-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none"
                placeholder="Link to certificate or credential (optional)"
              />
              <button
                onClick={addAchievement}
                className="text-white px-6 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                style={{ background: 'var(--theme-gradient)' }}
              >
                <Plus className="w-5 h-5" />
                Add Achievement
              </button>
            </div>
          </div>
        )}

        {/* Achievements List */}
        {achievements.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            No achievements added yet. {adminMode && 'Use the form above to add your first achievement.'}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {achievements.map((achievement) => {
              const Icon = getIcon(achievement.icon);
              return (
                <div
                  key={achievement.id}
                  className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-2 border-slate-700/50 hover:border-pink-500/50 rounded-2xl p-6 backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-500/10 relative group"
                >
                  {adminMode && (
                    <button
                      onClick={() => removeAchievement(achievement.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--theme-gradient)' }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg text-white">
                          {achievement.title}
                        </h3>
                        <span className="text-sm px-3 py-1 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: 'var(--theme-bg-subtle)',
                            color: 'var(--theme-text-accent)'
                          }}
                        >
                          {achievement.year}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed mb-2">
                        {achievement.description}
                      </p>
                      {achievement.link && (
                        <a
                          href={achievement.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm mt-2 hover:underline transition-colors"
                          style={{ color: 'var(--theme-text-accent)' }}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Certificate
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}