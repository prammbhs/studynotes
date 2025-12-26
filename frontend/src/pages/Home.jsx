import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AppToast } from '../components/ui/Toast.jsx';
import { Tooltip } from '../components/ui/Tooltip.jsx';
import { Dialog } from '../components/ui/Dialog.jsx';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [toastOpen, setToastOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="w-full bg-white dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-900 dark:to-gray-950 transition-colors duration-300 min-h-screen overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-green-400 via-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center justify-center px-4 py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/50 to-purple-50/50 dark:via-blue-950/20 dark:to-purple-950/20"></div>
        
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20">
          <div className="absolute inset-0 bg-grid-pattern"></div>
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto text-center space-y-8 animate-fadeIn">
          {/* Floating Badge */}
          <div className="inline-block">
            <div className="px-6 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-400/20 dark:to-purple-400/20 border border-blue-400/50 dark:border-blue-300/30 rounded-full backdrop-blur-sm text-blue-600 dark:text-blue-300 font-semibold text-sm animate-pulse">
              ✨ AI-Powered Learning Made Easy
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <h1 className="text-7xl md:text-8xl lg:text-9xl font-black leading-none">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-pulse">
                  📚 StudyNotes
                </span>
              </h1>
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-20 blur-2xl -z-10 animate-pulse"></div>
            </div>
            <h2 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300 bg-clip-text text-transparent leading-tight">
              AI-Powered Study Material Generator
            </h2>
          </div>
          
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto leading-relaxed font-medium backdrop-blur-sm bg-white/30 dark:bg-white/5 p-6 rounded-2xl border border-white/50 dark:border-white/10">
            Upload your materials, extract key subtopics, and generate beautiful, organized notes — all powered by AI. Learn faster with clear, structured study guides.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            {isAuthenticated ? (
              <a
                href="/dashboard"
                className="group px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 inline-block shadow-2xl hover:shadow-blue-500/50 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2">
                  🚀 Go to Dashboard
                </span>
              </a>
            ) : (
              <>
                <button
                  onClick={() => { setDialogOpen(true); setToastOpen(true); }}
                  className="group px-14 py-5 text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 inline-block shadow-2xl hover:shadow-purple-500/50 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center gap-2">
                    ⚡ Get Started Free
                  </span>
                </button>
                <a
                  href="/login"
                  className="group px-10 py-4 border-2 border-blue-500 dark:border-purple-400 text-blue-600 dark:text-purple-300 hover:text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 inline-block relative overflow-hidden bg-white/50 dark:bg-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600"
                >
                  <Tooltip content="Welcome back! Sign in to continue">
                    <span className="relative flex items-center gap-2">
                      🔑 Sign In
                    </span>
                  </Tooltip>
                </a>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-12">
            <div className="text-center p-4 bg-white/40 dark:bg-white/5 rounded-xl backdrop-blur-sm border border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">10K+</div>
              <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">Students</div>
            </div>
            <div className="text-center p-4 bg-white/40 dark:bg-white/5 rounded-xl backdrop-blur-sm border border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">50M+</div>
              <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">Notes Generated</div>
            </div>
            <div className="text-center p-4 bg-white/40 dark:bg-white/5 rounded-xl backdrop-blur-sm border border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text">99.9%</div>
              <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative min-h-[100svh] flex items-center px-4 py-16 md:py-20 bg-gradient-to-b from-white via-blue-50 to-purple-50 dark:from-gray-950 dark:via-slate-900/50 dark:to-gray-950 transition-colors duration-300 overflow-hidden">
        <div className="absolute inset-0 opacity-30 dark:opacity-20">
          <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="w-full max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-14 animate-fadeIn">
            <h2 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-6">
              Powerful Features
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 font-medium">Everything you need to ace your studies with AI-powered learning</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 animate-stagger justify-items-stretch">
            {[
              {
                icon: '📤',
                title: 'Easy Upload',
                desc: 'Upload your study materials in various formats (PDF, DOCX, Images)',
                gradient: 'from-blue-500 via-cyan-500 to-teal-500'
              },
              {
                icon: '✨',
                title: 'AI Extraction',
                desc: 'Automatically extract key subtopics using advanced AI technology',
                gradient: 'from-purple-500 via-pink-500 to-rose-500'
              },
              {
                icon: '📝',
                title: 'Generate Notes',
                desc: 'Create comprehensive, well-organized notes for each subtopic',
                gradient: 'from-green-500 via-emerald-500 to-teal-500'
              },
              {
                icon: '🔍',
                title: 'Compare Methods',
                desc: 'Compare pattern-based and AI-powered extraction results',
                gradient: 'from-orange-500 via-red-500 to-pink-500'
              },
              {
                icon: '💾',
                title: 'Save & Download',
                desc: 'Store all your documents and download them whenever needed',
                gradient: 'from-indigo-500 via-blue-500 to-cyan-500'
              },
              {
                icon: '🔐',
                title: 'Secure & Private',
                desc: 'Your data is encrypted and securely stored on our servers',
                gradient: 'from-yellow-500 via-orange-500 to-amber-500'
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative p-8 rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-110 hover:-translate-y-3 cursor-pointer"
              >
                {/* Gradient border background */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                {/* Main content container */}
                <div className="relative bg-white dark:bg-gray-900 rounded-xl p-8 h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10 space-y-4">
                    <div className="text-6xl transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                      {feature.icon}
                    </div>
                    <h3 className={`text-2xl font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                      {feature.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                      {feature.desc}
                    </p>
                    <div className={`h-1 w-12 bg-gradient-to-r ${feature.gradient} rounded-full group-hover:w-full transition-all duration-500`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative min-h-[100svh] flex items-center px-4 py-16 md:py-20 bg-gradient-to-b from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 transition-colors duration-300 overflow-hidden">
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <div className="absolute top-1/3 -right-32 w-96 h-96 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-1/3 -left-32 w-96 h-96 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="w-full max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-14 animate-fadeIn">
            <h2 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 dark:from-purple-400 dark:via-pink-400 dark:to-red-400 bg-clip-text text-transparent mb-6">
              How It Works
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 font-medium">Four simple steps to transform your learning</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-4 justify-items-stretch">
            {[
              { num: '1', title: 'Upload', desc: 'Upload your study material', icon: '📤', colors: 'from-blue-600 to-cyan-600' },
              { num: '2', title: 'Extract', desc: 'AI extracts key subtopics', icon: '✨', colors: 'from-purple-600 to-pink-600' },
              { num: '3', title: 'Generate', desc: 'Create comprehensive notes', icon: '📝', colors: 'from-pink-600 to-rose-600' },
              { num: '4', title: 'Learn', desc: 'Study your organized notes', icon: '🎓', colors: 'from-green-600 to-emerald-600' },
            ].map((step, idx) => (
              <div key={idx} className="relative group">
                {/* Arrow connector for desktop */}
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/3 -right-3 z-20">
                    <div className="text-4xl text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text transform group-hover:scale-150 transition-transform duration-300">
                      →
                    </div>
                  </div>
                )}

                <div className="relative">
                  <div className="relative p-8 rounded-2xl bg-white dark:bg-gray-900 border-2 border-transparent group-hover:border-blue-500 transition-all duration-300 h-full transform group-hover:scale-105 group-hover:-translate-y-2">
                    
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl bg-gradient-to-br ${step.colors}`}></div>
                    
                    {/* Content */}
                    <div className="relative z-10 space-y-4 text-center">
                      {/* Step circle */}
                      <div className="flex justify-center">
                        <div className={`relative`}>
                          <div className={`absolute inset-0 bg-gradient-to-r ${step.colors} rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-300`}></div>
                          <div className={`relative w-28 h-28 bg-gradient-to-r ${step.colors} text-white rounded-full flex flex-col items-center justify-center text-4xl font-black shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                            <div className="text-2xl">{step.icon}</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className={`text-2xl font-black bg-gradient-to-r ${step.colors} bg-clip-text text-transparent group-hover:text-white transition-all duration-300`}>
                          {step.title}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 group-hover:text-white transition-all duration-300 font-medium mt-2">
                          {step.desc}
                        </p>
                      </div>

                      {/* Bottom accent */}
                      <div className={`h-1 w-8 bg-gradient-to-r ${step.colors} rounded-full mx-auto group-hover:w-full transition-all duration-500`}></div>
                    </div>
                  </div>
                </div>

                {/* Arrow connector for mobile */}
                {idx < 3 && (
                  <div className="lg:hidden text-center text-4xl text-gradient-to-b from-purple-600 to-pink-600 my-2">
                    ↓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative min-h-[100svh] flex items-center justify-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-900/80 dark:via-purple-900/80 dark:to-pink-900/80 text-white px-4 py-16 md:py-20 transition-colors duration-300 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 text-8xl opacity-20 animate-float">✨</div>
          <div className="absolute bottom-10 left-10 text-8xl opacity-20 animate-float" style={{ animationDelay: '2s' }}>🚀</div>
          <div className="absolute top-1/2 right-20 text-8xl opacity-20 animate-float" style={{ animationDelay: '4s' }}>💡</div>
        </div>
        
        <div className="relative z-10 w-full max-w-4xl mx-auto text-center space-y-10 animate-fadeIn">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-black leading-tight">
              Ready to Transform Your
              <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent"> Study Experience?</span>
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-yellow-200 to-pink-200 rounded-full mx-auto"></div>
          </div>

          <p className="text-xl md:text-2xl text-blue-50 leading-relaxed font-medium backdrop-blur-sm bg-white/10 p-8 rounded-2xl border border-white/30">
            Start using StudyNotes today and unlock the power of AI-powered learning. Join thousands of students who are already transforming their study habits.
          </p>

          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <a
                href="/register"
                className="group inline-flex items-center gap-2 px-12 py-4 bg-white text-blue-600 hover:bg-yellow-100 font-bold rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-2xl hover:shadow-white/50 text-lg"
              >
                <span>⚡ Create Free Account</span>
                <span className="transform group-hover:translate-x-2 transition-transform duration-300">→</span>
              </a>
              <a
                href="/login"
                className="group inline-flex items-center gap-2 px-12 py-4 border-2 border-white text-white hover:bg-white/20 font-bold rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 backdrop-blur-sm text-lg"
              >
                <span>🔑 Sign In</span>
                <span className="transform group-hover:translate-x-2 transition-transform duration-300">→</span>
              </a>
            </div>
          )}

          {/* Trust indicators */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-12">
            <div className="text-center p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
              <div className="text-2xl">🛡️</div>
              <div className="text-sm font-semibold mt-2">100% Secure</div>
            </div>
            <div className="text-center p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
              <div className="text-2xl">⚡</div>
              <div className="text-sm font-semibold mt-2">Lightning Fast</div>
            </div>
            <div className="text-center p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
              <div className="text-2xl">🎯</div>
              <div className="text-sm font-semibold mt-2">AI-Powered</div>
            </div>
          </div>
        </div>
      </section>
      {/* Radix Dialog preview */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title="Create your free account">
        <p className="leading-relaxed">You'll be redirected to our register page to create a free account. No credit card required.</p>
        <div className="mt-6 flex gap-3">
          <a href="/register" className="px-5 py-3 rounded-xl text-white font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105">Continue</a>
          <button onClick={() => setDialogOpen(false)} className="px-5 py-3 rounded-xl font-bold border-2 border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Cancel</button>
        </div>
      </Dialog>
      {/* Toast confirmation */}
      <AppToast open={toastOpen} onOpenChange={setToastOpen} title="Let’s get started!" description="Creating a free account takes less than a minute." variant="blue" />
    </div>
  );
};

export default Home;
