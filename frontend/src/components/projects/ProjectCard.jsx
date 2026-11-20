

import { FolderKanban, CalendarDays, ArrowRight } from "lucide-react";

function ProjectCard({ project, onClick }) {
  const formattedDate = new Date(
    project.created_at
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
          <FolderKanban size={22} />
        </div>

        <button
          onClick={onClick}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-slate-900">
        {project.name}
      </h3>

      <p className="mb-5 min-h-10 text-sm text-slate-500">
        {project.description || "No description provided."}
      </p>

      <div className="flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
        <CalendarDays size={15} />
        Created {formattedDate}
      </div>

    </div>
  );
}

export default ProjectCard;
