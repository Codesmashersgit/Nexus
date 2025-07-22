// Footer.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram, faGithub } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="h-[280px] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:py-5">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Left: Brand & Links */}
          <div className="text-center lg:text-left ">
           <a href="#"><div className="logo flex items-center gap-2">
          <img
            src="https://png.pngtree.com/template/20190530/ourmid/pngtree-letter-c-logo-vector-image_204408.jpg"
            alt="ChromaMeet Logo"
            className="md:h-[60px] h-[50px] w-auto"
          />
          <h1 className="md:text-[30px] text-[25px] font-bold text-purple-600">
            Chroma<span className="text-black md:text-xl text-lg">meet</span>
          </h1>
          </div>
          </a>
          
            <ul className="flex flex-wrap justify-center md:justify-start space-x-7 mt-2 text-sm text-purple-600">
              <li><a href="#" className="hover:text-black">Home</a></li>
              <li><a href="#" className="hover:text-black">About</a></li>
              <li><a href="#" className="hover:text-black">Services</a></li>
              <li><a href="#" className="hover:text-black">Contact</a></li>
            </ul>
          </div>

          {/* Right: Social Icons */}
          <div className="flex space-x-4">
            <a href="#" className=" text-purple-600 hover:text-black">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="#" className="text-purple-600 hover:text-black">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="#" className=" text-purple-600 hover:text-black">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="#" className="text-purple-600 hover:text-black">
              <FontAwesomeIcon icon={faGithub} />
            </a>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Chromameet. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
