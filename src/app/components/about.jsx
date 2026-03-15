import { useState, useEffect } from 'react';
import { Briefcase, Lightbulb, Code, Edit2, Save, X } from 'lucide-react';
import { useAdmin } from '@/app/contexts/admin-context';
import { supabase } from '@/lib/supabase';

export default function About() {
  const { adminMode } = useAdmin();
  const [aboutData, setAboutData] = useState({
    title: 'Quick Overview',
    description: "Here's a snapshot of my professional journey and expertise"
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const { data, error } = await supabase
        .from('about')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setAboutData(data);
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditForm({
      title: aboutData.title,
      description: aboutData.description
    });
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      const { data: existing } = await supabase
        .from('about')
        .select('id')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('about')
          .update(editForm)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('about')
          .insert([editForm]);
        if (error) throw error;
      }

      setAboutData({ ...aboutData, ...editForm });
      setEditing(false);
    } catch (error) {
      console.error('Error saving about data:', error);
      alert('Error saving changes');
    }
  };

  if (loading) {
    return (
      <section id="about" className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          Loading...
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-black/60 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            {editing ? (
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-center"
              />
            ) : (
              aboutData.title
            )}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {editing ? (
              <input
                type="text"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-center"
              />
            ) : (
              aboutData.description
            )}
          </p>
          {adminMode && (
            <div className="mt-4 flex gap-2 justify-center">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-lg text-white text-sm"
                    style={{ background: 'var(--theme-gradient)' }}
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 rounded-lg text-white text-sm"
                  style={{ background: 'var(--theme-gradient)' }}
                >
                  <Edit2 className="w-4 h-4 inline mr-2" />
                  Edit
                </button>
              )}
            </div>
          )}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Professional Roles */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 text-center hover:border-slate-600 transition-all group">
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Professional Roles</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              From AI Engineer to DevOps Engineer, building scalable solutions
            </p>
          </div>

          {/* Key Projects */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 text-center hover:border-slate-600 transition-all group">
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
            >
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Key Projects</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Innovative AI and ML solutions with real-world impact
            </p>
          </div>

          {/* Technical Skills */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 text-center hover:border-slate-600 transition-all group">
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}
            >
              <Code className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Technical Skills</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Expertise in Python, AWS, Docker, ML frameworks, and more
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}