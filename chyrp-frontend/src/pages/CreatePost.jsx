// src/pages/CreatePost.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import './CreatePost.css';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [clean, setClean] = useState(''); // URL Slug
  const [body, setBody] = useState('');
  const [isPage, setIsPage] = useState(false);
  const [status, setStatus] = useState('draft'); // 'draft' or 'public'
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const postData = {
      content_type: isPage ? 'page' : 'post',
      title,
      body,
      clean,
      status,
      // 'feather' can be added here if you build that into the form
    };

    try {
      await apiClient.post('/posts/', postData);
      navigate('/'); // Navigate to home on success
    } catch (err) {
      setError('Failed to create post. Please try again.');
    }
  };

  return (
    <div className="create-post-container">
      <h1>Create New {isPage ? 'Page' : 'Post'}</h1>
      
      <div className="content-type-toggle">
        <label>
          <input type="checkbox" checked={isPage} onChange={(e) => setIsPage(e.target.checked)} />
          Create as a static page
        </label>
      </div>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
        <input type="text" value={clean} onChange={(e) => setClean(e.target.value)} placeholder="URL Slug (e.g., my-new-post)" required />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your content..." rows="15" required />
        
        <div className="form-actions">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Save as Draft</option>
            <option value="public">Publish</option>
          </select>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;