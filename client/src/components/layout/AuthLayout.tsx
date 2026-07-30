import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Hero Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-primary/90 via-primary to-primary/80 text-primary-foreground relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-black/10 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 font-bold text-2xl relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <span>AI FullStack Platform</span>
        </div>

        <div className="space-y-6 relative z-10 max-w-lg">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Production-Ready AI Architecture & Tooling
          </h1>
          <p className="text-primary-foreground/80 text-base leading-relaxed">
            Engineered with React 19, Express, TypeScript, Gemini AI, Supabase, and Apify for maximum performance and maintainability.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm font-medium bg-white/10 rounded-xl p-3 backdrop-blur-xs">
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Gemini 2.5 Integration</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium bg-white/10 rounded-xl p-3 backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>JWT & Zod Security</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-primary-foreground/60 relative z-10">
          © {new Date().getFullYear()} AI Platform Architecture. All rights reserved.
        </p>
      </div>

      {/* Right Content Panel */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 relative">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md mx-auto my-auto">
          <Outlet />
        </div>

        <div className="text-center text-xs text-muted-foreground pt-6">
          Scalable Feature-Based Architecture
        </div>
      </div>
    </div>
  );
};
