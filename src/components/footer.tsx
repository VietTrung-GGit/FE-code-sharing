import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo.svg';

// Modal Component with Styled Close Button
function Modal({ mode, onClose }: { mode: 'about' | 'privacy' | 'terms'; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Close modal if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className='fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50'>
      <div
        ref={modalRef}
        className='py-16 w-screen h-screen sm:w-[80vw] sm:h-min lg:w-[50vw] bg-Background/Bottom p-12 sm:rounded-3xl sm:border-2 border-Primary/Dark flex flex-col items-center text-white relative overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent'
      >
        {/* Close Button (X) */}
        <button
          onClick={onClose}
          className='absolute top-3 right-4 text-gray-400 text-2xl hover:text-white'
        >
          ×
        </button>

        <h2 className='text-xl font-semibold mb-3 text-center'>
          {mode === 'about' ? 'About Us' : mode === 'privacy' ? 'Privacy Policy' : 'Terms of Use'}
        </h2>

        {/* Modal Content */}
        {mode === 'about' && (
          <>
            <p className='text-center text-gray-300'>
              We are a team of four passionate developers participating in
              <span className='font-semibold text-[var(--text-title)]'> Fessior Dev Camp 2024</span>
              , an event organized by the
              <span className='font-semibold text-[var(--text-title)]'>
                {' '}
                Google Developer Student Club (GDSC)
              </span>{' '}
              at
              <span className='font-semibold text-[var(--text-title)]'>
                {' '}
                Ho Chi Minh City University of Technology (HCMUT)
              </span>
              .
            </p>
            <p className='text-center text-gray-300 mt-3'>
              We are thrilled to present{' '}
              <span className='font-bold text-Accent/Target'>CoDash</span>, our very first project
              as software developers. We want to make it easier for programmers and coding
              enthusiasts to collaborate by offering a streamlined
              <span className='font-semibold text-[var(--green-highlight)]'>
                {' '}
                code-sharing platform
              </span>
              .
            </p>
            <p className='text-center text-gray-300 mt-2'>
              Your feedback and contributions would help us improve CoDash and shape its future.
            </p>
            <p className='text-center text-gray-300 mt-2'>
              Have ideas, suggestions, or found a bug? Feel free to
              <span className='font-semibold text-[var(--green-highlight)]'>
                {' '}
                share your thoughts with us!
              </span>{' '}
              You can reach out via email at
              <a
                href='mailto:devteam3gdsc@gmail.com'
                className='text-[var(--text-title)] font-bold'
              >
                {' '}
                devteam3gdsc@gmail.com
              </a>
              .
            </p>
          </>
        )}
        {mode === 'privacy' && (
          <div className='overflow-y-auto text-gray-300 flex items-center justify-center px-4'>
            <ul className='list-disc list-inside text-left space-y-4'>
              <li>
                Your privacy is important to us. We collect minimal data and do not sell or share it
                with third-party organizations.
              </li>
              <li>
                We use cookies solely for sign-in purposes to enhance security and maintain your
                session. These cookies are not used for tracking or personalized ads.
              </li>
              <li>
                Your data is stored securely and is only used to provide essential features. We do
                not analyze or process your information beyond what is necessary.
              </li>
              <li>
                We continuously work to improve our security and privacy measures to keep your data
                safe.
              </li>
              <li>
                For more details or concerns, contact us at{' '}
                <a
                  href='mailto:devteam3gdsc@gmail.com'
                  className='text-[var(--text-title)] font-bold'
                >
                  devteam3gdsc@gmail.com
                </a>
                .
              </li>
            </ul>
          </div>
        )}

        {mode === 'terms' && (
          <div className='overflow-y-auto text-gray-300 flex items-center justify-center px-4'>
            <ul className='list-disc list-inside text-left space-y-4'>
              <li>By using our platform, you agree to abide by our terms and conditions.</li>
              <li>All shared content must comply with our community guidelines and policies.</li>
              <li>
                We reserve the right to update or modify these terms at any time without prior
                notice.
              </li>
              <li>Your account may be suspended or terminated if you violate our policies.</li>
              <li>
                We do not take responsibility for user-generated content posted on our platform.
              </li>
              <li>
                In case of disputes or concerns, please reach out to us via{' '}
                <a
                  href='mailto:devteam3gdsc@gmail.com'
                  className='text-[var(--text-title)] font-bold'
                >
                  devteam3gdsc@gmail.com
                </a>
                .
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Footer() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'about' | 'privacy' | 'terms' | null>(null);

  // Function to open modal with specific mode
  const openModal = (mode: 'about' | 'privacy' | 'terms') => {
    setModalMode(mode);
    setModalOpen(true);
  };

  return (
    <footer className="bg-Background/Bottom bg-[url('assets/particle.svg')] bg-no-repeat bg-center bg-cover text-white px-3 py-2 lg:px-10 mt-auto z-20 border-Primary/Dark border-solid box-border border-t-2 divide-y-2 divide-Primary/Dark">
      {/* Main Footer Section */}
      <div className='flex justify-between items-center mb-5'>
        {/* Logo and Name */}
        <div className='flex flex-col'>
          <div className='font-mono flex items-center py-4 text-3xl'>
            <img src={Logo} alt='CoDash Logo' className='logo w-10 h-auto pr-2' />
            Co
            <span className='text-[var(--green-highlight)]'>Dash</span>
          </div>
          <p className='text-l'>Contact with us:</p>
          <a href='mailto:devteam3gdsc@gmail.com' className='text-[var(--text-title)]'>
            devteam3gdsc@gmail.com
          </a>
        </div>

        {/* Links Section */}
        <div className='text-lg space-y-2 flex flex-col text-right'>
          <button onClick={() => openModal('about')}>
            <h4 className='text-2xl font-semibold text-Accent/Target'>About Us</h4>
          </button>
          <ul>
            <li>
              <button onClick={() => openModal('privacy')}>Privacy Policy</button>
            </li>
            <li>
              <button onClick={() => openModal('terms')}>Terms of Use</button>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className='mt-5'>
        <p className='text-md mt-2'>©2024 CoDash. All rights reserved</p>
      </div>

      {/* Render Modal */}
      {modalOpen && modalMode && <Modal mode={modalMode} onClose={() => setModalOpen(false)} />}
    </footer>
  );
}

export default Footer;

