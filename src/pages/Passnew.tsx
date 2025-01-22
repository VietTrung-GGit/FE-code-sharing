import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthUser } from '../context/AuthUserContext';
import Footer from '../components/footer';
import Header from '../components/header';
import { isStrongPassword } from '../utils/helpers';
import LoadingSpinner from '../components/loadingSpinner';

function PassNew() {
  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: '',
  });

  // State to display feedback messages
  const [loading, setLoading] = useState<boolean>(false); // Loading state

  // Handler to manage input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // **Client-Side Validation**

    if (!isStrongPassword(formData.password)) {
      toast.error(
        'Password must be at least 8 characters long, include a number and an uppercase letter.',
      );
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error('Passwords do not match!');
      return;
    }

    setLoading(true); // Start loading

    try {
      // Simulate API call to send reset email
      const response = await fetch('/api/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send password reset email.');
      }
      // Display success message
      toast.success(
        data.message || 'Password reset email sent successfully. Please check your inbox.',
      );
    } catch (error: any) {
      // Display error message
      toast.error(error.message || 'An error occurred while sending the reset email.');
    } finally {
      setLoading(false); // Stop loading
    }
  };
  return (
    <div className='bg-Background/Middle relative min-h-screen flex flex-col'>
      {/* Header */}
      <Header />

      {/* Body */}
      <main className='flex-grow relative'>
        {/* Negative Margin to Overlap with Header */}
        <div className='px-3 lg:px-10 pt-0 mt-[-4rem] flex justify-center'>
          <div className="bg-Background/Bottom bg-[url('assets/particle.svg')] bg-no-repeat bg-center bg-cover text-center w-full mt-0 p-10 relative border-Primary/Dark border-solid box-border border-2 rounded-b-3xl mb-28 sm:p-10 md:p-14 lg:p-16 xl:p-20">
            <form onSubmit={handleSubmit}>
              <h3 className='text-3xl text-white m-6 pt-10'>PASSWORD RESET</h3>
              <br />
              <p className='text-l text-white m-6 mx-2'>
                Welcome back username! Please enter and confirm your new password:
              </p>

              <input
                type='password'
                placeholder='Password'
                className='bg-inputbox-Sign rounded-3xl p-3 w-3/4 text-l m-6 md:w-2/3 lg:w-1/2 xl:w-1/3'
                name='password'
                value={formData.password}
                onChange={handleChange}
                autoComplete='new-password'
              />
              <br />
              <input
                type='password'
                placeholder='Password Confirm'
                className='bg-inputbox-Sign rounded-3xl p-3 w-3/4 text-l m-6 md:w-2/3 lg:w-1/2 xl:w-1/3'
                name='passwordConfirm'
                value={formData.passwordConfirm}
                onChange={handleChange}
              />
              <p className='text-l text-white m-6 mx-2'>
                Return to{' '}
                <Link to='/signin' className='font-bold'>
                  Sign in?
                </Link>
              </p>
              {loading ? (
                <LoadingSpinner /> // Show loading spinner when submitting
              ) : (
                <button className='transition-colors duration-300 ease-in-out w-32 h-10 rounded-xl bg-Accent/Target text-xl text-white m-6 hover:bg-white hover:text-Accent/Target'>
                  Submit
                </button>
              )}
            </form>
          </div>
        </div>
      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default PassNew;

