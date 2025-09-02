// src/pages/EditPost.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api';
import './CreatePost.css';

const EditPost = () => {
  const [formData, setFormData] = useState({
    title: '',
    clean: '',
    body: '',
    status: 'draft',
    content_type: 'post'
  });
  const { postId } = useParams();
  const navigate = useNavigate();

  // 1. Fetch the post data to populate the form
  useEffect(() => {
    apiClient.get(`/posts/${postId}`)
      .then(response => {
        setFormData({
          title: response.data.title || '',
          clean: response.data.clean || '',
          body: response.data.body || '',
          status: response.data.status || 'draft',
          content_type: response.data.content_type || 'post'
        });
      })
      .catch(error => console.error("Failed to fetch post:", error));
  }, [postId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Submit the updated data to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/posts/${postId}`, formData);
      navigate(`/posts/${postId}`); // Navigate to the post's page
    } catch (error) {
      alert('Failed to update post. You may not have permission.');
    }
  };

  return (
    <div className="create-post-container">
      <h1>Edit {formData.content_type === 'page' ? 'Page' : 'Post'}</h1>
      
      <form onSubmit={handleSubmit}>
        <input name="title" type="text" value={formData.title} onChange={handleChange} placeholder="Title" required />
        <input name="clean" type="text" value={formData.clean} onChange={handleChange} placeholder="URL Slug" required />
        <textarea name="body" value={formData.body} onChange={handleChange} placeholder="Write your content..." rows="15" required />
        
        <div className="form-actions">
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="draft">Save as Draft</option>
            <option value="public">Publish</option>
          </select>
          <button type="submit">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;