import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPostBySlug, getPageBySlug } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import './Post.css';

const Post = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const post = getPostBySlug(slug) || getPageBySlug(slug);

  if (!post) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h1>Post Not Found</h1>
        <p>The post you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">← Back to Home</Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content) => {
    return content.split('\n').map((paragraph, index) => {
      if (paragraph.startsWith('## ')) {
        return <h2 key={index}>{paragraph.substring(3)}</h2>;
      }
      if (paragraph.startsWith('### ')) {
        return <h3 key={index}>{paragraph.substring(4)}</h3>;
      }
      if (paragraph.startsWith('```')) {
        return null; // Handle code blocks separately if needed
      }
      if (paragraph.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index}>{paragraph}</p>;
    });
  };

  return (
    <div className="post-page">
      <div className="container">
        <article className="post">
          <header className="post-header">
            <Link to="/" className="back-link">← Back to Blog</Link>
            <h1 className="post-title">{post.title}</h1>
            {!post.isPage && (
              <div className="post-meta">
                <span className="post-author">By {post.author}</span>
                <span className="post-date">{formatDate(post.publishedAt)}</span>
                {user && (
                  <Link 
                    to={`/edit-post/${post.slug}`} 
                    className="btn btn-secondary btn-small"
                  >
                    Edit Post
                  </Link>
                )}
              </div>
            )}
          </header>

          <div className="post-content">
            {formatContent(post.content)}
          </div>

          {!post.isPage && (
            <footer className="post-footer">
              <div className="post-actions">
                <button className="btn btn-primary">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  Like Post
                </button>
                <button className="btn btn-secondary">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 1 1 0-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 1 0 5.367-2.684 3 3 0 0 0-5.367 2.684zm0 9.316a3 3 0 1 0 5.367 2.684 3 3 0 0 0-5.367-2.684z"/>
                  </svg>
                  Share
                </button>
              </div>

              <div className="comments-section">
                <h3>Comments</h3>
                <div className="comment-form">
                  {user ? (
                    <form>
                      <textarea 
                        className="form-textarea" 
                        placeholder="Write your comment..." 
                        rows="4"
                      ></textarea>
                      <button type="submit" className="btn btn-primary">Post Comment</button>
                    </form>
                  ) : (
                    <div className="login-prompt">
                      <p>Please <Link to="/login">log in</Link> to leave a comment.</p>
                    </div>
                  )}
                </div>
              </div>
            </footer>
          )}
        </article>
      </div>
    </div>
  );
};

export default Post;