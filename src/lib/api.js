import { supabase } from './supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';

// Admin password (hardcoded for simplicity)
const ADMIN_PASSWORD = 'admin123';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Set auth token in localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Remove auth token
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

// Check if user is authenticated
const isAuthenticated = () => {
  return !!getAuthToken();
};

// Auth API
export const authAPI = {
  login: async (password) => {
    if (password === ADMIN_PASSWORD) {
      const token = 'admin-auth-token-' + Date.now();
      setAuthToken(token);
      return { token, message: 'Login successful' };
    } else {
      throw new Error('Incorrect password');
    }
  },

  verify: async () => {
    return isAuthenticated();
  },

  logout: () => {
    removeAuthToken();
  },
};

// Projects API
export const projectsAPI = {
  getAll: async () => {
    // Query projects first
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectsError) throw projectsError;
    
    // Try to get all categories (will fail gracefully if table doesn't exist)
    let categoriesMap = {};
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('project_categories')
        .select('id, name');
      
      if (!categoriesError && categoriesData) {
        // Create a map of category_id -> name
        categoriesMap = categoriesData.reduce((acc, cat) => {
          acc[cat.id] = cat.name;
          return acc;
        }, {});
      }
    } catch (err) {
      // Categories table doesn't exist yet, that's okay
      console.log('Categories table not set up yet');
    }
    
    // Transform data to match frontend format
    return projectsData.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      icon: project.icon,
      tags: project.tags,
      gradient: project.gradient,
      githubUrl: project.github_url,
      projectUrl: project.project_url,
      category: project.category_id ? (categoriesMap[project.category_id] || 'All') : 'All',
      thumbnailUrl: project.thumbnail_url
    }));
  },

  add: async (project) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    // Get category ID if category is specified and not 'All'
    let categoryId = null;
    if (project.category && project.category !== 'All') {
      const { data: categoryData } = await supabase
        .from('project_categories')
        .select('id')
        .eq('name', project.category)
        .single();
      
      categoryId = categoryData?.id || null;
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        title: project.title,
        description: project.description,
        icon: project.icon,
        tags: typeof project.tags === 'string' 
          ? project.tags.split(',').map(t => t.trim()) 
          : project.tags,
        gradient: project.gradient,
        github_url: project.githubUrl || '',
        project_url: project.projectUrl || '',
        category_id: categoryId,
        thumbnail_url: project.thumbnailUrl || ''
      }])
      .select()
      .single();

    if (error) throw error;
    
    // Fetch the category name for the response
    let categoryName = 'All';
    if (data.category_id) {
      const { data: catData } = await supabase
        .from('project_categories')
        .select('name')
        .eq('id', data.category_id)
        .single();
      categoryName = catData?.name || 'All';
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      icon: data.icon,
      tags: data.tags,
      gradient: data.gradient,
      githubUrl: data.github_url,
      projectUrl: data.project_url,
      category: categoryName,
      thumbnailUrl: data.thumbnail_url
    };
  },

  update: async (id, project) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    // Get category ID if category is specified and not 'All'
    let categoryId = null;
    if (project.category && project.category !== 'All') {
      const { data: categoryData } = await supabase
        .from('project_categories')
        .select('id')
        .eq('name', project.category)
        .single();
      
      categoryId = categoryData?.id || null;
    }

    const { data, error } = await supabase
      .from('projects')
      .update({
        title: project.title,
        description: project.description,
        icon: project.icon,
        tags: typeof project.tags === 'string' 
          ? project.tags.split(',').map(t => t.trim()) 
          : project.tags,
        gradient: project.gradient,
        github_url: project.githubUrl || '',
        project_url: project.projectUrl || '',
        category_id: categoryId,
        thumbnail_url: project.thumbnailUrl || ''
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Fetch the category name for the response
    let categoryName = 'All';
    if (data.category_id) {
      const { data: catData } = await supabase
        .from('project_categories')
        .select('name')
        .eq('id', data.category_id)
        .single();
      categoryName = catData?.name || 'All';
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      icon: data.icon,
      tags: data.tags,
      gradient: data.gradient,
      githubUrl: data.github_url,
      projectUrl: data.project_url,
      category: categoryName,
      thumbnailUrl: data.thumbnail_url
    };
  },

  delete: async (id) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Project deleted' };
  },

  getCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('project_categories')
        .select('name')
        .order('name', { ascending: true });

      if (error) throw error;
      return data.map(cat => cat.name);
    } catch (err) {
      console.error('Error fetching categories:', err);
      return [];
    }
  },

  addCategory: async (category) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    try {
      const { data, error } = await supabase
        .from('project_categories')
        .insert([{ name: category }])
        .select()
        .single();

      if (error) throw error;
      return { category: data.name, message: 'Category added' };
    } catch (err) {
      // Handle unique constraint violation
      if (err.code === '23505') {
        throw new Error('Category already exists');
      }
      throw new Error('Failed to add category');
    }
  },

  deleteCategory: async (category) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    try {
      // Delete the category (projects will have category_id set to NULL due to ON DELETE SET NULL)
      const { error } = await supabase
        .from('project_categories')
        .delete()
        .eq('name', category);

      if (error) throw error;
      return { message: 'Category deleted' };
    } catch (err) {
      throw new Error('Failed to delete category');
    }
  },
};

