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
    <>
      {/* Pure Dark Background Styles */}
      <style jsx>{`
        .bg-glow {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #000000;
          z-index: 0;
          pointer-events: none;
        }
        .text-gradient {
          background: linear-gradient(to bottom, #fff, #ccc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        html, body {
          background: #000000 !important;
          margin: 0;
          padding: 0;
          height: 100%;
          overflow-x: hidden;
        }
        @media (max-width: 640px) {
          nav {
            top: 15px;
            left: 15px;
          }
          nav .logo-small {
            width: clamp(36px, 10vw, 44px);
            height: clamp(36px, 10vw, 44px);
            font-size: clamp(14px, 4vw, 18px);
          }
          nav span {
            font-size: clamp(14px, 4vw, 18px);
          }
        }
        @media (max-width: 480px) {
          .accent-spot {
            width: 180px;
            height: 180px;
            top: 8%;
            right: 2%;
          }
        }
      `}</style>

      {/* Pure Black Background Layer */}
      <div className="bg-glow" />

      {/* Top Left Branding - Full Name Always Visible */}
      <nav className="fixed top-10 left-10 flex items-center gap-3 opacity-80 z-20 flex">
        <div className="logo-small w-11 h-11 bg-[#1a1a1a] border border-white/20 rounded-lg flex items-center justify-center text-[#4a90e2] font-extrabold text-lg flex-shrink-0">
          SB
        </div>
        <span className="text-white font-semibold text-xl tracking-tight">
          Smart Bookmarks
        </span>
      </nav>

      {/* Main Content Centering */}
      <div className="fixed inset-0 flex flex-col items-center justify-center z-10 px-4 sm:px-6 lg:px-0 py-8 sm:py-0 min-h-screen">
        {/* The Glass Card */}
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-[440px]">
          <div className="bg-black/[0.8] backdrop-blur-[30px] border-4 border-white/30 rounded-[40px] p-6 sm:p-10 md:p-14 text-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.98)] font-['Plus_Jakarta_Sans',_sans-serif]">
            
            {/* Logo Container */}
            <div className="mb-6 sm:mb-8 inline-block">
              <div className="w-20 h-20 bg-[#1a1a1a] border-2 border-[#4a90e2]/60 rounded-[24px] flex items-center justify-center text-[#4a90e2] font-extrabold text-3xl shadow-[0_0_20px_rgba(189,245,148,0.3)] mx-auto">
                SB
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 tracking-tight text-gradient leading-tight">
              Organize your web.
            </h1>
            
            <p className="text-[#94a3b8] text-sm sm:text-base leading-relaxed mb-8 sm:mb-10 px-2 sm:px-0">
              A central home for your most important links. Fast, secure, and synced everywhere.
            </p>

            <div className="space-y-4 sm:space-y-6 w-full max-w-[360px] mx-auto">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-white hover:bg-neutral-100 text-black rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.3)] active:scale-[0.98] disabled:opacity-60 h-[52px] sm:h-auto cursor-pointer disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC04"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="whitespace-nowrap">{loading ? 'Signing in...' : 'Continue with Google'}</span>
              </button>

              <div className="flex justify-center gap-4 text-[12px] sm:text-[13px] text-[#888] pt-2">
                <a href="#" className="text-[#94a3b8] hover:text-[#bdf594] transition-colors border-b border-transparent hover:border-[#bdf594] text-sm sm:text-[13px] py-1">Terms of Service</a>
                <span className="select-none">&bull;</span>
                <a href="#" className="text-[#94a3b8] hover:text-[#bdf594] transition-colors border-b border-transparent hover:border-[#bdf594] text-sm sm:text-[13px] py-1">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
