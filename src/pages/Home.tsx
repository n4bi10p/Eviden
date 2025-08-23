import React from 'react';
import Button from '../components/Button';
import Card from '../components/Card';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Heading */}
        <h1 className="text-6xl md:text-8xl font-bold mb-8">
          <span className="text-macos-gray-900 dark:text-white">Verify</span>{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-macos-purple to-macos-blue dark:from-cyber-purple dark:to-cyber-cyan">
            The Event
          </span>
          <br />
          <span className="text-macos-gray-900 dark:text-white">Attendance</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-macos-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Join the ultimate cybersecurity challenge organized by <span className="text-macos-blue dark:text-cyber-cyan font-semibold">EVIDEN BAU CS</span>. Test 
          your skills in cryptography, web exploitation, reverse engineering, and more. 
          Compete with the best and win exciting prizes!
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button size="lg">
            📝 Register Now
          </Button>
          <Button variant="outline" size="lg">
            📚 Learn More
          </Button>
        </div>
        
        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="glass" className="p-6">
            <h3 className="text-3xl font-bold text-macos-blue dark:text-cyber-cyan mb-2">500+</h3>
            <p className="text-macos-gray-700 dark:text-gray-300">Participants</p>
          </Card>
          <Card variant="glass" className="p-6">
            <h3 className="text-3xl font-bold text-macos-purple dark:text-cyber-purple mb-2">$10K</h3>
            <p className="text-macos-gray-700 dark:text-gray-300">Prize Pool</p>
          </Card>
          <Card variant="glass" className="p-6">
            <h3 className="text-3xl font-bold text-macos-blue dark:text-cyber-cyan mb-2">24hrs</h3>
            <p className="text-macos-gray-700 dark:text-gray-300">Competition</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
