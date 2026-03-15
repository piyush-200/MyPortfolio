import { useState, useEffect } from 'react';
import { Brain, MessageSquare, Image, BarChart3, Eye, Cpu, Plus, X, Edit2, Github, ExternalLink, Save, Upload, Filter, Trash2 } from 'lucide-react';
import { useAdmin } from '@/app/contexts/admin-context';
import { projectsAPI } from '@/lib/api';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import StatsSection from '@/app/components/stats-section';

const iconMap = {
  Brain, MessageSquare, Image, BarChart3, Eye, Cpu
};

const gradientOptions = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-green-500 to-emerald-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-purple-500',
  'from-pink-500 to-rose-500',
  'from-yellow-500 to-orange-500',
  'from-teal-500 to-cyan-500'
];

export default function Projects({ setActivePage }) {
  const { adminMode } = useAdmin();
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingProjectData, setEditingProjectData] = useState(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    icon: 'Brain',
    tags: '',
    gradient: 'from-blue-500 to-cyan-500',
    githubUrl: '',
    projectUrl: '',
    category: 'All',
    thumbnailUrl: ''
  });

  // Fetch projects and categories on mount
  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  // Update categories when projects change
  useEffect(() => {
    if (projects.length > 0) {
      fetchCategories();
    }
  }, [projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.getAll();
      setProjects(data);
      setError('');
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await projectsAPI.getCategories();
      // Also extract categories from existing projects
      const projectCategories = [...new Set(projects.map(p => p.category).filter(c => c && c !== 'All'))];
      const allCategories = [...new Set([...cats, ...projectCategories])];
      setCategories(['All', ...allCategories.sort()]);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }
    
    if (categories.includes(newCategoryName.trim())) {
      toast.error('Category already exists');
      return;
    }

    try {
      await projectsAPI.addCategory(newCategoryName.trim());
      await fetchCategories();
      setNewCategoryName('');
      toast.success('Category added successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to add category');
    }
  };

  const deleteCategory = async (category) => {
    if (category === 'All') {
      toast.error('Cannot delete "All" category');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${category}" category? This will not delete projects in this category.`)) {
      return;
    }

    try {
      await projectsAPI.deleteCategory(category);
      await fetchCategories();
      if (selectedCategory === category) {
        setSelectedCategory('All');
      }
      toast.success('Category deleted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    }
  };

  const addProject = async () => {
    if (newProject.title.trim() === '' || newProject.description.trim() === '') return;
    
    try {
      const project = {
        title: newProject.title,
        description: newProject.description,
        icon: newProject.icon,
        tags: newProject.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        gradient: newProject.gradient,
        githubUrl: newProject.githubUrl.trim() || undefined,
        projectUrl: newProject.projectUrl.trim() || undefined,
        category: newProject.category,
        thumbnailUrl: newProject.thumbnailUrl.trim() || undefined
      };

      const addedProject = await projectsAPI.add(project);
      setProjects([...projects, addedProject]);
      setNewProject({
        title: '',
        description: '',
        icon: 'Brain',
        tags: '',
        gradient: 'from-blue-500 to-cyan-500',
        githubUrl: '',
        projectUrl: '',
        category: 'All',
        thumbnailUrl: ''
      });
      toast.success('Project added successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to add project');
    }
  };

  const removeProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectsAPI.delete(id);
      setProjects(projects.filter(project => project.id !== id));
      toast.success('Project removed successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to delete project');
    }
  };

  const startEditingProject = (project) => {
    setEditingProjectId(project.id);
    setEditingProjectData({
      ...project,
      tags: Array.isArray(project.tags) ? project.tags.join(', ') : project.tags,
      category: project.category || 'All',
      thumbnailUrl: project.thumbnailUrl || ''
    });
  };

  const cancelEditingProject = () => {
    setEditingProjectId(null);
    setEditingProjectData(null);
  };

  const saveProjectEdit = async () => {
    if (!editingProjectData.title.trim() || !editingProjectData.description.trim()) {
      toast.error('Title and Description are required');
      return;
    }
    
    try {
      const project = {
        title: editingProjectData.title,
        description: editingProjectData.description,
        icon: editingProjectData.icon,
        tags: typeof editingProjectData.tags === 'string' 
          ? editingProjectData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
          : editingProjectData.tags,
        gradient: editingProjectData.gradient,
        githubUrl: editingProjectData.githubUrl || '',
        projectUrl: editingProjectData.projectUrl || '',
        category: editingProjectData.category || 'All',
        thumbnailUrl: editingProjectData.thumbnailUrl || ''
      };

      await projectsAPI.update(editingProjectId, project);
      await fetchProjects();
      setEditingProjectId(null);
      setEditingProjectData(null);
      toast.success('Project updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update project');
    }
  };

  // Filter projects by category
  const filteredProjects = selectedCategory === 'All' 
    ? projects 
    : projects.filter(project => 
        project.category === selectedCategory || project.category === 'All'
      );

  return (
    <section className="py-20 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
            Featured Projects
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto text-base">
            A showcase of innovative AI, ML, and web development projects that demonstrate
            my expertise in building scalable, real-world solutions.
          </p>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all transform hover:scale-105 ${
                selectedCategory === category
                  ? 'text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 border border-slate-700'
              }`}
              style={
                selectedCategory === category
                  ? { background: 'var(--theme-gradient)' }
                  : {}
              }
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {category}
              </span>
            </button>
          ))}
          {adminMode && (
            <button
              onClick={() => setShowCategoryManager(!showCategoryManager)}
              className="px-6 py-2.5 rounded-lg font-medium transition-all transform hover:scale-105 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Manage Categories
              </span>
            </button>
          )}
        </div>

        {/* Category Manager (Admin Only) */}
        {adminMode && showCategoryManager && (
          <div className="bg-slate-800/50 rounded-2xl p-8 mb-8 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5" style={{ color: 'var(--theme-text-accent)' }} />
                <h3 className="text-2xl font-bold text-white">Manage Categories</h3>
              </div>
            </div>
            
            {/* Add Category Section */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-white mb-4">Add New Category</h4>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                  className="flex-1 bg-slate-700/50 rounded-lg px-4 py-3 text-white focus:outline-none input-theme border border-slate-600"
                  placeholder="Enter new category name"
                />
                <button
                  onClick={addCategory}
                  className="text-white px-8 py-3 rounded-lg transition-all flex items-center gap-2 font-medium"
                  style={{ background: 'var(--theme-gradient)' }}
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>
            </div>

            {/* Existing Categories Grid */}
            <div className="border-t border-slate-700 pt-6">
              <h4 className="text-lg font-semibold text-white mb-4">Existing Categories</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.filter(cat => cat !== 'All').map((category) => (
                  <div
                    key={category}
                    className="flex items-center justify-between bg-slate-700/30 hover:bg-slate-700/50 px-4 py-3 rounded-lg border border-slate-600/50 transition-all group"
                  >
                    <span className="text-white font-medium">{category}</span>
                    <button
                      onClick={() => deleteCategory(category)}
                      className="text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {categories.filter(cat => cat !== 'All').length === 0 && (
                <p className="text-gray-400 text-center py-8">No categories yet. Add your first category above!</p>
              )}
            </div>
          </div>
        )}

        {/* Add Project Form (Admin Only) */}
        {adminMode && (
          <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Edit2 className="w-5 h-5" style={{ color: 'var(--theme-text-accent)' }} />
              <h3 className="text-xl text-white">Add New Project</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="bg-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none input-theme"
                placeholder="Project title"
              />
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="bg-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none resize-none input-theme"
                placeholder="Project description"
                rows={3}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={newProject.category}
                  onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                  className="bg-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none input-theme"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="url"
                  value={newProject.thumbnailUrl}
                  onChange={(e) => setNewProject({ ...newProject, thumbnailUrl: e.target.value })}
                  className="bg-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none input-theme"
                  placeholder="Thumbnail Image URL (optional)"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="url"
                  value={newProject.githubUrl}
                  onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                  className="bg-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none input-theme"
                  placeholder="GitHub URL (optional)"
                />
                <input
                  type="url"
                  value={newProject.projectUrl}
                  onChange={(e) => setNewProject({ ...newProject, projectUrl: e.target.value })}
                  className="bg-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none input-theme"
                  placeholder="Project URL (optional)"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={newProject.icon}
                  onChange={(e) => setNewProject({ ...newProject, icon: e.target.value })}
                  className="bg-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none input-theme"
                >
                  <option value="Brain">Brain</option>
                  <option value="MessageSquare">Message Square</option>
                  <option value="Image">Image</option>
                  <option value="BarChart3">Bar Chart</option>
                  <option value="Eye">Eye</option>
                  <option value="Cpu">CPU</option>
                </select>
                <select
                  value={newProject.gradient}
                  onChange={(e) => setNewProject({ ...newProject, gradient: e.target.value })}
                  className="bg-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none input-theme"
                >
                  {gradientOptions.map(gradient => (
                    <option key={gradient} value={gradient}>{gradient}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newProject.tags}
                  onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                  className="bg-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none input-theme"
                  placeholder="Tags (comma separated)"
                />
              </div>
              <button
                onClick={addProject}
                className="text-white px-6 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                style={{ background: 'var(--theme-gradient)' }}
              >
                <Plus className="w-5 h-5" />
                Add Project
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading projects...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-12">Error: {error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-12">
                {selectedCategory === 'All' 
                  ? `No projects added yet. ${adminMode ? 'Use the form above to add your first project.' : ''}`
                  : `No projects in "${selectedCategory}" category.`
                }
              </div>
            ) : (
              filteredProjects.map((project) => {
                const Icon = iconMap[project.icon] || Brain;
                const isEditing = editingProjectId === project.id;
                
                return (
                  <div
                    key={project.id}
                    className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden transition-all transform hover:scale-[1.02] hover:shadow-2xl hover:border-cyan-500/50 relative group"
                  >
                    {!isEditing ? (
                      <>
                        {/* Admin Controls */}
                        {adminMode && (
                          <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => startEditingProject(project)}
                              className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors backdrop-blur-sm"
                              title="Edit project"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeProject(project.id)}
                              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors backdrop-blur-sm"
                              title="Delete project"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        
                        {/* Thumbnail Image or Icon */}
                        {project.thumbnailUrl ? (
                          <div className="w-full h-48 overflow-hidden bg-slate-900/50">
                            <ImageWithFallback
                              src={project.thumbnailUrl}
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className={`w-full h-48 bg-gradient-to-br ${project.gradient} flex items-center justify-center`}>
                            <Icon className="w-20 h-20 text-white opacity-80" />
                          </div>
                        )}

                        {/* Project Content */}
                        <div className="p-6">
                          {/* Category Badge */}
                          {project.category && project.category !== 'All' && (
                            <span 
                              className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3"
                              style={{
                                backgroundColor: 'var(--theme-bg-subtle)',
                                color: 'var(--theme-text-accent)'
                              }}
                            >
                              {project.category}
                            </span>
                          )}
                          
                          <h3 className="text-xl font-bold text-white mb-2">
                            {project.title}
                          </h3>
                          
                          <p className="text-gray-400 mb-4 text-sm leading-relaxed line-clamp-3">
                            {project.description}
                          </p>
                          
                          {/* Technologies/Tags */}
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2 font-semibold">Technologies:</p>
                            <div className="flex flex-wrap gap-2">
                              {project.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2.5 py-1 text-xs rounded bg-slate-700/50 text-gray-300 border border-slate-600"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Project Links */}
                          <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white text-sm rounded-lg transition-colors font-medium"
                              >
                                <Github className="w-4 h-4" />
                                GitHub
                              </a>
                            )}
                            {project.projectUrl && (
                              <a
                                href={project.projectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-lg transition-all font-medium text-white"
                                style={{
                                  background: 'var(--theme-gradient)'
                                }}
                              >
                                <ExternalLink className="w-4 h-4" />
                                Live Demo
                              </a>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Edit Mode */
                      <div className="space-y-3 p-6">
                        <h4 className="text-lg font-bold text-purple-400 mb-3">Edit Project</h4>
                        
                        <input
                          type="text"
                          placeholder="Project Title"
                          value={editingProjectData.title}
                          onChange={(e) => setEditingProjectData({ ...editingProjectData, title: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                        />
                        
                        <textarea
                          placeholder="Description"
                          value={editingProjectData.description}
                          onChange={(e) => setEditingProjectData({ ...editingProjectData, description: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                          rows="3"
                        />
                        
                        <select
                          value={editingProjectData.category || 'All'}
                          onChange={(e) => setEditingProjectData({ ...editingProjectData, category: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        
                        <input
                          type="url"
                          placeholder="Thumbnail Image URL"
                          value={editingProjectData.thumbnailUrl || ''}
                          onChange={(e) => setEditingProjectData({ ...editingProjectData, thumbnailUrl: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                        />
                        
                        <input
                          type="url"
                          placeholder="GitHub URL"
                          value={editingProjectData.githubUrl || ''}
                          onChange={(e) => setEditingProjectData({ ...editingProjectData, githubUrl: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                        />
                        
                        <input
                          type="url"
                          placeholder="Project URL"
                          value={editingProjectData.projectUrl || ''}
                          onChange={(e) => setEditingProjectData({ ...editingProjectData, projectUrl: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                        />
                        
                        <select
                          value={editingProjectData.icon}
                          onChange={(e) => setEditingProjectData({ ...editingProjectData, icon: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                        >
                          <option value="Brain">Brain</option>
                          <option value="MessageSquare">Message Square</option>
                          <option value="Image">Image</option>
                          <option value="BarChart3">Bar Chart</option>
                          <option value="Eye">Eye</option>
                          <option value="Cpu">CPU</option>
                        </select>
                        
                        <select
                          value={editingProjectData.gradient}
                          onChange={(e) => setEditingProjectData({ ...editingProjectData, gradient: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                        >
                          {gradientOptions.map(gradient => (
                            <option key={gradient} value={gradient}>{gradient}</option>
                          ))}
                        </select>
                        
                        <input
                          type="text"
                          placeholder="Tags (comma-separated)"
                          value={editingProjectData.tags || ''}
                          onChange={(e) => setEditingProjectData({ ...editingProjectData, tags: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                        />
                        
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={saveProjectEdit}
                            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={cancelEditingProject}
                            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Collaboration Call-to-Action */}
        <div className="mt-20 mb-20 text-center">
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-12 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Interested in Collaboration?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              I'm always excited to work on innovative projects that push the boundaries of AI and technology. Let's build something amazing together!
            </p>
            <button
              onClick={() => setActivePage && setActivePage('contact')}
              className="px-8 py-4 text-lg font-semibold text-white rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}
            >
              Get In Touch
            </button>
          </div>
        </div>

        {/* Project Stats */}
        <StatsSection section="projects" />
      </div>
    </section>
  );
}