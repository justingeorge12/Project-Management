
import { useEffect, useState } from "react";
import { Plus, FolderKanban } from "lucide-react";
import api from "../../services/api";
import ProjectCard from "./ProjectCard";
import CreateProjectModal from "./CreateProjectModal";
import { useNavigate } from "react-router-dom";


function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const navigate = useNavigate();

  const handleProjectCreated = (newProject) => {
    setProjects((previousProjects) => [
      newProject,
      ...previousProjects,
    ]);
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/projects/");

      setProjects(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div>

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Projects
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and track all your projects.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Plus size={18} />
          Create Project
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-16 text-center text-slate-500">
          Loading projects...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
          <button
            onClick={fetchProjects}
            className="ml-2 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Projects */}
      {!loading && !error && (
        <>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => navigate(`/projects/${project.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <FolderKanban
                size={40}
                className="mx-auto mb-4 text-slate-300"
              />

              <h3 className="text-lg font-semibold text-slate-800">
                No projects yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create your first project to get started.
              </p>
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}

    </div>
  );

}


export default Projects;
