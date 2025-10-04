import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  CreditCard as Edit3,
  Save,
  X,
  Plus,
  Trash
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';

interface ProjectItem {
  id?: string;
  title: string;
  description: string;
}

interface EducationItem {
  id?: string;
  degree?: string;
  field?: string;
  institution?: string;
  start_year?: string | number;
  end_year?: string | number;
  grade?: string;
  achievements?: string[]; // stored as array on server
}

interface UserProfile {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  resume?: string;
  projects?: ProjectItem[];
  education?: EducationItem[];
  createdAt?: string;
}

export const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    bio: '',
    skills: '',
    experience: 'entry',
    linkedIn: '',
    github: '',
    portfolio: '',
    resume: '',
    projects: [{ title: '', description: '' }] as ProjectItem[],
    education: [{
      degree: '',
      field: '',
      institution: '',
      start_year: '',
      end_year: '',
      grade: '',
      achievements: '' // comma separated in UI
    }] as any[]
  });

  const getToken = () => {
    return localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapServerProfileToLocal = (srv: any): UserProfile => {
    const p: UserProfile = { ...srv };
    if (srv.fullName && (!srv.firstName && !srv.lastName)) {
      const parts = srv.fullName.trim().split(/\s+/);
      p.firstName = parts.shift() || '';
      p.lastName = parts.join(' ') || '';
    } else {
      p.firstName = srv.firstName || '';
      p.lastName = srv.lastName || '';
    }
   
    p.experience = (srv.experience || '').toString().toLowerCase();
    p.linkedIn = srv.linkedinUrl || srv.linkedIn || '';
    p.github = srv.githubUrl || srv.github || '';
    p.portfolio = srv.portfolioUrl || srv.portfolio || '';
    p.resume = srv.resumeUrl || srv.resume || '';

    p.skills = Array.isArray(srv.skills)
      ? srv.skills
      : typeof srv.skills === 'string'
      ? srv.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];
    p.projects = Array.isArray(srv.projects)
      ? srv.projects.map((pr: any) => ({ title: pr.title || '', description: pr.description || '' }))
      : [];
    p.education = Array.isArray(srv.education)
      ? srv.education.map((ed: any) => ({
          degree: ed.degree || '',
          field: ed.field || '',
          institution: ed.institution || '',
          start_year: ed.start_year || '',
          end_year: ed.end_year || '',
          grade: ed.grade || '',
          achievements: Array.isArray(ed.achievements)
           ? ed.achievements
            : (typeof ed.achievements === 'string'
               ? ed.achievements.split(',').map((a: string) => a.trim()).filter(Boolean)
                : [])
        }))
      : [];
    return p;
  };

  const fetchProfile = async () => {
    setError('');
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setError('Not authenticated. Please login.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        signOut();
        setError('Session expired. Please login again.');
        return;
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setError(err.message || 'Failed to fetch profile');
        return;
      }

      const resJson = await response.json();
      const srvProfile = resJson?.data?.profile || resJson?.data || resJson;
      const mapped = mapServerProfileToLocal(srvProfile);
      setProfile(mapped);

      // set edit form with mapped values; achievements join as comma string
      setEditForm(prev => ({
        ...prev,
        firstName: mapped.firstName || '',
        lastName: mapped.lastName || '',
        phone: mapped.phone || '',
        location: mapped.location || '',
        bio: mapped.bio || '',
        skills: (mapped.skills || []).join(', '),
        experience: mapped.experience || 'entry',
        linkedIn: mapped.linkedIn || '',
        github: mapped.github || '',
        portfolio: mapped.portfolio || '',
        resume: mapped.resume || '',
        projects: (mapped.projects && mapped.projects.length) ? mapped.projects : [{ title: '', description: '' }],
        education: (mapped.education && mapped.education.length) ? mapped.education.map(ed => ({
          degree: ed.degree || '',
          field: ed.field || '',
          institution: ed.institution || '',
          start_year: ed.start_year || '',
          end_year: ed.end_year || '',
          grade: ed.grade || '',
          achievements: (ed.achievements || []).join(', ')
        })) : [{ degree: '', field: '', institution: '', start_year: '', end_year: '', grade: '', achievements: '' }]
      }));
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    try {
      setSaving(true);
      const token = getToken();
      if (!token) {
        setError('Not authenticated. Please login.');
        return;
      }

      const skillsArray = (editForm.skills as string)
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      const fullName = `${(editForm.firstName as string) || ''} ${(editForm.lastName as string) || ''}`.trim();

      const projectsPayload = (editForm.projects as ProjectItem[])
        .map(p => ({ title: p.title?.trim(), description: p.description?.trim() }))
        .filter(p => p.title || p.description);

      // convert education achievements from comma string to array, drop empty entries
      const educationPayload = (editForm.education as any[])
        .map(ed => ({
          degree: (ed.degree || '').trim(),
          field: (ed.field || '').trim(),
          institution: (ed.institution || '').trim(),
          start_year: ed.start_year || '',
          end_year: ed.end_year || '',
          grade: (ed.grade || '').trim(),
          achievements: (ed.achievements || '').split(',').map((a: string) => a.trim()).filter(Boolean)
        }))
        .filter(ed => ed.degree || ed.field || ed.institution || (ed.achievements && ed.achievements.length));

      const payload: any = {
        fullName,
        phone: editForm.phone || undefined,
        location: editForm.location || undefined,
        bio: editForm.bio || undefined,
        skills: skillsArray,
        experience: editForm.experience,
        linkedinUrl: editForm.linkedIn || undefined,
        githubUrl: editForm.github || undefined,
        portfolioUrl: editForm.portfolio || undefined,
        resumeUrl: editForm.resume || undefined,
        projects: projectsPayload,
        education: educationPayload
      };

      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        signOut();
        setError('Session expired. Please login again.');
        return;
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setError(err.message || 'Failed to update profile');
        return;
      }

      const resJson = await response.json();
      const srvProfile = resJson?.data?.profile || resJson?.data || resJson;
      const mapped = mapServerProfileToLocal(srvProfile);

    setProfile({ ...mapped, experience: (mapped.experience || editForm.experience) });  
    setIsEditing(false);
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    if (profile) {
      setEditForm(prev => ({
        ...prev,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        skills: profile.skills?.join(', ') || '',
        experience: profile.experience || 'entry',
        linkedIn: profile.linkedIn || '',
        github: profile.github || '',
        portfolio: profile.portfolio || '',
        resume: profile.resume || '',
        projects: (profile.projects && profile.projects.length) ? profile.projects : [{ title: '', description: '' }],
        education: (profile.education && profile.education.length) ? profile.education.map(ed => ({
          degree: ed.degree || '',
          field: ed.field || '',
          institution: ed.institution || '',
          start_year: ed.start_year || '',
          end_year: ed.end_year || '',
          grade: ed.grade || '',
          achievements: (ed.achievements || []).join(', ')
        })) : [{ degree: '', field: '', institution: '', start_year: '', end_year: '', grade: '', achievements: '' }]
      }));
    }
  };

  // project helpers
  const addProject = () => {
    setEditForm(prev => ({ ...prev, projects: [...(prev.projects as ProjectItem[]), { title: '', description: '' }] }));
  };

  const updateProject = (index: number, field: keyof ProjectItem, value: string) => {
    setEditForm(prev => {
      const projects = [...(prev.projects as ProjectItem[])];
      projects[index] = { ...projects[index], [field]: value };
      return { ...prev, projects };
    });
  };

  const removeProject = (index: number) => {
    setEditForm(prev => {
      const projects = [...(prev.projects as ProjectItem[])];
      projects.splice(index, 1);
      return { ...prev, projects: projects.length ? projects : [{ title: '', description: '' }] };
    });
  };

  // education helpers
  const addEducation = () => {
    setEditForm(prev => ({ ...prev, education: [...(prev.education as any[]), { degree: '', field: '', institution: '', start_year: '', end_year: '', grade: '', achievements: '' }] }));
  };

  const updateEducation = (index: number, field: keyof EducationItem | 'achievements', value: string) => {
    setEditForm(prev => {
      const education = [...(prev.education as any[])];
      education[index] = { ...education[index], [field]: value };
      return { ...prev, education };
    });
  };

  const removeEducation = (index: number) => {
    setEditForm(prev => {
      const education = [...(prev.education as any[])];
      education.splice(index, 1);
      return { ...prev, education: education.length ? education : [{ degree: '', field: '', institution: '', start_year: '', end_year: '', grade: '', achievements: '' }] };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-indigo-900 drop-shadow mb-1">My Profile</h1>
            <p className="text-indigo-500 mt-1 text-lg">Manage your professional information</p>
          </div>
            <Button
            onClick={signOut}
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 shadow-md ml-auto md:ml-0"
            >
            Logout
            </Button>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg shadow">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Profile Summary Card */}
            <div className="xl:col-span-1">
            <div className="md:sticky md:top-8">
              <Card className="p-8 text-center bg-gradient-to-br from-indigo-100 to-blue-50 shadow-lg rounded-2xl">
              <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-white">
                <User className="w-14 h-14 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-indigo-900 mb-2">
                {profile?.firstName && profile?.lastName
                ? `${profile.firstName} ${profile.lastName}`
                : (profile?.fullName || 'Complete Your Profile')
                }
              </h2>
              <p className="text-indigo-600 mb-4 flex items-center justify-center font-medium">
                <Mail className="w-5 h-5 mr-2" />
                {user?.email}
              </p>
              {profile?.location && (
                <p className="text-indigo-600 mb-4 flex items-center justify-center font-medium">
                <MapPin className="w-5 h-5 mr-2" />
                {profile.location}
                </p>
              )}
              <div className="flex items-center justify-center text-sm text-indigo-400">
                <Calendar className="w-4 h-4 mr-2" />
                Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </div>
              </Card>
            </div>
            </div>

          {/* Profile Details */}
          <div className="xl:col-span-2">
            <Card className="p-8 bg-sky-50 shadow-xl rounded-2xl">
              <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h3 className="text-2xl font-bold text-indigo-900">Profile Information</h3>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center bg-gradient-to-r  ml-auto md:ml-0 from-blue-500 to-indigo-600 text-white font-semibold shadow hover:scale-105 transition-transform"
                  >
                    <Edit3 className="w-5 h-5 mr-2 md:ml-0" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold shadow hover:scale-105 transition-transform"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex items-center border-indigo-300 text-indigo-700 font-semibold shadow hover:bg-indigo-50"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Information (left as before) */}
                <div>
                  <label className="block text-sm font-semibold text-indigo-700 mb-2">First Name</label>
                  {isEditing ? (
                    <Input value={editForm.firstName} onChange={(e) => setEditForm({...editForm, firstName: e.target.value})} placeholder="Enter your first name" className="border-indigo-300 focus:ring-indigo-500" />
                  ) : (
                    <p className="text-indigo-900 py-2 font-medium">{profile?.firstName || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-indigo-700 mb-2">Last Name</label>
                  {isEditing ? (
                    <Input value={editForm.lastName} onChange={(e) => setEditForm({...editForm, lastName: e.target.value})} placeholder="Enter your last name" className="border-indigo-300 focus:ring-indigo-500" />
                  ) : (
                    <p className="text-indigo-900 py-2 font-medium">{profile?.lastName || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-indigo-700 mb-2">Phone Number</label>
                  {isEditing ? (
                    <Input value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} placeholder="Enter your phone number" />
                  ) : (
                    <p className="text-indigo-900 py-2 flex items-center"><Phone className="w-4 h-4 mr-2" />{profile?.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-indigo-700 mb-2">Location</label>
                  {isEditing ? (
                    <Input value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} placeholder="Enter your location" />
                  ) : (
                    <p className="text-indigo-900 py-2 flex items-center"><MapPin className="w-4 h-4 mr-2" />{profile?.location || 'Not provided'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-indigo-700 mb-2">Bio</label>
                  {isEditing ? (
                    <textarea value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} placeholder="Tell us about yourself..." rows={3} className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  ) : (
                    <p className="text-indigo-900 py-2 font-medium">{profile?.bio || 'No bio provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-indigo-700 mb-2">Skills</label>
                  {isEditing ? (
                    <Input value={editForm.skills} onChange={(e) => setEditForm({...editForm, skills: e.target.value})} placeholder="JavaScript, React, Node.js (comma separated)" />
                  ) : (
                    <div className="flex flex-wrap gap-2 py-2">
                      {profile?.skills?.length ? profile.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-800 rounded-full text-sm font-semibold shadow">{skill}</span>
                      )) : <p className="text-gray-500">No skills added</p>}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-indigo-700 mb-2">Experience Level</label>
                  {isEditing ? (
                    <select
                      value={editForm.experience}
                      onChange={(e) => setEditForm(prev => ({ ...prev, experience: e.target.value }))}
                      aria-label="Experience level"
                      className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="entry">Entry Level</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior Level</option>
                      <option value="lead">Lead/Principal</option>                    
                    </select>
                  ) : (
                   <p className="text-indigo-900 py-2 flex items-center">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {profile?.experience
                        ? profile.experience.charAt(0).toUpperCase() + profile.experience.slice(1) + ' Level'
                        : 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Social Links, Resume, Projects & Education */}
                <div className="md:col-span-2">


                  {/* Projects */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-lg font-medium text-indigo-900">Projects & Experience</h5>
                      {isEditing && (
                        <Button onClick={addProject} className="flex items-center text-sm">
                          <Plus className="w-4 h-4 mr-2" /> Add
                        </Button>
                      )}
                    </div>

                    {!isEditing ? (
                      <div className="space-y-3 mb-6">
                        {profile?.projects && profile.projects.length ? (
                          profile.projects.map((p, idx) => (
                            <Card key={idx} className="p-4 bg-gray-50">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h6 className="font-semibold text-indigo-800">{p.title || 'Untitled'}</h6>
                                  <p className="text-sm text-gray-700 mt-1">{p.description || 'No description provided'}</p>
                                </div>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No projects or experience added</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3 mb-6">
                        {(editForm.projects as ProjectItem[]).map((p, i) => (
                          <div key={i} className="p-3 border rounded-lg bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <div className="text-sm font-medium text-indigo-800">{`Item ${i + 1}`}</div>
                              <button type="button" onClick={() => removeProject(i)} className="text-red-600">
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="mb-2">
                              <Input placeholder="Title" value={p.title} onChange={(e) => updateProject(i, 'title', e.target.value)} />
                            </div>
                            <div>
                              <textarea placeholder="Description" value={p.description} onChange={(e) => updateProject(i, 'description', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Education */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-lg font-medium text-indigo-900">Education</h5>
                      {isEditing && (
                        <Button onClick={addEducation} className="flex items-center text-sm">
                          <Plus className="w-4 h-4 mr-2" /> Add
                        </Button>
                      )}
                    </div>

                    {!isEditing ? (
                      <div className="space-y-4">
                        {profile?.education && profile.education.length ? (
                          profile.education.map((ed, idx) => (
                            <Card key={idx} className="p-4 bg-gray-50">
                              <div>
                                <div className="flex items-baseline justify-between">
                                  <h6 className="font-semibold text-indigo-800">{ed.degree ? `${ed.degree} — ${ed.field || ''}` : (ed.field || 'Education')}</h6>
                                  <span className="text-sm text-gray-500">{ed.start_year || ''}{ed.end_year ? ` — ${ed.end_year}` : ''}</span>
                                </div>
                                <p className="text-sm text-gray-700 mt-1">{ed.institution || ''}</p>
                                {ed.grade && <p className="text-sm text-gray-700 mt-1">Grade: {ed.grade}</p>}
                                {ed.achievements && ed.achievements.length ? (
                                  <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                                    {ed.achievements.map((a, i) => <li key={i}>{a}</li>)}
                                  </ul>
                                ) : null}
                              </div>
                            </Card>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No education records added</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(editForm.education as any[]).map((ed, i) => (
                          <div key={i} className="p-3 border rounded-lg bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <div className="text-sm font-medium text-indigo-800">{`Education ${i + 1}`}</div>
                              <button type="button" onClick={() => removeEducation(i)} className="text-red-600">
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                              <Input placeholder="Degree (e.g. M.Tech)" value={ed.degree} onChange={(e) => updateEducation(i, 'degree', e.target.value)} />
                              <Input placeholder="Field (e.g. Computer Science)" value={ed.field} onChange={(e) => updateEducation(i, 'field', e.target.value)} />
                              <Input placeholder="Institution (e.g. NIT Surathkal)" value={ed.institution} onChange={(e) => updateEducation(i, 'institution', e.target.value)} />
                              <Input placeholder="Start year (e.g. 2022)" value={ed.start_year} onChange={(e) => updateEducation(i, 'start_year', e.target.value)} />
                              <Input placeholder="End year (e.g. 2024)" value={ed.end_year} onChange={(e) => updateEducation(i, 'end_year', e.target.value)} />
                              <Input placeholder="Grade (e.g. 8.5 CGPA)" value={ed.grade} onChange={(e) => updateEducation(i, 'grade', e.target.value)} />
                            </div>

                            <div>
                              <label className="block text-sm text-gray-700 mb-1">Achievements (comma separated)</label>
                              <Input placeholder="Teaching Assistant, Core Team Member" value={ed.achievements} onChange={(e) => updateEducation(i, 'achievements', e.target.value)} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                {/* {social} */}
                  <h4 className="text-xl font-bold text-indigo-900 m-4">Social & Resume</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6 mt-6">
                    <div>
                      <label className="block text-sm font-semibold text-indigo-700 mb-2">LinkedIn</label>
                      {isEditing ? (
                        <Input value={editForm.linkedIn} onChange={(e) => setEditForm({...editForm, linkedIn: e.target.value})} placeholder="LinkedIn profile URL" />
                      ) : (
                        <p className="text-indigo-900 py-2">{profile?.linkedIn ? <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Profile</a> : 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-indigo-700 mb-2">GitHub</label>
                      {isEditing ? (
                        <Input value={editForm.github} onChange={(e) => setEditForm({...editForm, github: e.target.value})} placeholder="GitHub profile URL" />
                      ) : (
                        <p className="text-indigo-900 py-2">{profile?.github ? <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Profile</a> : 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-indigo-700 mb-2">Portfolio</label>
                      {isEditing ? (
                        <Input value={editForm.portfolio} onChange={(e) => setEditForm({...editForm, portfolio: e.target.value})} placeholder="Portfolio website URL" />
                      ) : (
                        <p className="text-indigo-900 py-2">{profile?.portfolio ? <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Portfolio</a> : 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-indigo-700 mb-2">Resume</label>
                      {isEditing ? (
                        <Input value={editForm.resume} onChange={(e) => setEditForm({...editForm, resume: e.target.value})} placeholder="Resume URL" />
                      ) : (
                        <p className="text-indigo-900 py-2">{profile?.resume ? <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Resume</a> : 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};