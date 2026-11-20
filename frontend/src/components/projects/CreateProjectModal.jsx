

import { useState } from "react";
import { X } from "lucide-react";
import api from "../../services/api";


function CreateProjectModal({ onClose, onProjectCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
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

    if (!formData.name.trim()) {
      setError("Project name is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/projects/", {
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      onProjectCreated(response.data);
      onClose();
    } catch (err) {
      const data = err.response?.data;

      if (data && typeof data === "object") {
        const firstError = Object.values(data).flat()[0];
        setError(firstError || "Unable to create project.");
      } else {
        setError("Unable to create project. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Create New Project
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Project Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter project name"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your project..."
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CreateProjectModal;
