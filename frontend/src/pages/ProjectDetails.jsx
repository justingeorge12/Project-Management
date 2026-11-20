

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, FolderKanban,Pencil, Trash2, } from "lucide-react";
import api from "../services/api";
import ProjectMembers from "../components/projects/ProjectMembers";
import ProjectTasks from "../components/projects/ProjectTasks";
import EditProjectModal from "../components/projects/EditProjectModal";

function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentUser, setCurrentUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/projects/${projectId}/`
        );

        setProject(response.data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
          "Unable to load project details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
        try {
        const response = await api.get("/accounts/me/");
        setCurrentUser(response.data);
        } catch (err) {
        console.error("Unable to fetch current user:", err);
        }
    };

    fetchCurrentUser();
    }, []);

    const isProjectOwner = currentUser?.id === project?.owner;

    const handleDeleteProject = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${project.name}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setDeleting(true);
            setDeleteError("");

            await api.delete(`/projects/${project.id}/`);

            navigate("/projects");
        } catch (err) {
            setDeleteError(
            err.response?.data?.detail ||
                "Unable to delete project. Please try again."
            );
        } finally {
            setDeleting(false);
        }
        };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500">
        Loading project details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-5 text-sm text-red-600">
        {error}
        <button
          onClick={() => navigate("/projects")}
          className="ml-2 font-semibold underline"
        >
          Back to Projects
        </button>
        
      </div>
    );
  }

  if (!project) return null;

  const createdDate = new Date(
    project.created_at
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate("/projects")}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft size={18} />
        Back to Projects
      </button>

      {/* Project information */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        

        <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="rounded-xl bg-indigo-50 p-4 text-indigo-600">
                <FolderKanban size={28} />
                </div>

                <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    {project.name}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Project Overview
                </p>
                </div>
            </div>

                {isProjectOwner && (
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                        type="button"
                        onClick={() => setShowEditModal(true)}
                        className="flex items-center gap-2 rounded-lg border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                        >
                        <Pencil size={16} />
                        Edit Project
                        </button>

                        <button
                        type="button"
                        onClick={handleDeleteProject}
                        disabled={deleting}
                        className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                        <Trash2 size={16} />
                        {deleting ? "Deleting..." : "Delete Project"}
                        </button>
                    </div>
                    )}
            </div>

        <div className="border-t border-slate-100 pt-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            Description
          </h2>

          <p className="text-sm leading-6 text-slate-600">
            {project.description || "No description provided."}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-8 border-t border-slate-100 pt-5">

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Created on
            </p>

            <div className="flex items-center gap-2 text-sm text-slate-700">
              <CalendarDays size={16} />
              {createdDate}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Project ID
            </p>

            <p className="text-sm text-slate-700">
              {project.id}
            </p>
          </div>

        </div>
      </div>
      

        <ProjectMembers
            projectId={project.id}
            projectOwnerId={project.owner}
        />

        <ProjectTasks
            projectId={projectId}
            projectOwnerId={project.owner}
        />

        {showEditModal && (
            <EditProjectModal
                project={project}
                onClose={() => setShowEditModal(false)}
                onProjectUpdated={(updatedProject) => {
                setProject(updatedProject);
                }}
            />
        )}

        {deleteError && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {deleteError}
            </div>
            )}
    </div>
  );
}

export default ProjectDetails;
