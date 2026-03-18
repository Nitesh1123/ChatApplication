import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MailIcon, LoaderIcon, LockIcon, UserIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Link } from "react-router";

function SignUpPage() {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { signup, isSigningUp } = useAuthStore();
  const getPasswordStrength = (password) => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: "Weak", color: "#ed4245", bars: 1 };
    if (score === 2) return { label: "Fair", color: "#faa61a", bars: 2 };
    if (score === 3) return { label: "Good", color: "#3ba55d", bars: 3 };
    return { label: "Strong", color: "#23a55a", bars: 4 };
  };
  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  };

  return (
    <div className="min-h-screen w-full flex bg-dark-base animate-fadeIn">
      {/* LEFT SIDE - Branding & Illustration (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#1a1b1e] to-[#2b2d31] items-center justify-center p-12">
        {/* Animated floating bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-16 h-16 rounded-full bg-brand/10 animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute top-40 right-32 w-24 h-24 rounded-full bg-brand/5 animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-32 left-40 w-20 h-20 rounded-2xl bg-[#2b2d31] rotate-45 animate-bounce" style={{ animationDuration: '5s' }} />
          <div className="absolute bottom-20 right-20 w-12 h-12 rounded-full bg-brand/20 animate-pulse" style={{ animationDuration: '3.5s' }} />
          <div className="absolute top-60 left-1/3 w-8 h-8 rounded-full bg-[#3f4147] animate-bounce" style={{ animationDuration: '2.5s' }} />
        </div>

        <div className="relative z-10 text-center max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-14 h-14 text-brand"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.155-4.155a4.36 4.36 0 001.015-.465 5.118 5.118 0 003.825-3.825c.243-1.584 1.637-2.707 3.227-2.707h.001"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-4xl font-bold text-white">Chatify</span>
          </div>

          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Join the conversation
          </h1>
          <p className="text-lg text-muted">
            Create an account and start chatting with friends, family, and colleagues in seconds.
          </p>

          {/* Feature badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 rounded-full bg-surface border border-border text-sm text-text-secondary">
              Free Forever
            </span>
            <span className="px-4 py-2 rounded-full bg-surface border border-border text-sm text-text-secondary">
              End-to-End Encryption
            </span>
            <span className="px-4 py-2 rounded-full bg-surface border border-border text-sm text-text-secondary">
              Cross-Platform
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md animate-fadeIn">
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-10 h-10 text-brand"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.155-4.155a4.36 4.36 0 001.015-.465 5.118 5.118 0 003.825-3.825c.243-1.584 1.637-2.707 3.227-2.707h.001"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-2xl font-bold text-white">Chatify</span>
          </div>

          {/* Form Card */}
          <div className="bg-surface rounded-2xl border border-border p-6 md:p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-text-primary mb-2">Create Account</h2>
              <p className="text-muted">Sign up to start chatting</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* FULL NAME */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-[#1e1f22] border border-border rounded-lg py-3 pl-11 pr-4 text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              {/* EMAIL INPUT */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email
                </label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#1e1f22] border border-border rounded-lg py-3 pl-11 pr-4 text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD INPUT */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Password
                </label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-[#1e1f22] border border-border rounded-lg py-3 pl-11 pr-12 text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text-secondary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.password.length > 0 && passwordStrength && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex w-full gap-1">
                        {[0, 1, 2, 3].map((barIndex) => (
                          <div
                            key={barIndex}
                            className="h-1 w-full rounded-full transition-colors duration-300"
                            style={{
                              backgroundColor:
                                barIndex < passwordStrength.bars
                                  ? passwordStrength.color
                                  : "#3f4147",
                            }}
                          />
                        ))}
                      </div>
                      <span
                        className="text-xs font-medium"
                        style={{ color: passwordStrength.color }}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    {(passwordStrength.label === "Weak" ||
                      passwordStrength.label === "Fair") && (
                      <p className="text-xs text-[#949ba4]">
                        Use 8+ characters, uppercase, numbers & symbols for a strong password
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isSigningUp}
                className="w-full bg-brand hover:bg-[#4752c4] text-white font-semibold rounded-lg py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSigningUp ? (
                  <LoaderIcon className="w-5 h-5 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-brand hover:text-[#4752c4] font-medium transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
