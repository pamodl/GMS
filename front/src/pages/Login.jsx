import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../redux/user/userSlice';

export default function Login() {
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  });
  const { loading, error} = useSelector((state) => state.user)
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      dispatch(loginStart());
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
        dispatch(loginFailure(data.message));
        return;
      }

      dispatch(loginSuccess(data));
      navigate('/');

    } catch (err) {
      dispatch(loginFailure(err.message));
    }
  }

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