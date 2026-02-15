"use client";

import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { signInWithGoogle, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full dark:bg-neutral-950">
      <div className="w-full max-w-sm h-fit">
        <div className="flex justify-center mb-4 sm:mb-6 p-6 sm:p-10 bg-lime-100 dark:bg-lime-200 rounded-2xl sm:rounded-3xl shadow-md">
        <img src="/logo.svg" alt="Smart Bookmarks" className="h-20 w-20 sm:h-28 sm:w-28" />
        </div>



        <div className="bg-white dark:bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 backdrop-blur-sm border border-white dark:border-gray-800/20">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-black mb-2">Smart Bookmarks</h1>
        <p className="text-sm sm:text-base text-center text-black mb-8">Save, organize and sync links across your devices. Sign in with Google to access your private bookmarks.</p>

        <div className="space-y-4">
            <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-4 bg-white/80 dark:bg-white/20 hover:bg-white/90 dark:hover:bg-white/30 text-black border border-gray-200/50 dark:border-gray-400/50 rounded-full font-semibold text-sm sm:text-base cursor-pointer transition-all duration-300 hover:shadow-xl shadow-lg active:scale-95 disabled:opacity-60 backdrop-blur-sm"
            >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC04"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-semibold">{loading ? 'Signing in...' : 'Sign in with Google'}</span>
            </button>

            <div className="text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400 mt-4 sm:mt-6">
            By signing in you agree to our <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Terms</a> and <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">Privacy Policy</a>.
            </div>
        </div>
        </div>
      </div>
    </div>
  );
}
