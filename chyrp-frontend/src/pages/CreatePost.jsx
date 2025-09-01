import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './CreatePost.css';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    isPage: false,
    isDraft: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };

    // Auto-generate slug when title changes
    if (name === 'title' && !formData.slug) {
      newFormData.slug = generateSlug(value);
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!formData.title.trim()) {
      setError('Title is required');
      setIsLoading(false);
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      setIsLoading(false);
      return;
    }

    if (!formData.slug.trim()) {
      setError('URL slug is required');
      setIsLoading(false);
      return;
    }

    try {
      // Mock save - in a real app, this would make an API call
      const newPost = {
        ...formData,
        id: Date.now(),
        author: user.name,
        publishedAt: new Date().toISOString()
      };
      
      console.log('Creating post:', newPost);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/');
    } catch (err) {
      setError('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    const draftData = { ...formData, isDraft: true };
    setFormData(draftData);
    // In a real app, auto-save draft functionality would go here
    console.log('Saving draft:', draftData);
  };

  const handlePublish = async () => {
    const publishData = { ...formData, isDraft: false };
    setFormData(publishData);
  };

  return (
    <div className="create-post-page">
      <div className="container">
        <div className="create-post-container">
          <header className="create-post-header">
            <h1>Create New {formData.isPage ? 'Page' : 'Post'}</h1>
            <div className="content-type-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  name="isPage"
                  checked={formData.isPage}
                  onChange={handleChange}
                />
                <span>Create as static page</span>
              </label>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="create-post-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title" className="form-label">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter the title..."
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="slug" className="form-label">URL Slug *</label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="url-friendly-slug"
                  required
                />
                <small className="form-help">
                  This will be the URL: /post/{formData.slug}
                </small>
              </div>
            </div>

            {!formData.isPage && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="excerpt" className="form-label">Excerpt</label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Brief description for the post preview..."
                    rows="3"
                  ></textarea>
                  <small className="form-help">
                    A short summary that will appear on the blog homepage
                  </small>
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="content" className="form-label">Content *</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  className="form-textarea content-editor"
                  placeholder="Write your content here... You can use markdown formatting."
                  rows="20"
                  required
                ></textarea>
                <small className="form-help">
                  Use ## for headings, **bold**, *italic*, and other markdown formatting
                </small>
              </div>
            </div>

            <div className="form-actions">
              <div className="draft-actions">
                <button 
                  type="button" 
                  onClick={handleSaveDraft}
                  className="btn btn-secondary"
                  disabled={isLoading}
                >
                  Save Draft
                </button>
                <span className="draft-status">
                  {formData.isDraft ? 'Draft' : 'Published'}
                </span>
              </div>
              
              <div className="publish-actions">
                <button 
                  type="submit"
                  onClick={handlePublish}
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;