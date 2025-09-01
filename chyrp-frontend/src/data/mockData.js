export const mockPosts = [
  {
    id: 1,
    slug: 'getting-started-with-react',
    title: 'Getting Started with React: A Complete Guide',
    content: `React has revolutionized the way we build user interfaces. In this comprehensive guide, we'll explore the fundamentals of React and help you get started on your journey to becoming a React developer.

## What is React?

React is a JavaScript library for building user interfaces, particularly web applications. It was created by Facebook and has since become one of the most popular frontend frameworks.

## Key Concepts

### Components
Components are the building blocks of React applications. They allow you to split the UI into independent, reusable pieces.

### Props
Props are how you pass data from parent components to child components.

### State
State allows components to manage their own data and re-render when that data changes.

## Getting Started

To create a new React application, you can use Create React App or Vite:

\`\`\`bash
npx create-react-app my-app
# or
npm create vite@latest my-app -- --template react
\`\`\`

This guide will help you understand the basics and get you building amazing applications with React!`,
    excerpt: 'Learn the fundamentals of React and start building amazing user interfaces with this comprehensive beginner-friendly guide.',
    author: 'John Doe',
    publishedAt: '2024-01-15T10:00:00Z',
    isDraft: false,
    isPage: false
  },
  {
    id: 2,
    slug: 'modern-css-techniques',
    title: 'Modern CSS Techniques Every Developer Should Know',
    content: `CSS has evolved significantly over the years. Modern CSS provides powerful tools and techniques that can help you create beautiful, responsive designs with less code.

## CSS Grid and Flexbox

These layout systems have revolutionized how we approach web layouts.

### CSS Grid
Perfect for two-dimensional layouts:

\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
\`\`\`

### Flexbox
Ideal for one-dimensional layouts:

\`\`\`css
.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
\`\`\`

## CSS Custom Properties (Variables)

Custom properties make your CSS more maintainable:

\`\`\`css
:root {
  --primary-color: #2563eb;
  --font-size-large: 1.25rem;
}

.button {
  background-color: var(--primary-color);
  font-size: var(--font-size-large);
}
\`\`\`

These techniques will help you write better, more maintainable CSS!`,
    excerpt: 'Discover the latest CSS techniques including Grid, Flexbox, and custom properties that will transform your web development workflow.',
    author: 'Jane Smith',
    publishedAt: '2024-01-10T14:30:00Z',
    isDraft: false,
    isPage: false
  },
  {
    id: 3,
    slug: 'javascript-best-practices',
    title: 'JavaScript Best Practices for Clean Code',
    content: `Writing clean, maintainable JavaScript is crucial for any serious developer. Here are some best practices that will help you write better code.

## Use Meaningful Variable Names

Instead of:
\`\`\`javascript
const u = users.filter(u => u.age > 18);
\`\`\`

Write:
\`\`\`javascript
const adultUsers = users.filter(user => user.age > 18);
\`\`\`

## Avoid Deep Nesting

Use early returns and guard clauses:

\`\`\`javascript
function processUser(user) {
  if (!user) return null;
  if (!user.isActive) return null;
  
  // Process active user
  return user.name.toUpperCase();
}
\`\`\`

## Use Modern JavaScript Features

Take advantage of ES6+ features:

\`\`\`javascript
// Destructuring
const { name, email } = user;

// Template literals
const message = \`Welcome, \${name}!\`;

// Arrow functions
const doubleNumbers = numbers => numbers.map(n => n * 2);
\`\`\`

Following these practices will make your code more readable and maintainable!`,
    excerpt: 'Learn essential JavaScript best practices that will help you write cleaner, more maintainable code that your team will love.',
    author: 'Mike Johnson',
    publishedAt: '2024-01-08T09:15:00Z',
    isDraft: false,
    isPage: false
  }
];

export const mockPages = [
  {
    id: 4,
    slug: 'about',
    title: 'About Us',
    content: `Welcome to My Awesome Site, where we share insights, stories, and ideas that matter.

## Our Mission

We believe in the power of knowledge sharing and community building. Our mission is to create a platform where developers, designers, and tech enthusiasts can learn, grow, and connect with like-minded individuals.

## What We Cover

- **Web Development**: From frontend frameworks to backend architectures
- **Design**: UI/UX principles, modern design trends, and tools
- **Technology**: Emerging tech, industry news, and analysis
- **Tutorials**: Step-by-step guides and practical examples

## Our Team

We're a diverse group of professionals passionate about technology and education. Each member brings unique expertise and perspective to our content.

## Get Involved

We love hearing from our readers! Whether you have questions, suggestions, or would like to contribute, don't hesitate to reach out.

Thank you for being part of our community!`,
    excerpt: '',
    author: 'Admin',
    publishedAt: '2024-01-01T00:00:00Z',
    isDraft: false,
    isPage: true
  },
  {
    id: 5,
    slug: 'contact',
    title: 'Contact Us',
    content: `We'd love to hear from you! Get in touch with us using the information below.

## Contact Information

**Email**: hello@myawesomesite.com  
**Phone**: +1 (555) 123-4567  
**Address**: 123 Tech Street, San Francisco, CA 94105

## Business Hours

**Monday - Friday**: 9:00 AM - 6:00 PM PST  
**Saturday**: 10:00 AM - 4:00 PM PST  
**Sunday**: Closed

## What to Expect

We typically respond to emails within 24 hours during business days. For urgent matters, please don't hesitate to call.

## Partnership Inquiries

If you're interested in partnering with us or have business proposals, please send detailed information to partnerships@myawesomesite.com.

## Technical Support

For technical issues with the website, please include:
- Browser and version
- Operating system
- Steps to reproduce the issue
- Screenshots if applicable

We appreciate your feedback and look forward to connecting with you!`,
    excerpt: '',
    author: 'Admin',
    publishedAt: '2024-01-01T00:00:00Z',
    isDraft: false,
    isPage: true
  }
];

export const getAllPosts = () => {
  return [...mockPosts, ...mockPages];
};

export const getPublishedPosts = () => {
  return mockPosts.filter(post => !post.isDraft && !post.isPage);
};

export const getPostBySlug = (slug) => {
  return getAllPosts().find(post => post.slug === slug);
};

export const getPageBySlug = (slug) => {
  return mockPages.find(page => page.slug === slug);
};