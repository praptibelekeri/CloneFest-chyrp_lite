import { getPageBySlug } from '../data/mockData';

const Contact = () => {
  const page = getPageBySlug('contact');

  const formatContent = (content) => {
    return content.split('\n').map((paragraph, index) => {
      if (paragraph.startsWith('## ')) {
        return <h2 key={index}>{paragraph.substring(3)}</h2>;
      }
      if (paragraph.startsWith('### ')) {
        return <h3 key={index}>{paragraph.substring(4)}</h3>;
      }
      if (paragraph.trim() === '') {
        return <br key={index} />;
      }
      if (paragraph.startsWith('**') && paragraph.includes(':**')) {
        const parts = paragraph.split(':**');
        return (
          <p key={index}>
            <strong>{parts[0].substring(2)}</strong>: {parts[1]}
          </p>
        );
      }
      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
        return <p key={index}><strong>{paragraph.slice(2, -2)}</strong></p>;
      }
      return <p key={index}>{paragraph}</p>;
    });
  };

  if (!page) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h1>Page Not Found</h1>
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
          {formatContent(page.content)}
        </div>
      </div>
    </div>
  );
};

export default Contact;