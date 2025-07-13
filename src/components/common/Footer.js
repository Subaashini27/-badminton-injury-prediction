import React from 'react';

// Update your Footer.js component
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white py-6 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">
              Contact Us
            </a>
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            Developed for University Selangor - Faculty of Communication, Visual Art and Computing
          </p>
          <p className="mt-1">
            Subaashini A/P Mohanasundaram - Final Year Project 2025
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;