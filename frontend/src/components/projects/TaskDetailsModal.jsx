

import { useEffect, useState } from "react";
import { X, CalendarDays, User, Flag, Clock } from "lucide-react";
import api from "../../services/api";

function TaskDetailsModal({
  projectId,
  taskId,
  members,
  projectOwnerId,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
}) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    status: "TODO",
    assignee: "",
    due_date: "",
    });
    const [saving, setSaving] = useState(false);
    const [updateErrors, setUpdateErrors] = useState({});

    const [currentUser, setCurrentUser] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const isProjectOwner = currentUser?.id === projectOwnerId;
    const canDelete = isProjectOwner && task?.status === "TODO";

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
            const response = await api.get("/accounts/me/");
            setCurrentUser(response.data);
            } catch (error) {
            console.error("Unable to fetch current user:", error);
            }
        };

        fetchCurrentUser();
        }, []);

    const handleEdit = () => {
        setFormData({
            title: task.title || "",
            description: task.description || "",
            priority: task.priority,
            status: task.status,
            assignee: task.assignee || "",
            due_date: task.due_date || "",
        });

        setUpdateErrors({});
        setIsEditing(true);
        };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setUpdateErrors((previous) => ({
            ...previous,
            [name]: "",
        }));
        };

    const getUpdateFieldError = (field) => {
        const error = updateErrors[field];

        if (!error) return null;

        return Array.isArray(error) ? error[0] : error;
        };

    const handleUpdate = async (event) => {
        event.preventDefault();

        setSaving(true);
        setUpdateErrors({});

        const payload = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            priority: formData.priority,
            status: formData.status,
            assignee: formData.assignee || null,
            due_date: formData.due_date || null,
        };

        try {
            const response = await api.patch(
            `/projects/${projectId}/tasks/${taskId}/`,
            payload
            );

            setTask(response.data);
            setIsEditing(false);
            onTaskUpdated?.(response.data);
        } catch (error) {
            setUpdateErrors(
            error.response?.data || {
                general: "Unable to update task. Please try again.",
            }
            );
        } finally {
            setSaving(false);
        }
    };

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get(
          `/projects/${projectId}/tasks/${taskId}/`
        );
        setTask(response.data);
      } catch (error) {
        setError(
          error.response?.data?.detail ||
          "Unable to load task details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [projectId, taskId]);

  const assignee = members.find(
    (member) => member.user.id === task?.assignee
  );

  const formatDate = (value) => {
    if (!value) return "Not set";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "Not available";

    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusStyle = (status) => {
    const styles = {
      TODO: "bg-slate-100 text-slate-600",
      IN_PROGRESS: "bg-blue-100 text-blue-700",
      COMPLETED: "bg-green-100 text-green-700",
    };

    return styles[status] || "bg-slate-100 text-slate-600";
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      LOW: "text-green-600",
      MEDIUM: "text-yellow-600",
      HIGH: "text-red-600",
    };

    return styles[priority] || "text-slate-600";
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this task? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeleting(true);
    setDeleteError("");

    try {
        await api.delete(
        `/projects/${projectId}/tasks/${taskId}/`
        );

        onTaskDeleted?.(taskId);
        onClose();
    } catch (error) {
        console.error("Unable to delete task:", error);

        setDeleteError(
        error.response?.data?.detail ||
        "Unable to delete task. Please try again."
        );
    } finally {
        setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div>
            <h2 className="text-lg font-semibold text-slate-900">
            Task Details
            </h2>
            <p className="mt-1 text-sm text-slate-500">
            View task information
            </p>
        </div>

        <div className="flex items-center gap-2">
            {!loading && !error && task && !isEditing && (
            <button
                type="button"
                onClick={handleEdit}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
                Edit Task
            </button>
            )}

            {canDelete && !isEditing && (
  <button
    type="button"
    onClick={handleDelete}
    disabled={deleting}
    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {deleting ? "Deleting..." : "Delete Task"}
  </button>
)}

            <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            >
            <X size={20} />
            </button>

            
        </div>
        </div>

        {/* Content */}
        
        <div className="overflow-y-auto p-5">

        {loading ? (
            <p className="py-10 text-center text-sm text-slate-500">
            Loading task details...
            </p>
        ) : error ? (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
            </p>
        ) : task ? (

            isEditing ? (

            /* Edit Task Form */
            <form onSubmit={handleUpdate} className="space-y-4">

                {updateErrors.general && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {updateErrors.general}
                </p>
                )}

                {updateErrors.detail && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {updateErrors.detail}
                </p>
                )}

                {/* Title */}
                <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                    Task Title *
                </label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    maxLength={255}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                />
                {getUpdateFieldError("title") && (
                    <p className="mt-1 text-xs text-red-600">
                    {getUpdateFieldError("title")}
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
                    rows={3}
                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                />
                {getUpdateFieldError("description") && (
                    <p className="mt-1 text-xs text-red-600">
                    {getUpdateFieldError("description")}
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
                {getUpdateFieldError("priority") && (
                    <p className="mt-1 text-xs text-red-600">
                    {getUpdateFieldError("priority")}
                    </p>
                )}
                </div>

                {/* Status */}
                <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                    Status
                </label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                >
                    <option value="TODO">Todo</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                </select>
                {getUpdateFieldError("status") && (
                    <p className="mt-1 text-xs text-red-600">
                    {getUpdateFieldError("status")}
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
                    <option key={member.user.id} value={member.user.id}>
                        {member.user.username}
                    </option>
                    ))}
                </select>
                {getUpdateFieldError("assignee") && (
                    <p className="mt-1 text-xs text-red-600">
                    {getUpdateFieldError("assignee")}
                    </p>
                )}
                </div>

                {/* Due Date */}
                <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                    Due Date
                </label>
                <input
                    type="date"
                    name="due_date"
                    value={formData.due_date || ""}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                />
                {getUpdateFieldError("due_date") && (
                    <p className="mt-1 text-xs text-red-600">
                    {getUpdateFieldError("due_date")}
                    </p>
                )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={saving || !formData.title.trim()}
                    className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
                </div>

            </form>

            ) : (

            /* Read-only Task Details */
            <div className="space-y-5">

                <div>
                <h3 className="text-xl font-semibold text-slate-900">
                    {task.title}
                </h3>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {task.description || "No description provided."}
                </p>
                </div>

                <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(task.status)}`}>
                    {task.status.replace("_", " ")}
                </span>

                <span className={`rounded-full bg-slate-50 px-3 py-1 text-xs font-medium ${getPriorityStyle(task.priority)}`}>
                    {task.priority} PRIORITY
                </span>
                </div>

                <div className="space-y-4 border-t border-slate-100 pt-4">

                <div className="flex items-center gap-3">
                    <User size={18} className="text-slate-400" />
                    <div>
                    <p className="text-xs text-slate-400">Assignee</p>
                    <p className="text-sm font-medium text-slate-700">
                        {assignee?.user.username || "Unassigned"}
                    </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Flag size={18} className="text-slate-400" />
                    <div>
                    <p className="text-xs text-slate-400">Created By</p>
                    <p className="text-sm font-medium text-slate-700">
                        {task.created_by}
                    </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <CalendarDays size={18} className="text-slate-400" />
                    <div>
                    <p className="text-xs text-slate-400">Due Date</p>
                    <p className="text-sm font-medium text-slate-700">
                        {formatDate(task.due_date)}
                    </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Clock size={18} className="text-slate-400" />
                    <div>
                    <p className="text-xs text-slate-400">Created At</p>
                    <p className="text-sm font-medium text-slate-700">
                        {formatDateTime(task.created_at)}
                    </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Clock size={18} className="text-slate-400" />
                    <div>
                    <p className="text-xs text-slate-400">Last Updated</p>
                    <p className="text-sm font-medium text-slate-700">
                        {formatDateTime(task.updated_at)}
                    </p>
                    </div>
                </div>

                </div>
            </div>
            )

        ) : null}

        </div>

        

      </div>

      {deleteError && (
        <p className="mt-3 text-sm text-red-600">
            {deleteError}
        </p>
        )}



    </div>
  );
}

export default TaskDetailsModal;
