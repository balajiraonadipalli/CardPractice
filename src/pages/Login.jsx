import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../utils/validation';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(loginSchema)
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');

    try {
      const result = await login(data);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setApiError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-colorful p-8 border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">🎉 Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account and continue your journey</p>
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-pink">
            ⚠️ {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
              errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-purple-300 bg-gray-50/50'
            }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
                  errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-purple-300 bg-gray-50/50'
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-purple-600 transition-colors duration-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-purple-600 hover:text-purple-500 transition-colors duration-300"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-bg-primary text-white py-3 px-6 rounded-xl hover:shadow-colorful focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center font-medium hover-scale"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin mr-2" size={20} />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-600 hover:text-purple-500 font-medium transition-colors duration-300">
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
          <p className="text-sm text-purple-700 mb-3 font-semibold">🚀 Demo Credentials:</p>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong className="text-purple-600">Admin:</strong> admin@example.com / admin123456</p>
            <p><strong className="text-pink-600">User:</strong> user@example.com / user123456</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