// Skills API
export const skillsAPI = {
  getAll: async () => {
    // Query skills first
    const { data: skillsData, error: skillsError } = await supabase
      .from('skills')
      .select('*')
      .order('created_at', { ascending: false });

    if (skillsError) throw skillsError;
    
    // Try to get all categories (will fail gracefully if table doesn't exist)
    let categoriesMap = {};
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('skill_categories')
        .select('id, name');
      
      if (!categoriesError && categoriesData) {
        // Create a map of category_id -> name
        categoriesMap = categoriesData.reduce((acc, cat) => {
          acc[cat.id] = cat.name;
          return acc;
        }, {});
      }
    } catch (err) {
      // Categories table doesn't exist yet, that's okay
      console.log('Skill categories table not set up yet');
    }
    
    // Transform data to match frontend format
    // Filter out skills without a valid category_id
    return skillsData
      .filter(skill => skill.category_id && categoriesMap[skill.category_id])
      .map(skill => ({
        id: skill.id,
        name: skill.name,
        category: categoriesMap[skill.category_id],
        level: skill.level
      }));
  },

  add: async (skill) => {
    // Get category ID if category is specified
    let categoryId = null;
    if (skill.category && skill.category.trim()) {
      const { data: categoryData } = await supabase
        .from('skill_categories')
        .select('id')
        .eq('name', skill.category)
        .single();
      
      categoryId = categoryData?.id || null;
    }

    const { data, error } = await supabase
      .from('skills')
      .insert([{
        name: skill.name,
        category_id: categoryId,
        level: skill.level || null
      }])
      .select()
      .single();

    if (error) throw error;
    
    // Fetch the category name for the response
    let categoryName = 'Uncategorized';
    if (data.category_id) {
      const { data: catData } = await supabase
        .from('skill_categories')
        .select('name')
        .eq('id', data.category_id)
        .single();
      categoryName = catData?.name || 'Uncategorized';
    }

    return {
      id: data.id,
      name: data.name,
      category: categoryName,
      level: data.level
    };
  },

  remove: async (id) => {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Skill deleted' };
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Skill deleted' };
  },

  getCategories: async () => {
    const { data, error } = await supabase
      .from('skill_categories')
      .select('name')
      .order('name', { ascending: true });

    if (error) throw error;
    return data.map(cat => cat.name);
  },

  addCategory: async (category) => {
    const { data, error } = await supabase
      .from('skill_categories')
      .insert([{ name: category }])
      .select()
      .single();

    if (error) throw error;
    return { category: data.name, message: 'Category added' };
  },

  deleteCategory: async (category) => {
    try {
      // First, get the category ID
      const { data: categoryData, error: fetchError } = await supabase
        .from('skill_categories')
        .select('id')
        .eq('name', category)
        .single();

      if (fetchError) throw fetchError;
      
      const categoryId = categoryData?.id;
      
      if (categoryId) {
        // Delete all skills in this category first
        const { error: skillsError } = await supabase
          .from('skills')
          .delete()
          .eq('category_id', categoryId);

        if (skillsError) throw skillsError;
      }

      // Then delete the category
      const { error: categoryError } = await supabase
        .from('skill_categories')
        .delete()
        .eq('name', category);

      if (categoryError) throw categoryError;
      
      return { message: 'Category deleted' };
    } catch (err) {
      throw new Error('Failed to delete category');
    }
  },
};

