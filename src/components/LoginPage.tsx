/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * LoginPage — Premium authentication UI with quick-login demo buttons.
 * Matches the OurHome design system (emerald/teal gradients, glassmorphism).
 */

import React, { useState } from 'react';
import { Building2, Mail, Lock, Sparkles, User, ShieldAlert, Layers, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: {
    id: string;
    email: string;
    name: string;
    role: 'customer' | 'builder' | 'admin';
    avatar: string;
  }) => void;
}

const DEMO_ACCOUNTS = [
  {
    email: 'customer@ourhome.com',
    label: 'Customer',
    description: 'Browse listings, book visits, submit inquiries',
    icon: User,
    gradient: 'from-sky-500 to-blue-600',
    bgLight: 'bg-sky-50',
    borderLight: 'border-sky-200',
    textColor: 'text-sky-700',
  },
  {
    email: 'builder@ourhome.com',
    label: 'Builder',
    description: 'Post properties, manage listings, chat with clients',
    icon: Layers,
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-200',
    textColor: 'text-emerald-700',
  },
  {
    email: 'admin@ourhome.com',
    label: 'Admin',
    description: 'Approve/reject listings, resolve support tickets',
    icon: ShieldAlert,
    gradient: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50',
    borderLight: 'border-rose-200',
    textColor: 'text-rose-700',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState<string | null>(null);

  const handleLogin = async (loginEmail: string, loginPassword: string) => {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('Network error. Unable to connect to server.');
    } finally {
      setIsLoading(false);
      setLoadingAccount(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    handleLogin(email, password);
  };

  const handleQuickLogin = (demoEmail: string) => {
    setLoadingAccount(demoEmail);
    setEmail(demoEmail);
    setPassword('ourhome123');
    handleLogin(demoEmail, 'ourhome123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f2fe] via-white to-[#e8fbf1] flex flex-col items-center justify-center p-4 sm:p-6">
      
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-200/30 to-sky-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-teal-200/30 to-emerald-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        
        {/* Logo Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-100">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-2xl tracking-tight text-slate-900 leading-none">
                Our<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-600">Home</span>
                <span className="inline-block w-2 h-2 bg-sky-500 rounded-full animate-pulse ml-0.5 align-super" />
              </span>
              <span className="text-[9px] font-mono tracking-widest text-emerald-600 font-extrabold uppercase mt-0.5">
                Hyderabad Portal
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Sign in to access your real estate dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/40 p-6 space-y-5">
          
          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 animate-fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ourhome.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all pr-10"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md shadow-emerald-500/15 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && !loadingAccount ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Sign In Securely
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Quick Demo Login</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Quick Login Buttons */}
          <div className="space-y-2.5">
            {DEMO_ACCOUNTS.map((account) => {
              const Icon = account.icon;
              const isLoadingThis = loadingAccount === account.email;
              return (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleQuickLogin(account.email)}
                  disabled={isLoading}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border ${account.borderLight} ${account.bgLight} hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed group text-left`}
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${account.gradient} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0`}>
                    {isLoadingThis ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${account.textColor}`}>
                      Login as {account.label}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {account.description}
                    </p>
                  </div>
                  <span className="text-[8px] font-mono font-bold bg-white/80 border border-slate-200/60 text-slate-500 px-1.5 py-0.5 rounded-md shrink-0">
                    DEMO
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Hint */}
        <p className="text-center text-[10px] text-slate-400 font-mono">
          Demo password for all accounts: <span className="font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">ourhome123</span>
        </p>
      </div>
    </div>
  );
};
