

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BriefcaseBusiness } from "lucide-react";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/accounts/register/", {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
      });

      navigate("/login", {
        state: { message: "Account created successfully. Please log in." },
      });
    } catch (err) {
      const data = err.response?.data;

      if (data && typeof data === "object") {
        const firstError = Object.values(data).flat()[0];
        setError(firstError || "Registration failed.");
      } else {
        setError("Unable to register. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">

        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <BriefcaseBusiness size={25} />
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Get started with TaskFlow today
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                First name
              </label>
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={inputClass}
                placeholder="First name"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Last name
              </label>
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={inputClass}
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={inputClass}
              placeholder="Choose a username"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={inputClass}
              placeholder="Create a password"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              className={inputClass}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;
