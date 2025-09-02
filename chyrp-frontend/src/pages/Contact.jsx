// src/pages/Contact.jsx

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import apiClient from '../api';

const Contact = () => {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        // Fetch the specific page with the URL slug "contact"
        const response = await apiClient.get('/posts/?content_type=page&clean=contact');
        
        // The API returns a list, so we take the first item if it exists
        if (response.data && response.data.length > 0) {
          setPage(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch the Contact page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, []); // The empty array ensures this runs only once

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h1>Contact Page Not Found</h1>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="post">
        <header className="post-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="post-title">{page.title}</h1>
        </header>
        <div className="post-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Use ReactMarkdown to safely render the content from the backend */}
          <ReactMarkdown>{page.body}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Contact;