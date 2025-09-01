import { Link } from 'react-router-dom';
import { getPublishedPosts } from '../data/mockData';
import './Home.css';

const Home = () => {
  const posts = getPublishedPosts();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="home">
      <div className="container">
        <section className="hero">
          <h1>Welcome to My Awesome Site</h1>
          <p className="hero-subtitle">
            Discover insights, tutorials, and stories from the world of technology and development.
          </p>
        </section>

        <section className="latest-posts">
          <h2>Latest Posts</h2>
          <div className="posts-grid">
            {posts.map(post => (
              <article key={post.id} className="post-card">
                <div className="post-content">
                  <h3 className="post-title">
                    <Link to={`/post/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="post-excerpt">{post.excerpt}</p>
                  <div className="post-meta">
                    <span className="post-author">By {post.author}</span>
                    <span className="post-date">{formatDate(post.publishedAt)}</span>
                  </div>
                  <Link to={`/post/${post.slug}`} className="read-more">
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;