import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

export default function SignUp() {
  const [formData, setFormData] = React.useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    studentRegNumber: '' // Add this line
  });
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [passwordConfirmVisible, setPasswordConfirmVisible] = React.useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const togglePasswordConfirmVisibility = () => {
    setPasswordConfirmVisible(!passwordConfirmVisible);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === 'email') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        setError('Invalid email address');
        return;
      } else {
        setError(null);
      }
    }
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/Back/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Something went wrong');
      }

      const data = await res.json();
      console.log(data);
      if (data.success === false) {
        setLoading(false);
        if (data.message.includes('E11000 duplicate key error collection')) {
          setError('User already exists');
        } else {
          setError(data.message);
        }
        return;
      }
      setLoading(false);
      setError(null);
      navigate('/login');
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="bg-gray-50 rounded-lg shadow-lg p-8 w-full max-w-md mt-20 space-y-8">
        <div className='p-4 max-w-lg mx-auto'>
          <h1 className='text-3xl text-center font-semibold  mb-12'>
            Sign Up
          </h1>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <input
              type="text"
              placeholder='username'
              className='border p-3 rounded-lg'
              id='username'
              onChange={handleChange} />

            <input
              type="email"
              placeholder='email'
              className='border p-3 rounded-lg'
              id='email'
              onChange={handleChange} />

            <input
              type="text"
              placeholder='student registration number' // Add this input field
              className='border p-3 rounded-lg'
              id='studentRegNumber'
              onChange={handleChange} />

            <div className='relative'>
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder='password'
                className='border p-3 rounded-lg w-full'
                id='password'
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-3"
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className='relative'>
              <input
                type={passwordConfirmVisible ? "text" : "password"}
                placeholder='confirm password'
                className='border p-3 rounded-lg w-full'
                id='passwordConfirm'
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={togglePasswordConfirmVisibility}
                className="absolute right-3 top-3"
              >
                {passwordConfirmVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              disabled={loading || !formData.username || !formData.email || !formData.password || !formData.passwordConfirm || !formData.studentRegNumber} // Add studentRegNumber to the condition
              className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 mt-5'>
              {loading ? 'Loading..' : 'Sign Up'}
            </button>
          </form>
          <div>
            <p>
              Have an account already?
            </p>
            <Link to={"/login"}>
              <span className='text-blue-500 underline'>
                Log in
              </span>
            </Link>
          </div>
          {error && <p className='text-red-500'>{error}</p>}
        </div>
      </div>
    </div>
  )
}