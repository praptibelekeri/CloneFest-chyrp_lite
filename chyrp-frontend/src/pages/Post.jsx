// src/pages/Post.jsx

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import apiClient from '../api';
import './Post.css';

const Post = () => {
  const [post, setPost] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { postId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPostAndUser = async () => {
      try {
        // Fetch the post
        const postResponse = await apiClient.get(`/posts/${postId}`);
        setPost(postResponse.data);

        // Fetch the current user profile (will fail if not logged in)
        const userResponse = await apiClient.get('/users/me');
        setCurrentUser(userResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPostAndUser();
  }, [postId]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await apiClient.delete(`/posts/${postId}`);
        navigate('/');
      } catch (error) {
        alert('Failed to delete post. You may not have permission.');
      }
    }
  };
  
  const handleLike = async () => {
     try {
      await apiClient.post(`/posts/${postId}/like`);
      alert(`Toggled like for post ${postId}!`);
    } catch (error) {
      alert("You must be logged in to like a post.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!post) return <h1>Post not found</h1>;
  
  const canEditOrDelete = currentUser && (currentUser.id === post.owner.id || currentUser.group.permissions.includes('edit_post'));

  return (
    <div className="post-page">
      <header className="post-header">
        <Link to="/" className="back-link">← Back to Home</Link>
        <h1>{post.title || post.clean}</h1>
        <div className="post-meta">
          <span>By {post.owner.login}</span>
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
          {canEditOrDelete && (
            <>
              <Link to={`/edit-post/${post.id}`} className="btn-edit">Edit</Link>
              <button onClick={handleDelete} className="btn-delete">Delete</button>
            </>
          )}
        </div>
      </header>
      <div className="post-content">
        <ReactMarkdown>{post.body || ''}</ReactMarkdown>
      </div>
      <footer className="post-footer">
        <button onClick={handleLike} className="btn-like">❤️ Like</button>
      </footer>
    </div>
  );
};

export default Post;