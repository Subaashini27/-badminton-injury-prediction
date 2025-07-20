import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen relative">
      {/* Background Image with Fallback */}
      <div 
        className="absolute inset-0 z-0 bg-blue-900"
        style={{
          backgroundImage: 'url(/images/badminton.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundBlendMode: 'overlay'
        }}
      />
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 z-10 bg-gradient-to-b from-blue-900/70 to-blue-700/70"
        style={{
          backdropFilter: 'brightness(0.8)'
        }}
      />
      
      {/* Content */}
      <div className="relative z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <nav className="flex justify-between items-center mb-8 sm:mb-12 lg:mb-16">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">BadmintonSafe</h1>
            <div className="flex space-x-2 sm:space-x-4">
              <Link
                to="/login"
                className="px-3 py-2 sm:px-6 sm:py-2 text-sm sm:text-base text-white bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-blue-900 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-2 sm:px-6 sm:py-2 text-sm sm:text-base text-blue-900 bg-white rounded-lg hover:bg-blue-100 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </nav>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="text-white">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
                Prevent Injuries,<br />
                Enhance Performance
              </h2>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-blue-100 leading-relaxed">
                Welcome to BadmintonSafe, your AI-powered badminton movement analysis system. 
                Train smarter, play safer, and achieve your peak performance.
              </p>
              <div className="space-y-4 sm:space-y-4">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-800/50 backdrop-blur-sm rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg mb-1">Real-time Movement Analysis</h3>
                    <p className="text-blue-200 text-sm sm:text-base">Get instant feedback on your technique and posture</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-2 bg-blue-800/50 backdrop-blur-sm rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg mb-1">Injury Prevention</h3>
                    <p className="text-blue-200 text-sm sm:text-base">Advanced risk assessment and early warning system</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-2 bg-blue-800/50 backdrop-blur-sm rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg mb-1">Performance Tracking</h3>
                    <p className="text-blue-200 text-sm sm:text-base">Monitor your progress and improve consistently</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-blue-800/50 backdrop-blur-sm rounded-lg transform rotate-3"></div>
              <div className="relative bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-xl">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Start Your Journey Today</h3>
                <p className="text-gray-600 mb-6">
                  Join athletes who are already using BadmintonSafe to:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Analyze movement patterns
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Receive personalized tips
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Track improvement over time
                  </li>
                </ul>
                <Link
                  to="/register"
                  className="mt-8 block w-full py-3 px-6 text-center text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Get Started Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 