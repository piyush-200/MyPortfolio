import { useState, useEffect } from 'react';
import { Briefcase, Calendar, Edit2, Trash2, Plus, X, Save, Building } from 'lucide-react';
import { useAdmin } from '@/app/contexts/admin-context';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Experience() {
  const { adminMode } = useAdmin();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
    display_order: 0
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase
          .from('experience')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Experience updated successfully!');
      } else {
        const { error } = await supabase
          .from('experience')
          .insert([formData]);
        if (error) throw error;
        toast.success('Experience added successfully!');
      }
      fetchExperiences();
      resetForm();
    } catch (error) {
      toast.error('Error saving experience');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this experience?')) return;
    try {
      const { error } = await supabase
        .from('experience')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Experience deleted');
      fetchExperiences();
    } catch (error) {
      toast.error('Error deleting experience');
    }
  };

  const handleEdit = (exp) => {
    setEditingId(exp.id);
    setFormData({
      company: exp.company,
      position: exp.position,
      start_date: exp.start_date,
      end_date: exp.end_date || '',
      is_current: exp.is_current,
      description: exp.description,
      display_order: exp.display_order
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      company: '',
      position: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
      display_order: experiences.length
    });
    setEditingId(null);
    setShowAddModal(false);
  };

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center text-gray-400">
          Loading...
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Professional Experience
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            My journey through various roles in Web Development , building scalable solutions and innovative applications
          </p>
        </div>

        {/* Add Button for Admin */}
        {adminMode && (
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 rounded-lg text-white font-medium transition-all hover:scale-105 flex items-center gap-2 mx-auto"
              style={{ background: 'var(--theme-gradient)' }}
            >
              <Plus className="w-5 h-5" />
              Add Experience
            </button>
          </div>
        )}

        {/* Timeline */}
        <div className="relative">
          {/* Experience Items - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {experiences.map((exp, index) => (
              <div key={exp.id} className="relative">
                {/* Content Card */}
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-2 border-slate-700/50 hover:border-cyan-500/50 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-cyan-500/10 backdrop-blur-sm h-full">
                  {/* Company & Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-700/50">
                        <Building className="w-5 h-5" style={{ color: 'var(--theme-text-accent)' }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{exp.company}</h3>
                        {exp.is_current && (
                          <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                            Current
                          </span>
                        )}
                        {!exp.is_current && (
                          <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-slate-700/50 text-gray-400 border border-slate-600/30">
                            Past
                          </span>
                        )}
                      </div>
                    </div>
                    {adminMode && (
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(exp)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(exp.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Position */}
                  <h4 className="text-base font-semibold mb-2" style={{ color: 'var(--theme-text-accent)' }}>
                    {exp.position}
                  </h4>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {exp.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {experiences.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No experience added yet.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingId ? 'Edit Experience' : 'Add Experience'}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Position *</label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Date *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jan 2023"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                    <input
                      type="text"
                      placeholder="Dec 2023"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      disabled={formData.is_current}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_current"
                    checked={formData.is_current}
                    onChange={(e) => setFormData({ ...formData, is_current: e.target.checked, end_date: e.target.checked ? '' : formData.end_date })}
                    className="w-4 h-4 rounded border-slate-600"
                  />
                  <label htmlFor="is_current" className="text-sm text-gray-300">Currently working here</label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                  <textarea
                    required
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
                    placeholder="• Describe your responsibilities&#10;• Highlight key achievements&#10;• Mention technologies used"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-lg text-white font-medium transition-all hover:scale-105"
                    style={{ background: 'var(--theme-gradient)' }}
                  >
                    <Save className="w-5 h-5 inline mr-2" />
                    {editingId ? 'Update' : 'Add'} Experience
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
