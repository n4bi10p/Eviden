import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div style={{ 
      position: 'fixed', 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      backgroundColor: 'white',
      color: 'black',
      border: '2px solid red',
      zIndex: 9999
    }}>
      <h1>TEST COMPONENT IS WORKING!</h1>
      <p>If you can see this, React is rendering correctly.</p>
    </div>
  );
};

export default TestComponent;
