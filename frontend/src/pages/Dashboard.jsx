



import { useEffect, useState } from "react";

import {
  FolderKanban,
  CheckSquare,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import StatCard from "../components/dashboard/StatCard";
import ProjectCard from "../components/dashboard/ProjectCard";
import api from "../services/api";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/projects/dashboard/");
        setDashboardData(response.data);
      } catch (err) {
        console.error("Dashboard API error:", err);

        if (err.response?.status === 401) {
          setError("Please log in to view your dashboard.");
        } else {
          setError("Unable to load dashboard. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-600">
        {error}
      </div>
    );
  }

  const projects = dashboardData?.projects || [];

  // Calculate overall statistics from project data
  const totalTasks = projects.reduce(
    (total, project) => total + project.total_tasks,
    0
  );

  const inProgressTasks = projects.reduce(
    (total, project) => total + project.in_progress_tasks,
    0
  );

  const completedTasks = projects.reduce(
    (total, project) => total + project.completed_tasks,
    0
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Overview
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Track your projects and tasks in one place.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={dashboardData.total_projects ?? projects.length}
          icon={FolderKanban}
          color="bg-indigo-100 text-indigo-600"
          description="Projects you're a member of"
        />

        <StatCard
          title="Total Tasks"
          value={dashboardData.total_tasks ?? totalTasks}
          icon={CheckSquare}
          color="bg-blue-100 text-blue-600"
          description="Across all your projects"
        />

        <StatCard
          title="In Progress"
          value={inProgressTasks}
          icon={Clock3}
          color="bg-amber-100 text-amber-600"
          description="Tasks currently in progress"
        />

        <StatCard
          title="Completed"
          value={completedTasks}
          icon={CheckCircle2}
          color="bg-green-100 text-green-600"
          description="Successfully completed tasks"
        />
      </div>

      {/* Projects */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-800">
            Your Projects
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Overview of all your projects.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <FolderKanban
              size={36}
              className="mx-auto text-slate-400"
            />
            <h3 className="mt-3 font-semibold text-slate-700">
              No projects found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Create a project or join an existing one to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
