import { useState } from "react";
import {
  Eye,
  EyeOff,
  Waves,
  Ship,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-[#f5f8fa] flex items-center justify-center p-4 sm:p-8">

      <div className="w-full max-w-[1100px] min-h-[650px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(8,47,73,0.10)] overflow-hidden flex">

        {/* LEFT BRAND PANEL */}
        <div className="hidden md:flex md:w-[46%] bg-[#073b5c] relative overflow-hidden items-center justify-center">

          {/* Background decoration */}
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#0b6b91]/30 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#16a9d6]/20 blur-3xl" />

          <div className="relative z-10 px-12 text-center text-white">

            <div className="flex justify-center mb-7">
              <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Waves
                  size={45}
                  strokeWidth={1.5}
                  className="text-cyan-300"
                />
              </div>
            </div>

            <h1 className="font-['Plus_Jakarta_Sans'] text-4xl font-bold tracking-[0.12em]">
              SAGARDRISHTI
            </h1>

            <p className="mt-4 text-cyan-100 text-lg font-medium">
              Smarter Oceans. Safer Tomorrow.
            </p>

            <div className="mt-14 flex items-center justify-center gap-3 text-white/70">
              <Ship size={18} />
              <span className="text-sm">
                Maritime Intelligence Platform
              </span>
            </div>

            <p className="mt-5 text-sm leading-7 text-white/55 max-w-sm mx-auto">
              AI-powered oil spill detection, tracking and
              vessel attribution for a cleaner ocean.
            </p>

          </div>
        </div>


        {/* RIGHT FORM */}
        <div className="w-full md:w-[54%] flex items-center justify-center px-7 py-10 sm:px-14 lg:px-20">

          <div className="w-full max-w-[400px]">

            {/* Mobile brand */}
            <div className="md:hidden text-center mb-8">
              <div className="flex justify-center mb-3">
                <Waves size={38} className="text-[#087ea4]" />
              </div>

              <h1 className="text-2xl font-bold tracking-widest text-[#073b5c]">
                SAGARDRISHTI
              </h1>
            </div>


            {/* TABS */}
            <div className="flex border-b border-gray-200 mb-8">

              <button
                onClick={() => setMode("login")}
                className={`w-1/2 pb-3 text-sm font-semibold transition relative ${
                  isLogin
                    ? "text-[#073b5c]"
                    : "text-gray-400"
                }`}
              >
                Login

                {isLogin && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#087ea4]" />
                )}
              </button>


              <button
                onClick={() => setMode("signup")}
                className={`w-1/2 pb-3 text-sm font-semibold transition relative ${
                  !isLogin
                    ? "text-[#073b5c]"
                    : "text-gray-400"
                }`}
              >
                Sign Up

                {!isLogin && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#087ea4]" />
                )}
              </button>

            </div>


            {/* HEADING */}
            <div className="mb-7">

              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#102a43]">
                {isLogin ? "Welcome back" : "Create your account"}
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                {isLogin
                  ? "Sign in to continue to Sagardrishti."
                  : "Create an account to access maritime intelligence."
                }
              </p>

            </div>


            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate("/dashboard");
              }}
              className="space-y-5"
            >

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full h-11 border border-gray-200 rounded-lg px-4 text-sm outline-none focus:border-[#087ea4] focus:ring-2 focus:ring-[#087ea4]/10 transition"
                  />
                </div>
              )}


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full h-11 border border-gray-200 rounded-lg px-4 text-sm outline-none focus:border-[#087ea4] focus:ring-2 focus:ring-[#087ea4]/10 transition"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      isLogin
                        ? "Enter your password"
                        : "Create a password"
                    }
                    className="w-full h-11 border border-gray-200 rounded-lg px-4 pr-12 text-sm outline-none focus:border-[#087ea4] focus:ring-2 focus:ring-[#087ea4]/10 transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#087ea4]"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>
              </div>


              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm password
                  </label>

                  <input
                    type="password"
                    placeholder="Confirm your password"
                    className="w-full h-11 border border-gray-200 rounded-lg px-4 text-sm outline-none focus:border-[#087ea4] focus:ring-2 focus:ring-[#087ea4]/10 transition"
                  />
                </div>
              )}


              {isLogin && (
                <div className="flex items-center justify-between text-xs">

                  <label className="flex items-center gap-2 text-gray-500">
                    <input
                      type="checkbox"
                      className="accent-[#087ea4]"
                    />
                    Remember me
                  </label>

                  <button
                    type="button"
                    className="font-semibold text-[#07567a] hover:text-[#087ea4]"
                  >
                    Forgot password?
                  </button>

                </div>
              )}


              <button
                type="submit"
                className="w-full h-11 rounded-lg bg-[#07567a] hover:bg-[#064968] text-white text-sm font-semibold transition shadow-sm"
              >
                {isLogin ? "Login" : "Create Account"}
              </button>


              {isLogin && (
                <>
                  <div className="flex items-center gap-4 py-1">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs text-gray-400">
                      OR
                    </span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>


                  <button
                    type="button"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-600 flex items-center justify-center gap-3 transition"
                  >
                    <span className="font-bold text-[#4285F4] text-base">
                      G
                    </span>

                    Continue with Google
                  </button>
                </>
              )}

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}