import { useState, useEffect } from 'react';
import { Plus, X, Edit2, Save, GripVertical } from 'lucide-react';
import { useAdmin } from '@/app/contexts/admin-context';
import { statsAPI } from '@/lib/api';
import { toast } from 'sonner';
import StatCard from './ui/stat-card';

const iconOptions = [
  { value: 'graduation-cap', label: 'Graduation Cap' },
  { value: 'award', label: 'Award' },
  { value: 'book-open', label: 'Book' },
  { value: 'trophy', label: 'Trophy' },
  { value: 'code', label: 'Code' },
  { value: 'trending-up', label: 'Trending Up' },
  { value: 'star', label: 'Star' },
  { value: 'wrench', label: 'Wrench' },
  { value: 'file-code', label: 'File Code' },
  { value: 'target', label: 'Target' },
  { value: 'zap', label: 'Zap' },
];

const gradientOptions = [
  { value: 'blue-cyan', label: 'Blue to Cyan' },
  { value: 'yellow-orange', label: 'Yellow to Orange' },
  { value: 'red-orange', label: 'Red to Orange' },
  { value: 'purple-pink', label: 'Purple to Pink' },
  { value: 'green-teal', label: 'Green to Teal' },
  { value: 'indigo-blue', label: 'Indigo to Blue' },
];

export default function StatsSection({ section }) {
  const { adminMode } = useAdmin();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStat, setNewStat] = useState({
    section: section,
    label: '',
    value: '',
    icon: 'code',
    gradient: 'blue-cyan',
    display_order: 0
  });

  useEffect(() => {
    fetchStats();
  }, [section]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await statsAPI.getAll();
      setStats(data.filter(stat => stat.section === section));
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const addStat = async () => {
    if (!newStat.label || !newStat.value) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await statsAPI.add(newStat);
      await fetchStats();
      setNewStat({
        section: section,
        label: '',
        value: '',
        icon: 'code',
        gradient: 'blue-cyan',
        display_order: 0
      });
      setShowAddForm(false);
      toast.success('Stat added successfully!');
    } catch (error) {
      console.error('Error adding stat:', error);
      toast.error('Failed to add stat');
    }
  };

  const updateStat = async (id) => {
    try {
      await statsAPI.update(id, editingData);
      await fetchStats();
      setEditingId(null);
      setEditingData(null);
      toast.success('Stat updated successfully!');
    } catch (error) {
      console.error('Error updating stat:', error);
      toast.error('Failed to update stat');
    }
  };

  const deleteStat = async (id) => {
    if (!confirm('Are you sure you want to delete this stat?')) return;

    try {
      await statsAPI.delete(id);
      await fetchStats();
      toast.success('Stat deleted successfully!');
    } catch (error) {
      console.error('Error deleting stat:', error);
      toast.error('Failed to delete stat');
    }
  };

  const startEditing = (stat) => {
    setEditingId(stat.id);
    setEditingData({ ...stat });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingData(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!adminMode && stats.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={stat.id} className="relative group">
            {adminMode && !editingId && (
              <div className="absolute -top-2 -right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEditing(stat)}
                  className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
                  title="Edit"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteStat(stat.id)}
                  className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white"
                  title="Delete"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {editingId === stat.id ? (
              <div className="bg-slate-900/50 rounded-2xl p-6 border border-blue-500">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Value</label>
                    <input
                      type="text"
                      value={editingData.value}
                      onChange={(e) => setEditingData({ ...editingData, value: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                      placeholder="e.g., 8.5 or 92%"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Label</label>
                    <input
                      type="text"
                      value={editingData.label}
                      onChange={(e) => setEditingData({ ...editingData, label: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                      placeholder="e.g., Current CGPA"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Icon</label>
                    <select
                      value={editingData.icon}
                      onChange={(e) => setEditingData({ ...editingData, icon: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                    >
                      {iconOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Gradient</label>
                    <select
                      value={editingData.gradient}
                      onChange={(e) => setEditingData({ ...editingData, gradient: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                    >
                      {gradientOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStat(stat.id)}
                      className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <StatCard stat={stat} index={index} />
            )}
          </div>
        ))}

        {adminMode && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-slate-900/30 backdrop-blur-sm rounded-2xl p-6 border-2 border-dashed border-slate-700 hover:border-cyan-500 transition-all flex items-center justify-center group"
          >
            <div className="text-center">
              <Plus className="w-8 h-8 text-slate-600 group-hover:text-cyan-500 mx-auto mb-2 transition-colors" />
              <span className="text-sm text-slate-600 group-hover:text-cyan-500 transition-colors">Add Stat</span>
            </div>
          </button>
        )}

        {adminMode && showAddForm && (
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-cyan-500">
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Value *</label>
                <input
                  type="text"
                  value={newStat.value}
                  onChange={(e) => setNewStat({ ...newStat, value: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                  placeholder="e.g., 8.5 or 92%"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Label *</label>
                <input
                  type="text"
                  value={newStat.label}
                  onChange={(e) => setNewStat({ ...newStat, label: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                  placeholder="e.g., Current CGPA"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Icon</label>
                <select
                  value={newStat.icon}
                  onChange={(e) => setNewStat({ ...newStat, icon: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                >
                  {iconOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Gradient</label>
                <select
                  value={newStat.gradient}
                  onChange={(e) => setNewStat({ ...newStat, gradient: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                >
                  {gradientOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addStat}
                  className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewStat({
                      section: section,
                      label: '',
                      value: '',
                      icon: 'code',
                      gradient: 'blue-cyan',
                      display_order: 0
                    });
                  }}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
