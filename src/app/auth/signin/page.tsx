'use client';

import { signIn } from 'next-auth/react';
import { FaGoogle } from 'react-icons/fa';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-3xl">PH</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Sign in to access your productivity hub
          </p>

          {/* Google Sign In Button */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-primary-500 transition-all shadow-sm hover:shadow-md"
          >
            <FaGoogle className="text-2xl text-red-500" />
            <span>Sign in with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Features</span>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="text-green-500 text-lg">✓</span>
              <span>Secure authentication with Google</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500 text-lg">✓</span>
              <span>Automatic data sync across devices</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500 text-lg">✓</span>
              <span>Works offline with local storage</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500 text-lg">✓</span>
              <span>Free forever, no credit card required</span>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Privacy Notice */}
        <p className="text-center text-gray-600 text-xs mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
          Your data is encrypted and secure.
        </p>
      </div>
    </div>
  );
}