// Contact API
export const contactAPI = {
  submit: async (formData) => {
    try {
      // Option 1: Call Edge Function (if deployed) - Saves to DB + Sends Email
      const functionUrl = `${SUPABASE_URL}/functions/v1/send-email`; // Updated to match deployed function name
      
      console.log('🚀 Calling Edge Function:', functionUrl);
      console.log('📋 Request details:', {
        url: functionUrl,
        hasAnonKey: !!SUPABASE_ANON_KEY,
        anonKeyPrefix: SUPABASE_ANON_KEY?.substring(0, 10) + '...',
      });
      
      try {
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_ANON_KEY
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            message: `Subject: ${formData.subject}\n\n${formData.message}`
          })
        });

        console.log('📡 Edge Function response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Edge Function success:', data);
          return { success: true, message: 'Message sent successfully!', data };
        } else {
          // Log the error response for debugging
          const errorData = await response.text();
          console.error('❌ Edge Function error response:', {
            status: response.status,
            statusText: response.statusText,
            body: errorData
          });
          throw new Error(`Edge Function failed: ${response.status} - ${errorData}`);
        }
      } catch (edgeFunctionError) {
        console.error('❌ Edge function error:', edgeFunctionError);
        console.error('Error name:', edgeFunctionError.name);
        console.error('Error message:', edgeFunctionError.message);
        
        // Check if it's a network error
        if (edgeFunctionError.message === 'Failed to fetch') {
          console.error('🔴 Network Error - Possible causes:');
          console.error('  1. Edge Function not deployed');
          console.error('  2. CORS configuration issue');
          console.error('  3. Invalid anon key');
          console.error('  4. Network/firewall blocking request');
          console.error('');
          console.error('💡 Try running: supabase functions deploy send-contact-email');
        }
        
        console.log('⚠️ Falling back to direct database insert (no email will be sent)');
      }

      // Option 2: Fallback - Direct database insert (no email)
      const { data, error } = await supabase
        .from('contact')
        .insert([{
          name: formData.name,
          email: formData.email,
          message: `Subject: ${formData.subject}\n\n${formData.message}`,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error("Contact submission error:", error);
        throw error;
      }

      return { success: true, message: 'Message sent successfully!', data };
    } catch (error) {
      console.error("Contact API error:", error);
      throw error;
    }
  },

  getAll: async () => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('contact')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('contact')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Message deleted' };
  },
};

// About API
export const aboutAPI = {
  get: async () => {
    const { data, error } = await supabase
      .from('about')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  update: async (aboutData) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('about')
      .update({
        title: aboutData.title,
        content: aboutData.content,
        resume_url: aboutData.resume_url
      })
      .eq('id', aboutData.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Achievements API (used for Certifications)
export const achievementsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform snake_case to camelCase
    return data.map(item => ({
      id: item.id,
      title: item.title,
      issuer: item.issuer,
      date: item.date,
      description: item.description,
      skills: item.skills,
      credentialId: item.credential_id,
      credentialUrl: item.credential_url,
      certificateLink: item.certificate_link
    }));
  },

  add: async (achievement) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('achievements')
      .insert([{
        title: achievement.title,
        issuer: achievement.issuer || '',
        date: achievement.date || '',
        description: achievement.description || '',
        skills: achievement.skills || '',
        credential_id: achievement.credentialId || '',
        credential_url: achievement.credentialUrl || '',
        certificate_link: achievement.certificateLink || ''
      }])
      .select()
      .single();

    if (error) throw error;
    
    // Transform back to match frontend format
    return {
      id: data.id,
      title: data.title,
      issuer: data.issuer,
      date: data.date,
      description: data.description,
      skills: data.skills,
      credentialId: data.credential_id,
      credentialUrl: data.credential_url,
      certificateLink: data.certificate_link
    };
  },

  update: async (id, achievement) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('achievements')
      .update({
        title: achievement.title,
        issuer: achievement.issuer || '',
        date: achievement.date || '',
        description: achievement.description || '',
        skills: achievement.skills || '',
        credential_id: achievement.credentialId || '',
        credential_url: achievement.credentialUrl || '',
        certificate_link: achievement.certificateLink || ''
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Transform back to match frontend format
    return {
      id: data.id,
      title: data.title,
      issuer: data.issuer,
      date: data.date,
      description: data.description,
      skills: data.skills,
      credentialId: data.credential_id,
      credentialUrl: data.credential_url,
      certificateLink: data.certificate_link
    };
  },

  remove: async (id) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Certification deleted' };
  },

  delete: async (id) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Achievement deleted' };
  },
};

