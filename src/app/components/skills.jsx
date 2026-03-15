import { useState, useEffect } from 'react';
import { Plus, X, Code2, Brain, Cloud, Database, Wrench, Lightbulb, FolderPlus, Trash2, FolderOpen } from 'lucide-react';
import { useAdmin } from '@/app/contexts/admin-context';
import { skillsAPI } from '@/lib/api';
import { toast } from 'sonner';
import StatsSection from '@/app/components/stats-section';

export default function Skills() {
  const { adminMode } = useAdmin();
  const [skills, setSkills] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState({ name: '', category: '', level: '' });
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [customCategories, setCustomCategories] = useState([]);
  const [deletingCategory, setDeletingCategory] = useState(null);

  useEffect(() => {
    fetchSkills();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const categories = await skillsAPI.getCategories();
      setCustomCategories(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const data = await skillsAPI.getAll();
      setSkills(data);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async () => {
    if (!newSkill.name.trim() || !newSkill.category.trim()) return;
    try {
      await skillsAPI.add(newSkill);
      fetchSkills();
      setNewSkill({ name: '', category: newSkill.category, level: '' });
      toast.success('Skill added successfully!');
    } catch (error) {
      console.error('Error adding skill:', error);
      toast.error('Failed to add skill');
    }
  };

  const removeSkill = async (id) => {
    try {
      await skillsAPI.remove(id);
      fetchSkills();
      toast.success('Skill removed successfully!');
    } catch (error) {
      console.error('Error removing skill:', error);
      toast.error('Failed to remove skill');
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    
    // Check if category already exists
    if (customCategories.includes(newCategory.trim())) {
      toast.error('Category already exists!');
      return;
    }
    
    try {
      // Add category to database
      await skillsAPI.addCategory(newCategory.trim());
      
      // Refresh categories from database
      await fetchCategories();
      
      // Select the new category
      setNewSkill({ ...newSkill, category: newCategory.trim() });
      setNewCategory('');
      setShowAddCategory(false);
      toast.success(`Category "${newCategory.trim()}" created! Now add skills to it.`);
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const removeCategory = async (categoryName) => {
    // Count skills in this category
    const skillsInCategory = skills.filter(s => s.category === categoryName);
    
    if (skillsInCategory.length > 0) {
      const confirmed = window.confirm(
        `This category contains ${skillsInCategory.length} skill(s). Deleting it will remove all skills in this category. Are you sure?`
      );
      if (!confirmed) return;
    }

    try {
      setDeletingCategory(categoryName);
      
      // Delete the category (this will also delete associated skills via the API)
      await skillsAPI.deleteCategory(categoryName);
      
      // Refresh both categories and skills lists
      await fetchCategories();
      await fetchSkills();
      
      // If the deleted category was active, switch to 'All'
      if (activeCategory === categoryName) {
        setActiveCategory('All');
      }
      
      toast.success(`Category "${categoryName}" and its skills removed successfully!`);
    } catch (error) {
      console.error('Error removing category:', error);
      toast.error('Failed to remove category');
    } finally {
      setDeletingCategory(null);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Expert':
        return 'text-green-400';
      case 'Advanced':
        return 'text-blue-400';
      case 'Intermediate':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category) => {
    // Simple hashing to get consistent icon for category
    const iconMap = [Code2, Brain, Cloud, Database, Wrench, Lightbulb];
    const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return iconMap[hash % iconMap.length];
  };

  const getCategoryColor = (category) => {
    // Generate consistent color for each category
    const colorSchemes = [
      { bg: 'bg-blue-500/10', border: 'border-blue-500/50', text: 'text-blue-400' },
      { bg: 'bg-purple-500/10', border: 'border-purple-500/50', text: 'text-purple-400' },
      { bg: 'bg-green-500/10', border: 'border-green-500/50', text: 'text-green-400' },
      { bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', text: 'text-yellow-400' },
      { bg: 'bg-pink-500/10', border: 'border-pink-500/50', text: 'text-pink-400' },
      { bg: 'bg-cyan-500/10', border: 'border-cyan-500/50', text: 'text-cyan-400' },
      { bg: 'bg-orange-500/10', border: 'border-orange-500/50', text: 'text-orange-400' },
      { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-400' },
    ];
    const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colorSchemes[hash % colorSchemes.length];
  };

  const filteredSkills = activeCategory === 'All' 
    ? skills 
    : skills.filter(skill => skill.category === activeCategory);

  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {});

  // Create category tabs from actual skills data
  const categoryTabs = [
    { id: 'All', label: 'All', icon: Lightbulb },
    ...customCategories.map(cat => ({
      id: cat,
      label: cat,
      icon: getCategoryIcon(cat)
    }))
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading skills...</div>
      </div>
    );
  }

  return (
    <section className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Skills & Expertise
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            A comprehensive overview of my technical skills, tools, and technologies I've mastered throughout my professional journey.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categoryTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  activeCategory === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400 border-2 border-cyan-500/50'
                    : 'bg-slate-800/50 text-gray-400 border-2 border-slate-700/50 hover:border-slate-600/50 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Admin Controls */}
        {adminMode && (
          <div className="bg-slate-800/50 border-2 border-cyan-500/30 rounded-2xl p-6 mb-8 space-y-4">
            {/* Add New Skill */}
            <div>
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Add New Skill</h3>
              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Skill name"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white flex-1 min-w-[200px]"
                />
                
                {/* Category Selection/Input */}
                <div className="flex gap-2">
                  {customCategories.length > 0 ? (
                    <select
                      value={newSkill.category}
                      onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                      className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="">Select category...</option>
                      {customCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Category name"
                      value={newSkill.category}
                      onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                      className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white min-w-[200px]"
                    />
                  )}
                  
                  <button
                    onClick={() => setShowAddCategory(!showAddCategory)}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-400 font-semibold flex items-center gap-2"
                    title="Add new category"
                  >
                    <FolderPlus className="w-4 h-4" />
                    {showAddCategory ? 'Cancel' : 'New Category'}
                  </button>
                </div>
                
                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                  className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="">None (no proficiency level)</option>
                  <option value="Expert">Expert</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Intermediate">Intermediate</option>
                </select>
                
                <button
                  onClick={addSkill}
                  disabled={!newSkill.name.trim() || !newSkill.category.trim()}
                  className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg text-white font-semibold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Skill
                </button>
              </div>
            </div>

            {/* Add New Category */}
            {showAddCategory && (
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-lg font-bold text-blue-400 mb-3">Create New Category</h4>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="New category name (e.g., Web Development, AI/ML)"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                    className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white flex-1"
                  />
                  <button
                    onClick={addCategory}
                    disabled={!newCategory.trim()}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg text-white font-semibold flex items-center gap-2"
                  >
                    <FolderPlus className="w-4 h-4" />
                    Create & Use
                  </button>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  This will create a new category and select it for your next skill.
                </p>
              </div>
            )}

            {/* Manage Categories */}
            <div className="border-t border-slate-700 pt-4">
              <h4 className="text-lg font-bold text-red-400 mb-3">Manage Categories</h4>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowManageCategories(!showManageCategories)}
                  className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 font-semibold flex items-center gap-2"
                >
                  <FolderOpen className="w-4 h-4" />
                  {showManageCategories ? 'Hide' : 'Show'} Categories
                </button>
              </div>
              {showManageCategories && (
                <div className="mt-4">
                  <h5 className="text-md font-bold text-gray-400 mb-2">Available Categories</h5>
                  <ul className="list-disc pl-5">
                    {customCategories.map(cat => (
                      <li key={cat} className="flex items-center gap-2">
                        <span className="text-gray-300">{cat}</span>
                        <button
                          onClick={() => removeCategory(cat)}
                          disabled={deletingCategory === cat}
                          className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 font-semibold flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          {deletingCategory === cat ? 'Deleting...' : 'Delete'}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Skills Display */}
        {Object.keys(groupedSkills).length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No skills added yet.</p>
            {adminMode && (
              <p className="text-gray-500 text-sm mt-2">
                Use the admin panel above to add your first skill and category!
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-8 mb-16">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => {
              const Icon = getCategoryIcon(category);
              const colors = getCategoryColor(category);
              
              return (
                <div key={category} className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-6`}>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 ${colors.bg} border-2 ${colors.border} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${colors.text}`}>{category}</h3>
                    </div>
                  </div>

                  {/* Skills List - Grid of compact boxes */}
                  <div className="flex flex-wrap gap-3">
                    {categorySkills.map((skill) => (
                      <div
                        key={skill.id}
                        className="group relative bg-slate-900/50 border border-slate-700/50 rounded-lg px-6 py-2.5 min-w-[120px] flex items-center gap-2 hover:border-slate-600/50 transition-all"
                      >
                        {/* Level dot - only show if level exists */}
                        {skill.level && (
                          <div className={`w-2 h-2 rounded-full ${getLevelColor(skill.level)}`} />
                        )}
                        
                        {/* Skill name */}
                        <span className="text-white font-medium">{skill.name}</span>
                        
                        {/* Level badge - only show if level exists */}
                        {skill.level && (
                          <span className={`text-xs ${getLevelColor(skill.level)} opacity-70`}>
                            ({skill.level})
                          </span>
                        )}
                        
                        {/* Delete button - only show in admin mode */}
                        {adminMode && (
                          <button
                            onClick={() => removeSkill(skill.id)}
                            className="ml-1 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Skills Stats */}
        <StatsSection section="skills" />

        {/* Continuous Learning Section */}
        {skills.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-slate-800/60 to-slate-900/60 border-2 border-slate-700/50 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Continuous Learning</h3>
            <p className="text-gray-400 mb-6 max-w-3xl mx-auto">
              I believe in staying current with emerging technologies and continuously expanding my skill set. Always learning and growing!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}