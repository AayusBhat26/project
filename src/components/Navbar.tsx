'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaTasks,
  FaStickyNote,
  FaMoneyBillWave,
  FaCheckCircle,
  FaCloudSun,
  FaSignOutAlt,
  FaUser
} from 'react-icons/fa';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: FaTasks, label: 'Tasks' },
    { href: '/notes', icon: FaStickyNote, label: 'Notes' },
    { href: '/expenses', icon: FaMoneyBillWave, label: 'Expenses' },
    { href: '/habits', icon: FaCheckCircle, label: 'Habits' },
    { href: '/weather', icon: FaCloudSun, label: 'Weather' },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">PH</span>
            </div>
            <span className="text-xl font-bold text-gray-800 hidden sm:block">
              Productivity Hub
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {session?.user && (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <FaUser className="text-gray-600" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {session.user.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FaSignOutAlt />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-around items-center py-2 border-t border-gray-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-500'
                }`}
              >
                <Icon className="text-xl" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
