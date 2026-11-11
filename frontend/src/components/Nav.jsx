import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { useTheme } from "../theme.jsx";

const link = ({ isActive }) =>
  `rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
    isActive
      ? "bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/20"
      : "text-slate-400 hover:bg-white/5 hover:text-white"
  }`;

export default function Nav() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const go = useNavigate();

  const handleSignOut = () => {
    signOut();
    go("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090D1A]/90 text-white shadow-lg shadow-black/10 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">

        {/* Logo */}
        <Link to="/" className="group mr-3 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-lg font-bold shadow-lg shadow-violet-500/20">
            C
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Career<span className="text-violet-400">lytics</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav
          className="flex flex-wrap items-center gap-1"
          aria-label="Main navigation"
        >
          <NavLink to="/jobs" className={link}>
            Jobs
          </NavLink>

          <NavLink to="/analytics" className={link}>
            Market
          </NavLink>

          {user && (
            <>
              <NavLink to="/dashboard" className={link}>
                Dashboard
              </NavLink>

              <NavLink to="/resume" className={link}>
                Resume
              </NavLink>

              <NavLink to="/recommendations" className={link}>
                Matches
              </NavLink>
            </>
          )}
        </nav>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? "🌙" : "☀️"}
            <span className="ml-1 hidden sm:inline">
              {theme === "light" ? "Dark" : "Light"}
            </span>
          </button>

          {user ? (
            <>
              <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 sm:flex">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-300">
                  {(user.full_name || user.email || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <span className="max-w-36 truncate text-sm text-slate-300">
                  {user.full_name || user.email}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Sign in
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
