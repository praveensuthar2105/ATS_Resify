import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleTryAgain = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReturnHome = () => {
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errorMessage =
        this.state.error?.message ||
        'An unexpected error has occurred.';

      return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-6 py-16 bg-slate-50 font-['DM_Sans',_'Inter',_sans-serif]">
          {/* Ambient background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] right-[-8%] w-[480px] h-[480px] rounded-full bg-rose-300/15 blur-[120px]" />
            <div className="absolute bottom-[-15%] left-[-10%] w-[520px] h-[520px] rounded-full bg-teal-300/15 blur-[140px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-200/10 blur-[160px]" />
          </div>

          <div className="relative z-10 w-full max-w-lg">
            <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-slate-200/60 rounded-[2rem] p-8 md:p-10 text-center">
              {/* Icon badge */}
              <div className="mx-auto mb-6 w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[40px] text-rose-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                  error
                </span>
              </div>

              <span className="inline-block text-[11px] font-bold tracking-widest text-rose-600 uppercase bg-rose-50 px-3 py-1.5 rounded-full mb-4 border border-rose-100">
                Something went wrong
              </span>

              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3 font-['Space_Grotesk',_sans-serif]">
                Oops — we hit a snag
              </h1>

              <p className="text-slate-500 text-[15px] leading-relaxed mb-6 max-w-md mx-auto">
                An unexpected error interrupted this page. You can try again, reload,
                or head back home. If it keeps happening, please contact support.
              </p>

              {/* Error detail chip */}
              <div className="mb-8 mx-auto max-w-sm rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Error details
                </p>
                <p className="text-xs text-slate-600 font-mono break-words leading-relaxed line-clamp-3">
                  {errorMessage}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={this.handleTryAgain}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50/50 transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  Try again
                </button>
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                  Reload page
                </button>
                <button
                  type="button"
                  onClick={this.handleReturnHome}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[18px]">home</span>
                  Back to home
                </button>
              </div>

              <p className="mt-8 text-xs text-slate-400">
                Need help?{' '}
                <a
                  href="mailto:praveensuthar1863@gmail.com"
                  className="text-teal-600 font-semibold hover:text-teal-700 underline underline-offset-2"
                >
                  Contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
