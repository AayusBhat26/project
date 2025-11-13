'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import {
  FaTasks,
  FaStickyNote,
  FaMoneyBillWave,
  FaCheckCircle,
  FaCloudSun,
  FaMobile,
  FaLock,
  FaSync
} from 'react-icons/fa';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-white font-bold text-4xl">PH</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Productivity Hub
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your all-in-one productivity companion. Manage tasks, notes, expenses, habits, and check weather - all in one powerful Progressive Web App.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-primary-700 transition-all transform hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: FaTasks,
              title: 'Task Management',
              description: 'Organize your tasks with priorities, due dates, and categories.',
              color: 'from-blue-500 to-blue-600'
            },
            {
              icon: FaStickyNote,
              title: 'Smart Notes',
              description: 'Capture ideas with rich text notes, categories, and pinning.',
              color: 'from-yellow-500 to-yellow-600'
            },
            {
              icon: FaMoneyBillWave,
              title: 'Expense Tracking',
              description: 'Monitor your finances with detailed expense and income tracking.',
              color: 'from-green-500 to-green-600'
            },
            {
              icon: FaCheckCircle,
              title: 'Habit Tracking',
              description: 'Build better habits with daily tracking and streak monitoring.',
              color: 'from-purple-500 to-purple-600'
            },
            {
              icon: FaCloudSun,
              title: 'Weather Dashboard',
              description: 'Stay informed with real-time weather updates for your location.',
              color: 'from-cyan-500 to-cyan-600'
            },
            {
              icon: FaMobile,
              title: 'Progressive Web App',
              description: 'Install on any device and use it like a native app.',
              color: 'from-pink-500 to-pink-600'
            },
          ].map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* PWA Features */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Works Everywhere, Even Offline
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FaLock,
                title: 'Offline First',
                description: 'Keep working even without internet. Your data syncs automatically when you\'re back online.'
              },
              {
                icon: FaSync,
                title: 'Auto Sync',
                description: 'Seamless synchronization across all your devices. Your data is always up to date.'
              },
              {
                icon: FaMobile,
                title: 'Install Anywhere',
                description: 'Install on your phone, tablet, or desktop. Works on iOS, Android, and all modern browsers.'
              },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <feature.icon className="text-primary-600 text-2xl" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-12 text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Boost Your Productivity?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who are already managing their life better.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            Sign In with Google
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 Productivity Hub. Built with Next.js, Prisma, and MongoDB.
          </p>
        </div>
      </footer>
    </div>
  );
}
