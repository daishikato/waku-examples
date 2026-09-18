import { ViewTransition } from 'react';

const HomePage = () => (
  <div style={{ padding: '2rem' }}>
    <ViewTransition name="page-title">
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        Waku view transitions
      </h1>
    </ViewTransition>
    <ViewTransition name="page-content">
      <div
        style={{
          backgroundColor: '#e2e8f0',
          padding: '2rem',
          borderRadius: '0.5rem',
        }}
      >
        <p>
          This is the home page. Navigate to see view transitions in action!
        </p>
      </div>
    </ViewTransition>
  </div>
);

export default HomePage;
