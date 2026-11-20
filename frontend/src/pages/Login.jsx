

import { useState } from "react";
import { BriefcaseBusiness, LockKeyhole, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login error:", err);

      if (err.response?.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError("Unable to log in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <BriefcaseBusiness size={28} />
          </div>

          <h1 className="text-2xl font-bold text-slate-800">
            Welcome to FinBase
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to manage your projects and tasks.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Username
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-3 focus-within:border-indigo-500">
              <User size={18} className="text-slate-400" />

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="w-full py-3 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-3 focus-within:border-indigo-500">
              <LockKeyhole size={18} className="text-slate-400" />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full py-3 text-sm outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}

            
          </button>
          
          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
                Create account
            </Link>
            </p>

        </form>
      </div>
    </div>
  );
}

export default Login;
