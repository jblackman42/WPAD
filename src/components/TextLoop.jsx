import React, { useState, useEffect } from 'react';

const TextLoop = ({ children, delay=5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Set up a timer to go to the next index every 500ms
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % React.Children.count(children));
    }, delay);
    
    // Clear the timer when the component unmounts
    return () => clearInterval(timer);
  }, [children, delay]);

  return (
    <div className="text-loop">
      {React.Children.map(children, (child, index) => (
        <div key={index} className={`text-item ${index === currentIndex ? 'visible' : ''}`}>
          {child}
        </div>
      ))}
    </div>
  );
};

export default TextLoop;