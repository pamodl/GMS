import {useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginStart, loginSuccess, loginFailure } from '../redux/user/userSlice'

import {FaEye, FaEyeSlash} from 'react-icons/fa'

export default function LogIn() {
  const [formData, setFormData] = useState({})
  const {loading, error} = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatchEvent = useDispatch();
  const [passwordVisible, setPasswordVisible] = useState(false)

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatchEvent(loginStart());
      const res = await fetch('/Back/authen/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      console.log(data);
      if(data.success == false) {
        dispatchEvent(loginFailure(data.message));
        return;
      }
      dispatchEvent(loginSuccess(data));
      navigate('/home');
    }catch(err) {
      dispatchEvent(loginFailure(err.message));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="bg-gray-50 rounded-lg shadow-lg p-8 w-full max-w-md mt-20 space-y-8">
    <div className='p-4 max-w-lg mx-auto'>
       <h1 className='text-3xl text-center font-semibold my-4 mb-12'>
        Log In
       </h1>
       <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input 
        type="text" 
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
          Dont have an account already?
        </p>
        <Link to={"/signup"}>
        <span className='text-blue-500'>
          Sign Up
        </span>
        </Link>
       </div>
        {error && <p className='text-red-500'>{error}</p>}
    </div>
    </div>
    </div> 
  )
}
