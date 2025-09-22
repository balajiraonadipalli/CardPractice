import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Eye, EyeOff, Loader, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { registerSchema } from '../utils/validation';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(registerSchema)
  });

  const password = watch('password');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');

    try {
      const { confirmPassword, ...registerData } = data;
      const result = await registerUser(registerData);
      
      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setApiError(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    
    if (strength < 2) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength < 4) return { strength, label: 'Fair', color: 'bg-yellow-500' };
    if (strength < 5) return { strength, label: 'Good', color: 'bg-purple-500' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-colorful p-8 border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">🎆 Create Account</h1>
          <p className="text-gray-600">Join us and start exploring amazing destinations ✨</p>
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-pink">
            ⚠️ {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-purple-300 bg-gray-50/50'
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

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
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-purple-600 transition-colors duration-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Password strength:</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength.strength < 2 ? 'text-red-600' :
                    passwordStrength.strength < 4 ? 'text-yellow-600' :
                    passwordStrength.strength < 5 ? 'text-purple-600' : 'text-green-600'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
                  errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-purple-300 bg-gray-50/50'
                }`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-purple-600 transition-colors duration-300"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              I agree to the{' '}
              <Link to="/terms" className="text-purple-600 hover:text-purple-500 transition-colors duration-300">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-pink-600 hover:text-pink-500 transition-colors duration-300">
                Privacy Policy
              </Link>
            </label>
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
                Creating Account...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2" size={20} />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 hover:text-purple-500 font-medium transition-colors duration-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
