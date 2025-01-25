import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  });
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('/Back/auth/login', {
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
        setError(data.message);
        return;
      }
      setLoading(false);
      setError(null);
      navigate('/'); // Redirect to dashboard or another page after successful login
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="bg-gray-50 rounded-lg shadow-lg p-8 w-full max-w-md mt-20 space-y-8">
        <div className='p-4 max-w-lg mx-auto'>
          <h1 className='text-3xl text-center font-semibold mb-12'>
            Log In
          </h1>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <input
              type="email"
              placeholder='email'
              className='border p-3 rounded-lg'
              id='email'
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

            <button
              disabled={loading || !formData.email || !formData.password}
              className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 mt-5'>
              {loading ? 'Loading..' : 'Log In'}
            </button>
          </form>
          <div>
            <p>
              Don't have an account?
            </p>
            <Link to={"/signup"}>
              <span className='text-blue-500 underline'>
                Sign Up
              </span>
            </Link>
          </div>
          {error && <p className='text-red-500'>{error}</p>}
        </div>
      </div>
    </div>
  );
}