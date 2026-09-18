import { ViewTransition } from 'react';

const AboutPage = () => (
  <div style={{ padding: '2rem' }}>
    <ViewTransition name="page-title">
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>About Waku</h1>
    </ViewTransition>
    <ViewTransition name="page-content">
      <div
        style={{
          backgroundColor: '#f8fafc',
          padding: '2rem',
          borderRadius: '0.5rem',
        }}
      >
        <p>This is the about page with a different background color.</p>
      </div>
    </ViewTransition>
  </div>
);

export default AboutPage;
