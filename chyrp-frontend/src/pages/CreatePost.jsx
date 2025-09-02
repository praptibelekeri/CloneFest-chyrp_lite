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
  const [feather, setFeather] = useState('text'); // 'text' | 'photo'
  const [photoFile, setPhotoFile] = useState(null);
  const [status, setStatus] = useState('draft'); // 'draft' or 'public'
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (feather === 'photo') {
        if (!photoFile) {
          setError('Please choose an image to upload.');
          return;
        }
        const form = new FormData();
        form.append('clean', clean);
        form.append('title', title);
        form.append('status', status);
        form.append('file', photoFile);
        await apiClient.post('/posts/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        const postData = {
          content_type: isPage ? 'page' : 'post',
          title,
          body,
          clean,
          status,
          feather: 'text',
        };
        await apiClient.post('/posts/', postData);
      }
      navigate('/');
    } catch (err) {
      let detail = err?.response?.data?.detail;
      if (!detail && typeof err?.response?.data === 'object') {
        try { detail = JSON.stringify(err.response.data); } catch {}
      }
      setError(detail ? `Failed: ${detail}` : 'Failed to create post. Please try again.');
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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label>
            <input type="radio" name="feather" value="text" checked={feather === 'text'} onChange={() => setFeather('text')} /> Text
          </label>
          <label>
            <input type="radio" name="feather" value="photo" checked={feather === 'photo'} onChange={() => setFeather('photo')} /> Photo
          </label>
        </div>

        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
        <input type="text" value={clean} onChange={(e) => setClean(e.target.value)} placeholder="URL Slug (e.g., my-new-post)" required />
        {feather === 'text' ? (
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your content..." rows="15" required />
        ) : (
          <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
        )}
        
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