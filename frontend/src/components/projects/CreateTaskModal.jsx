

import { useState } from "react";
import { X } from "lucide-react";
import api from "../../services/api";

function CreateTaskModal({
  projectId,
  members,
  onClose,
  onTaskCreated,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    assignee: "",
    due_date: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setErrors({});

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      assignee: formData.assignee || null,
      due_date: formData.due_date || null,
    };

    try {
      const response = await api.post(
        `/projects/${projectId}/tasks/`,
        payload
      );

      onTaskCreated(response.data);
      onClose();
    } catch (error) {
      const responseData = error.response?.data;

      if (responseData && typeof responseData === "object") {
        setErrors(responseData);
      } else {
        setErrors({
          general: "Unable to create task. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (field) => {
    const error = errors[field];

    if (!error) return null;

    return Array.isArray(error) ? error[0] : error;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <form
        onSubmit={handleSubmit}
        className="space-y-4 overflow-y-auto p-5"
        >
          {errors.general && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {errors.general}
            </p>
          )}

          {errors.detail && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {errors.detail}
            </p>
          )}

          {/* Task title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Task Title <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
              maxLength={255}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            {getFieldError("title") && (
              <p className="mt-1 text-xs text-red-600">
                {getFieldError("title")}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the task..."
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            {getFieldError("description") && (
              <p className="mt-1 text-xs text-red-600">
                {getFieldError("description")}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Priority
            </label>

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>

            {getFieldError("priority") && (
              <p className="mt-1 text-xs text-red-600">
                {getFieldError("priority")}
              </p>
            )}
          </div>

          {/* Assignee */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Assign To
            </label>

            <select
              name="assignee"
              value={formData.assignee}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">Unassigned</option>

              {members.map((member) => (
                <option
                  key={member.user.id}
                  value={member.user.id}
                >
                  {member.user.first_name || member.user.last_name
                    ? `${member.user.first_name} ${member.user.last_name}`.trim()
                    : member.user.username}
                  {" "}({member.user.email})
                </option>
              ))}
            </select>

            {getFieldError("assignee") && (
              <p className="mt-1 text-xs text-red-600">
                {getFieldError("assignee")}
              </p>
            )}
          </div>

          {/* Due date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Due Date
            </label>

            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            />

            {getFieldError("due_date") && (
              <p className="mt-1 text-xs text-red-600">
                {getFieldError("due_date")}
              </p>
            )}
          </div>

          {/* Form actions */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;
