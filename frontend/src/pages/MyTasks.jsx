

import { useEffect, useState } from "react";
import { Search, ListTodo, RefreshCw } from "lucide-react";
import api from "../services/api";

function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    fetchCurrentUser();
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [page, status, priority, search]);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/accounts/me/");
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Unable to fetch user:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects/");
      setProjects(response.data.results || response.data);
    } catch (error) {
      console.error("Unable to fetch projects:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        page_size: pageSize,
      };

      if (search) params.search = search;
      if (status) params.status = status;
      if (priority) params.priority = priority;

      const response = await api.get("/projects/my-tasks/", {
        params,
      });

      setTasks(response.data.results || []);
      setTotalCount(response.data.count || 0);
      setHasNext(Boolean(response.data.next));
      setHasPrevious(Boolean(response.data.previous));
    } catch (error) {
      console.error("Unable to fetch tasks:", error);
      setError(
        error.response?.data?.detail ||
        "Unable to load your tasks. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  const getProjectName = (projectId) => {
    const project = projects.find(
      (item) => item.id === projectId
    );

    return project?.name || "Unknown project";
  };

  const getTaskRelationship = (task) => {
    if (task.created_by === currentUser?.id) {
      return "Created by me";
    }

    if (task.assignee === currentUser?.id) {
      return "Assigned to me";
    }

    return "";
  };

  const getStatusStyle = (taskStatus) => {
    const styles = {
      TODO: "bg-slate-100 text-slate-700",
      IN_PROGRESS: "bg-blue-100 text-blue-700",
      COMPLETED: "bg-green-100 text-green-700",
    };

    return styles[taskStatus] || "bg-slate-100 text-slate-700";
  };

  const getPriorityStyle = (taskPriority) => {
    const styles = {
      LOW: "bg-slate-100 text-slate-700",
      MEDIUM: "bg-yellow-100 text-yellow-700",
      HIGH: "bg-red-100 text-red-700",
    };

    return styles[taskPriority] || "bg-slate-100 text-slate-700";
  };

  return (
    <section className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          My Tasks
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Tasks assigned to you and tasks created by you.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row">

          <form
            onSubmit={handleSearch}
            className="flex flex-1 gap-2"
          >
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search tasks..."
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Search
            </button>
          </form>

          <select
            value={status}
            onChange={handleFilterChange(setStatus)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"
          >
            <option value="">All Statuses</option>
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={priority}
            onChange={handleFilterChange(setPriority)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              All My Tasks
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {totalCount} task{totalCount !== 1 ? "s" : ""} found
            </p>
          </div>

          <button
            type="button"
            onClick={fetchTasks}
            disabled={loading}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            title="Refresh tasks"
          >
            <RefreshCw size={17} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-slate-500">
            Loading tasks...
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={fetchTasks}
              className="mt-3 text-sm font-medium text-indigo-600"
            >
              Try again
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ListTodo size={36} className="text-slate-300" />
            <p className="mt-3 font-medium text-slate-700">
              No tasks found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Task</th>
                  <th className="px-5 py-3">Project</th>
                  <th className="px-5 py-3">Relationship</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Due Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {task.title}
                      </p>
                      <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                        {task.description || "No description"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {getProjectName(task.project)}
                    </td>

                    <td className="px-5 py-4">
                      {getTaskRelationship(task) === "Created by me" ? (
                        <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                          Created by me
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          Assigned to me
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityStyle(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(task.status)}`}>
                        {task.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {task.due_date || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && tasks.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
            <p className="text-xs text-slate-500">
              Page {page} · Showing {tasks.length} of {totalCount} tasks
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={!hasPrevious}
                onClick={() => setPage((previous) => previous - 1)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={!hasNext}
                onClick={() => setPage((previous) => previous + 1)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default MyTasks;