// Theme API
export const themeAPI = {
  get: async () => {
    const { data, error } = await supabase
      .from('theme_settings')
      .select('*')
      .single();

    if (error) {
      // Return default theme if no settings found
      if (error.code === 'PGRST116') {
        return {
          primary_color_start: '#a855f7',
          primary_color_end: '#ec4899',
          theme_name: 'purple-pink'
        };
      }
      throw error;
    }
    return data;
  },

  update: async (themeData) => {
    const { data, error } = await supabase
      .from('theme_settings')
      .upsert({
        id: 1,
        primary_color_start: themeData.primary_color_start,
        primary_color_end: themeData.primary_color_end,
        theme_name: themeData.theme_name
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Resume API
export const resumeAPI = {
  upload: async (file) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `resume-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath
    };
  },

  delete: async (filePath) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase.storage
      .from('resumes')
      .remove([filePath]);

    if (error) throw error;
    return { message: 'Resume deleted' };
  },
};

// Education API
export const educationAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .order('start_year', { ascending: false });

    if (error) throw error;
    
    // Transform data to match frontend format
    return data.map(edu => ({
      id: edu.id,
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startYear: edu.start_year,
      endYear: edu.end_year,
      location: edu.location,
      grade: edu.grade,
      description: edu.description
    }));
  },

  add: async (education) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('education')
      .insert([{
        institution: education.institution,
        degree: education.degree,
        field: education.field || '',
        start_year: education.startYear,
        end_year: education.endYear,
        location: education.location || '',
        grade: education.grade || '',
        description: education.description || ''
      }])
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      institution: data.institution,
      degree: data.degree,
      field: data.field,
      startYear: data.start_year,
      endYear: data.end_year,
      location: data.location,
      grade: data.grade,
      description: data.description
    };
  },

  update: async (id, education) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('education')
      .update({
        institution: education.institution,
        degree: education.degree,
        field: education.field || '',
        start_year: education.startYear,
        end_year: education.endYear,
        location: education.location || '',
        grade: education.grade || '',
        description: education.description || ''
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      institution: data.institution,
      degree: data.degree,
      field: data.field,
      startYear: data.start_year,
      endYear: data.end_year,
      location: data.location,
      grade: data.grade,
      description: data.description
    };
  },

  remove: async (id) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('education')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Education deleted' };
  },
};

// Experience API
export const experienceAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('experience')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;
    
    // Transform data to match frontend format
    return data.map(exp => ({
      id: exp.id,
      title: exp.title,
      company: exp.company,
      location: exp.location,
      startDate: exp.start_date,
      endDate: exp.end_date,
      description: exp.description,
      technologies: exp.technologies
    }));
  },

  add: async (experience) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('experience')
      .insert([{
        title: experience.title,
        company: experience.company,
        location: experience.location || '',
        start_date: experience.startDate,
        end_date: experience.endDate || null,
        description: experience.description || '',
        technologies: Array.isArray(experience.technologies) 
          ? experience.technologies 
          : experience.technologies?.split(',').map(t => t.trim()) || []
      }])
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      company: data.company,
      location: data.location,
      startDate: data.start_date,
      endDate: data.end_date,
      description: data.description,
      technologies: data.technologies
    };
  },

  remove: async (id) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('experience')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Experience deleted' };
  },
};

// Stats API
export const statsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('stats')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  add: async (stat) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('stats')
      .insert([{
        section: stat.section,
        label: stat.label,
        value: stat.value,
        icon: stat.icon,
        gradient: stat.gradient,
        display_order: stat.display_order || 0
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id, stat) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
      .from('stats')
      .update({
        section: stat.section,
        label: stat.label,
        value: stat.value,
        icon: stat.icon,
        gradient: stat.gradient,
        display_order: stat.display_order
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    if (!isAuthenticated()) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('stats')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Stat deleted' };
  },
};