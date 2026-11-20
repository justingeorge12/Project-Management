

import { useEffect, useState } from "react";
import { Search, ListTodo, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../services/api";
import { Plus } from "lucide-react";
import CreateTaskModal from "./CreateTaskModal";
import TaskDetailsModal from "./TaskDetailsModal";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "TODO", label: "Todo" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

const priorityOptions = [
  { value: "", label: "All priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

function ProjectTasks({ projectId, projectOwnerId }) {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assignee, setAssignee] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await api.get(
          `/projects/${projectId}/members/`
        );
        setMembers(response.data);
      } catch (err) {
        console.error("Unable to load project members:", err);
      }
    };

    fetchMembers();
  }, [projectId]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const params = { page };

        if (status) params.status = status;
        if (priority) params.priority = priority;
        if (assignee) params.assignee = assignee;
        if (search.trim()) params.search = search.trim();

        const response = await api.get(
          `/projects/${projectId}/tasks/`,
          { params }
        );

        setTasks(response.data.results || []);
        setTotalCount(response.data.count || 0);
        setHasNext(Boolean(response.data.next));
        setHasPrevious(Boolean(response.data.previous));
      } catch (err) {
        setError(
          err.response?.data?.detail ||
          "Unable to load project tasks."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId, page, status, priority, assignee, search, refreshKey]);

  const getAssigneeName = (assigneeId) => {
    if (!assigneeId) return "Unassigned";

    const member = members.find(
      (item) => item.user.id === assigneeId
    );

    return member
      ? member.user.username
      : "Unknown user";
  };

  const formatDate = (date) => {
    if (!date) return "No due date";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusStyle = (value) => {
    switch (value) {
      case "TODO":
        return "bg-slate-100 text-slate-700";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getPriorityStyle = (value) => {
    switch (value) {
      case "HIGH":
        return "text-red-600";
      case "MEDIUM":
        return "text-amber-600";
      case "LOW":
        return "text-green-600";
      default:
        return "text-slate-600";
    }
  };

  const resetFilters = () => {
    setStatus("");
    setPriority("");
    setAssignee("");
    setSearch("");
    setPage(1);
  };

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <ListTodo size={20} />
            Project Tasks
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage and track tasks in this project
          </p>
        </div>

        

        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600">
          {totalCount} tasks
        </span>
            <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                >
                <Plus size={17} />
                Create Task
            </button>
      </div>

      {/* Search and filters */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3">
          <Search size={17} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) =>
              handleFilterChange(setSearch, event.target.value)
            }
            placeholder="Search tasks..."
            className="w-full py-2.5 text-sm outline-none"
          />
        </div>

        <select
          value={status}
          onChange={(event) =>
            handleFilterChange(setStatus, event.target.value)
          }
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(event) =>
            handleFilterChange(setPriority, event.target.value)
          }
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
        >
          {priorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={assignee}
          onChange={(event) =>
            handleFilterChange(setAssignee, event.target.value)
          }
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
        >
          <option value="">All assignees</option>
          {members.map((member) => (
            <option key={member.user.id} value={member.user.id}>
              {member.user.username}
            </option>
          ))}
        </select>
      </div>

      {(search || status || priority || assignee) && (
        <button
          type="button"
          onClick={resetFilters}
          className="mb-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Clear filters
        </button>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-500">
          Loading tasks...
        </p>
      ) : tasks.length === 0 ? (
        <div className="py-10 text-center">
          <ListTodo
            size={36}
            className="mx-auto mb-3 text-slate-300"
          />
          <p className="font-medium text-slate-700">
            No tasks found
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Try changing your filters or create a new task.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-3 py-3 font-medium">Task</th>
                <th className="px-3 py-3 font-medium">Assignee</th>
                <th className="px-3 py-3 font-medium">Priority</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Due date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <tr
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="cursor-pointer hover:bg-indigo-50/50 transition-colors"
                    >
                  <td className="px-3 py-4">
                    <p className="text-sm font-medium text-slate-800">
                      {task.title}
                    </p>
                    <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                      {task.description || "No description"}
                    </p>
                  </td>

                  <td className="px-3 py-4 text-sm text-slate-600">
                    {getAssigneeName(task.assignee)}
                  </td>

                  <td className="px-3 py-4">
                    <span className={`text-sm font-medium ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>

                  <td className="px-3 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(task.status)}`}>
                      {task.status.replace("_", " ")}
                    </span>
                  </td>

                  <td className="px-3 py-4 text-sm text-slate-600">
                    {formatDate(task.due_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
        </div>
      )}

      {/* Pagination */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-sm text-slate-500">
          {totalCount} total tasks
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!hasPrevious || loading}
            onClick={() => setPage((previous) => previous - 1)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span className="text-sm text-slate-500">
            Page {page}
          </span>

          <button
            type="button"
            disabled={!hasNext || loading}
            onClick={() => setPage((previous) => previous + 1)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={16} />
          </button>
          
        </div>
        
      </div>

       {showCreateModal && (
        <CreateTaskModal
          projectId={projectId}
          members={members}
          onClose={() => setShowCreateModal(false)}
          onTaskCreated={() => {
            setPage(1);
            setRefreshKey((previous) => previous + 1);
          }}
        />
      )}

      {selectedTaskId && (
        <TaskDetailsModal
            projectId={projectId}
            taskId={selectedTaskId}
            members={members}
            projectOwnerId={projectOwnerId}
            onClose={() => setSelectedTaskId(null)}
            onTaskUpdated={() => {
                setRefreshKey((previous) => previous + 1);
            }}
            onTaskDeleted={() => {
                setSelectedTaskId(null);
                setRefreshKey((previous) => previous + 1);
            }}
        />
        )}
      
    </section>
  );
}

export default ProjectTasks;
