import { useState } from 'react';
import { Mail, Send, Github, Linkedin, Twitter, CheckCircle } from 'lucide-react';
import { contactAPI } from '@/lib/api';
import { toast } from 'sonner';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };

    let isValid = true;

    if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters';
      isValid = false;
    }

    if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await contactAPI.submit(formData);
        setIsSubmitted(true);
        toast.success('Message sent successfully!');
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({ name: '', email: '', subject: '', message: '' });
          setIsSubmitted(false);
        }, 3000);
      } catch (error) {
        toast.error(error.message || 'Failed to send message. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 sm:mb-12 md:mb-16 pt-4">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent leading-tight">
            Get In Touch
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
            Let's discuss AI projects and collaborations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Form */}
          <div className="bg-slate-700/60 dark:bg-slate-700/60 border border-slate-600/50 rounded-2xl p-4 sm:p-5 md:p-6 backdrop-blur-sm transition-all hover:border-cyan-500/50 dark:hover:border-cyan-500/50"
          >
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-400 mb-3" />
                <h3 className="text-lg sm:text-xl text-white mb-2">Message Sent!</h3>
                <p className="text-gray-300 text-sm">Thank you for reaching out. I'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="name" className="block text-gray-300 mb-1.5 text-sm">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-800/80 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none transition-colors border-2"
                    style={{ 
                      borderColor: errors.name ? '#ef4444' : 'rgba(71, 85, 105, 0.5)',
                    }}
                    onFocus={(e) => {
                      if (!errors.name) {
                        e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.8)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.name) {
                        e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.5)';
                      }
                    }}
                    placeholder="Your name"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-gray-300 mb-1.5 text-sm">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-800/80 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none transition-colors border-2"
                    style={{ 
                      borderColor: errors.email ? '#ef4444' : 'rgba(71, 85, 105, 0.5)',
                    }}
                    onFocus={(e) => {
                      if (!errors.email) {
                        e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.8)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.email) {
                        e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.5)';
                      }
                    }}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="subject" className="block text-gray-300 mb-1.5 text-sm">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-slate-800/80 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none transition-colors border-2"
                    style={{ 
                      borderColor: errors.subject ? '#ef4444' : 'rgba(71, 85, 105, 0.5)',
                    }}
                    onFocus={(e) => {
                      if (!errors.subject) {
                        e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.8)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.subject) {
                        e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.5)';
                      }
                    }}
                    placeholder="What's this about?"
                  />
                  {errors.subject && (
                    <p className="text-red-400 text-xs mt-1">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-gray-300 mb-1.5 text-sm">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-slate-800/80 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none transition-colors resize-none border-2"
                    style={{ 
                      borderColor: errors.message ? '#ef4444' : 'rgba(71, 85, 105, 0.5)',
                    }}
                    onFocus={(e) => {
                      if (!errors.message) {
                        e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.8)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.message) {
                        e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.5)';
                      }
                    }}
                    placeholder="Tell me about your project..."
                  />
                  {errors.message && (
                    <p className="text-red-400 text-xs mt-1">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    background: 'linear-gradient(to right, #06b6d4, #a855f7)',
                    boxShadow: '0 10px 40px rgba(6, 182, 212, 0.3)'
                  }}
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info & Social */}
          <div className="space-y-4 sm:space-y-5">
            <div className="bg-slate-700/60 dark:bg-slate-700/60 border border-slate-600/50 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                <h3 className="text-base sm:text-lg text-white">Email</h3>
              </div>
              <p className="text-gray-300 text-sm break-all">piyushadhikari740@gmail.com</p>
            </div>

            <div className="bg-slate-700/60 dark:bg-slate-700/60 border border-slate-600/50 rounded-2xl p-4 sm:p-5">
              <h3 className="text-base sm:text-lg text-white mb-3 sm:mb-4">Connect With Me</h3>
              <div className="flex flex-col gap-2.5 sm:gap-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 sm:gap-3 text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 sm:gap-3 text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 sm:gap-3 text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Twitter</span>
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <h3 className="text-base sm:text-lg text-white">Available for Work</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-3">
                Currently accepting new projects and collaborations.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                <span>Typically responds within 24 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .hover-link-theme:hover {
          color: var(--theme-text-accent);
        }
      `}</style>
    </section>
  );
}