import { useState, useEffect } from 'react';
import { Plus, X, GraduationCap, Award, ExternalLink, Calendar, MapPin, Edit2, Save } from 'lucide-react';
import { useAdmin } from '@/app/contexts/admin-context';
import { educationAPI, achievementsAPI } from '@/lib/api';
import { toast } from 'sonner';
import StatsSection from '@/app/components/stats-section';

export default function Education() {
  const { adminMode } = useAdmin();
  const [education, setEducation] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCertId, setEditingCertId] = useState(null);
  const [editingCertData, setEditingCertData] = useState(null);
  const [editingEduId, setEditingEduId] = useState(null);
  const [editingEduData, setEditingEduData] = useState(null);
  const [newEducation, setNewEducation] = useState({
    institution: '',
    degree: '',
    field: '',
    startYear: '',
    endYear: '',
    location: '',
    grade: '',
    description: ''
  });
  const [newCertification, setNewCertification] = useState({
    title: '',
    issuer: '',
    date: '',
    description: '',
    skills: '',
    credentialId: '',
    credentialUrl: '',
    certificateLink: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eduData, certData] = await Promise.all([
        educationAPI.getAll(),
        achievementsAPI.getAll()
      ]);
      setEducation(eduData);
      setCertifications(certData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addEducation = async () => {
    if (!newEducation.institution || !newEducation.degree) return;
    try {
      await educationAPI.add(newEducation);
      fetchData();
      setNewEducation({
        institution: '',
        degree: '',
        field: '',
        startYear: '',
        endYear: '',
        location: '',
        grade: '',
        description: ''
      });
      toast.success('Education added successfully!');
    } catch (error) {
      console.error('Error adding education:', error);
      toast.error('Failed to add education');
    }
  };

  const removeEducation = async (id) => {
    try {
      await educationAPI.remove(id);
      fetchData();
      toast.success('Education removed successfully!');
    } catch (error) {
      console.error('Error removing education:', error);
      toast.error('Failed to remove education');
    }
  };

  const addCertification = async () => {
    if (!newCertification.title || !newCertification.issuer) return;
    try {
      await achievementsAPI.add(newCertification);
      fetchData();
      setNewCertification({
        title: '',
        issuer: '',
        date: '',
        description: '',
        skills: '',
        credentialId: '',
        credentialUrl: '',
        certificateLink: ''
      });
      toast.success('Certification added successfully!');
    } catch (error) {
      console.error('Error adding certification:', error);
      toast.error('Failed to add certification');
    }
  };

  const removeCertification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certification?')) return;
    try {
      await achievementsAPI.remove(id);
      fetchData();
      toast.success('Certification removed successfully!');
    } catch (error) {
      console.error('Error removing certification:', error);
      toast.error('Failed to remove certification');
    }
  };

  const startEditingCertification = (cert) => {
    setEditingCertId(cert.id);
    setEditingCertData({ ...cert });
  };

  const cancelEditingCertification = () => {
    setEditingCertId(null);
    setEditingCertData(null);
  };

  const saveCertificationEdit = async () => {
    if (!editingCertData.title || !editingCertData.issuer) {
      toast.error('Title and Issuer are required');
      return;
    }
    
    try {
      await achievementsAPI.update(editingCertId, editingCertData);
      await fetchData();
      setEditingCertId(null);
      setEditingCertData(null);
      toast.success('Certification updated successfully!');
    } catch (error) {
      console.error('Error updating certification:', error);
      toast.error('Failed to update certification');
    }
  };

  const getCertificationStatus = (cert) => {
    // You can add logic here to determine if cert is featured/verified
    if (cert.title?.toLowerCase().includes('mckinsey')) {
      return { label: 'Featured', color: 'bg-orange-500' };
    }
    if (cert.title?.toLowerCase().includes('british airways')) {
      return { label: 'Featured', color: 'bg-orange-500' };
    }
    return { label: 'Verified', color: 'bg-green-500' };
  };

  const startEditingEducation = (edu) => {
    setEditingEduId(edu.id);
    setEditingEduData({ ...edu });
  };

  const cancelEditingEducation = () => {
    setEditingEduId(null);
    setEditingEduData(null);
  };

  const saveEducationEdit = async () => {
    if (!editingEduData.institution || !editingEduData.degree) {
      toast.error('Institution and Degree are required');
      return;
    }
    
    try {
      await educationAPI.update(editingEduId, editingEduData);
      await fetchData();
      setEditingEduId(null);
      setEditingEduData(null);
      toast.success('Education updated successfully!');
    } catch (error) {
      console.error('Error updating education:', error);
      toast.error('Failed to update education');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading education...</div>
      </div>
    );
  }

  return (
    <section className="min-h-screen py-20 sm:py-24 px-3 sm:px-4 pt-24 sm:pt-28">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Education & Certifications
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg">
            My academic journey and professional certifications that have shaped my expertise in technology, problem-solving, and continuous learning.
          </p>
        </div>

        {/* Academic Background Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <GraduationCap className="w-8 h-8 text-cyan-400" />
            <h3 className="text-3xl font-bold text-white">Academic Background</h3>
          </div>

          {/* Admin: Add Education */}
          {adminMode && (
            <div className="bg-slate-800/50 border-2 border-cyan-500/30 rounded-2xl p-6 mb-8">
              <h4 className="text-xl font-bold text-cyan-400 mb-4">Add Education</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Institution"
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                  className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Degree"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                  className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Field of Study"
                  value={newEducation.field}
                  onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
                  className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={newEducation.location}
                  onChange={(e) => setNewEducation({ ...newEducation, location: e.target.value })}
                  className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Start Year"
                  value={newEducation.startYear}
                  onChange={(e) => setNewEducation({ ...newEducation, startYear: e.target.value })}
                  className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="End Year"
                  value={newEducation.endYear}
                  onChange={(e) => setNewEducation({ ...newEducation, endYear: e.target.value })}
                  className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Grade/CGPA"
                  value={newEducation.grade}
                  onChange={(e) => setNewEducation({ ...newEducation, grade: e.target.value })}
                  className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <textarea
                placeholder="Description (bullet points separated by newlines)"
                value={newEducation.description}
                onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white mb-3"
                rows="3"
              />
              <button
                onClick={addEducation}
                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-white font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Education
              </button>
            </div>
          )}

          {/* Education Cards */}
          <div className="space-y-6 mb-16">
            {education.map((edu) => {
              const isEditing = editingEduId === edu.id;
              
              return (
                <div
                  key={edu.id}
                  className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-2 border-slate-700/50 hover:border-cyan-500/50 rounded-2xl p-6 transition-all group relative"
                >
                  {!isEditing ? (
                    <>
                      {/* School Icon */}
                      <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-7 h-7 text-white" />
                      </div>
                      
                      <div>
                        <h4 className="text-xl font-bold text-white mb-1">{edu.institution}</h4>
                        <p className="text-cyan-400 font-semibold mb-2">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-3">
                          {(edu.startYear || edu.endYear) && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{edu.startYear} - {edu.endYear || 'Present'}</span>
                            </div>
                          )}
                          {edu.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{edu.location}</span>
                            </div>
                          )}
                        </div>
                        {edu.grade && (
                          <div className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm font-semibold mb-3">
                            CGPA: {edu.grade}
                          </div>
                        )}
                      </div>
                      
                      {adminMode && (
                        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 flex gap-2 transition-all">
                          <button
                            onClick={() => startEditingEducation(edu)}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-400 hover:text-blue-300 transition-all"
                            title="Edit education"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeEducation(edu.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 hover:text-red-300 transition-all"
                            title="Delete education"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Edit Mode */
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-cyan-400 mb-4">Edit Education</h4>
                      
                      <input
                        type="text"
                        placeholder="Institution"
                        value={editingEduData.institution}
                        onChange={(e) => setEditingEduData({ ...editingEduData, institution: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                      />
                      
                      <input
                        type="text"
                        placeholder="Degree"
                        value={editingEduData.degree}
                        onChange={(e) => setEditingEduData({ ...editingEduData, degree: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                      />
                      
                      <input
                        type="text"
                        placeholder="Field of Study"
                        value={editingEduData.field}
                        onChange={(e) => setEditingEduData({ ...editingEduData, field: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                      />
                      
                      <input
                        type="text"
                        placeholder="Location"
                        value={editingEduData.location}
                        onChange={(e) => setEditingEduData({ ...editingEduData, location: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                      />
                      
                      <input
                        type="text"
                        placeholder="Start Year"
                        value={editingEduData.startYear}
                        onChange={(e) => setEditingEduData({ ...editingEduData, startYear: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                      />
                      
                      <input
                        type="text"
                        placeholder="End Year"
                        value={editingEduData.endYear}
                        onChange={(e) => setEditingEduData({ ...editingEduData, endYear: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                      />
                      
                      <input
                        type="text"
                        placeholder="Grade/CGPA"
                        value={editingEduData.grade}
                        onChange={(e) => setEditingEduData({ ...editingEduData, grade: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                      />
                      
                      <textarea
                        placeholder="Description (bullet points separated by newlines)"
                        value={editingEduData.description}
                        onChange={(e) => setEditingEduData({ ...editingEduData, description: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                        rows="3"
                      />
                      
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={saveEducationEdit}
                          className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={cancelEditingEducation}
                          className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Professional Certifications Section */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <Award className="w-8 h-8 text-purple-400" />
            <h3 className="text-3xl font-bold text-white">Professional Certifications</h3>
          </div>

          {/* Admin: Add Certification */}
          {adminMode && (
            <div className="bg-slate-800/50 border-2 border-purple-500/30 rounded-2xl p-6 mb-8">
              <h4 className="text-xl font-bold text-purple-400 mb-4">Add Certification</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Certification Title"
                  value={newCertification.title}
                  onChange={(e) => setNewCertification({ ...newCertification, title: e.target.value })}
                  className="px-4 py-3 bg-slate-900/80 border-2 border-slate-600 rounded-lg text-white placeholder:text-gray-400 focus:border-purple-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Issuer/Organization"
                  value={newCertification.issuer}
                  onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                  className="px-4 py-3 bg-slate-900/80 border-2 border-slate-600 rounded-lg text-white placeholder:text-gray-400 focus:border-purple-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Issue Date"
                  value={newCertification.date}
                  onChange={(e) => setNewCertification({ ...newCertification, date: e.target.value })}
                  className="px-4 py-3 bg-slate-900/80 border-2 border-slate-600 rounded-lg text-white placeholder:text-gray-400 focus:border-purple-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Credential ID"
                  value={newCertification.credentialId}
                  onChange={(e) => setNewCertification({ ...newCertification, credentialId: e.target.value })}
                  className="px-4 py-3 bg-slate-900/80 border-2 border-slate-600 rounded-lg text-white placeholder:text-gray-400 focus:border-purple-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Credential URL"
                  value={newCertification.credentialUrl}
                  onChange={(e) => setNewCertification({ ...newCertification, credentialUrl: e.target.value })}
                  className="px-4 py-3 bg-slate-900/80 border-2 border-slate-600 rounded-lg text-white placeholder:text-gray-400 focus:border-purple-500 focus:outline-none col-span-1 md:col-span-2"
                />
                <input
                  type="text"
                  placeholder="Certificate Link (URL to view certificate)"
                  value={newCertification.certificateLink}
                  onChange={(e) => setNewCertification({ ...newCertification, certificateLink: e.target.value })}
                  className="px-4 py-3 bg-slate-900/80 border-2 border-slate-600 rounded-lg text-white placeholder:text-gray-400 focus:border-purple-500 focus:outline-none col-span-1 md:col-span-2"
                />
                <input
                  type="text"
                  placeholder="Skills Gained (comma-separated)"
                  value={newCertification.skills}
                  onChange={(e) => setNewCertification({ ...newCertification, skills: e.target.value })}
                  className="px-4 py-3 bg-slate-900/80 border-2 border-slate-600 rounded-lg text-white placeholder:text-gray-400 focus:border-purple-500 focus:outline-none col-span-1 md:col-span-2"
                />
              </div>
              <textarea
                placeholder="Description"
                value={newCertification.description}
                onChange={(e) => setNewCertification({ ...newCertification, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/80 border-2 border-slate-600 rounded-lg text-white placeholder:text-gray-400 focus:border-purple-500 focus:outline-none mb-3"
                rows="3"
              />
              <button
                onClick={addCertification}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Certification
              </button>
            </div>
          )}

          {/* Certifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {certifications.map((cert) => {
              const status = getCertificationStatus(cert);
              const isEditing = editingCertId === cert.id;
              
              return (
                <div
                  key={cert.id}
                  className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-2 border-slate-700/50 hover:border-purple-500/50 rounded-2xl p-6 transition-all group relative"
                >
                  {!isEditing ? (
                    <>
                      {/* Status Badge */}
                      <div className={`absolute top-4 right-4 px-3 py-1 ${status.color} rounded-full text-xs font-bold text-white`}>
                        {status.label}
                      </div>

                      {/* Cert Icon */}
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                        <Award className="w-6 h-6 text-white" />
                      </div>

                      {/* Content */}
                      <h4 className="text-xl font-bold text-white mb-2 pr-20">{cert.title}</h4>
                      <p className="text-purple-400 font-semibold mb-3">{cert.issuer}</p>
                      
                      {cert.date && (
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                          <Calendar className="w-4 h-4" />
                          <span>Issued {cert.date}</span>
                        </div>
                      )}

                      {cert.description && (
                        <p className="text-gray-400 text-sm mb-4">{cert.description}</p>
                      )}

                      {/* Skills Tags */}
                      {cert.skills && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-500 mb-2">Skills Gained:</p>
                          <div className="flex flex-wrap gap-2">
                            {cert.skills.split(',').map((skill, idx) => (
                              <span key={idx} className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-lg text-xs text-purple-400">
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      

                      {/* Credential Info */}
                      {/* <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                        {cert.credentialId && (
                          <p className="text-xs text-gray-500">ID: {cert.credentialId}</p>
                        )}
                        <div className="flex items-center gap-3">
                          {cert.credentialUrl && (
                            <a
                              href={cert.credentialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Verify
                            </a>
                          )}
                          {cert.certificateLink && (
                            <a
                              href={cert.certificateLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              <Award className="w-4 h-4" />
                              View Certificate
                            </a>
                          )}
                        </div>
                      </div>

                       */}


                      {/* Credential Info */}
<div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-700/50">
  
  {/* ID */}
  {cert.credentialId && (
    <p className="text-xs text-gray-500 break-all max-w-[60%]">
      ID: {cert.credentialId}
    </p>
  )}

  {/* Actions */}
  <div className="flex flex-wrap items-center gap-3 justify-end">
    {cert.credentialUrl && (
      <a
        href={cert.credentialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors whitespace-nowrap"
      >
        <ExternalLink className="w-4 h-4" />
        Verify
      </a>
    )}

    {cert.certificateLink && (
      <a
        href={cert.certificateLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap"
      >
        <Award className="w-4 h-4" />
        View Certificate
      </a>
    )}
  </div>
</div>


                      {/* Admin Controls */}
                      {adminMode && (
                        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 flex gap-2 transition-all">
                          <button
                            onClick={() => startEditingCertification(cert)}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-400 hover:text-blue-300 transition-all"
                            title="Edit certification"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeCertification(cert.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 hover:text-red-300 transition-all"
                            title="Delete certification"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Edit Mode */
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-purple-400 mb-4">Edit Certification</h4>
                      
                      <input
                        type="text"
                        placeholder="Certification Title"
                        value={editingCertData.title}
                        onChange={(e) => setEditingCertData({ ...editingCertData, title: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                      />
                      
                      <input
                        type="text"
                        placeholder="Issuer/Organization"
                        value={editingCertData.issuer}
                        onChange={(e) => setEditingCertData({ ...editingCertData, issuer: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                      />
                      
                      <input
                        type="text"
                        placeholder="Issue Date"
                        value={editingCertData.date || ''}
                        onChange={(e) => setEditingCertData({ ...editingCertData, date: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                      />
                      
                      <input
                        type="text"
                        placeholder="Credential ID"
                        value={editingCertData.credentialId || ''}
                        onChange={(e) => setEditingCertData({ ...editingCertData, credentialId: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                      />
                      
                      <input
                        type="text"
                        placeholder="Credential URL"
                        value={editingCertData.credentialUrl || ''}
                        onChange={(e) => setEditingCertData({ ...editingCertData, credentialUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                      />
                      
                      <input
                        type="text"
                        placeholder="Certificate Link (URL to view certificate)"
                        value={editingCertData.certificateLink || ''}
                        onChange={(e) => setEditingCertData({ ...editingCertData, certificateLink: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                      />
                      
                      <input
                        type="text"
                        placeholder="Skills (comma-separated)"
                        value={editingCertData.skills || ''}
                        onChange={(e) => setEditingCertData({ ...editingCertData, skills: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                      />
                      
                      <textarea
                        placeholder="Description"
                        value={editingCertData.description || ''}
                        onChange={(e) => setEditingCertData({ ...editingCertData, description: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                        rows="3"
                      />
                      
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={saveCertificationEdit}
                          className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={cancelEditingCertification}
                          className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Education Stats */}
        <StatsSection section="education" />
      </div>
    </section>
  );
}