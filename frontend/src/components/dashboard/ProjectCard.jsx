

import { FolderKanban, CheckCircle2, Clock3, Circle } from "lucide-react";

function ProjectCard({ project }) {
  const {
    name,
    description,
    total_tasks,
    todo_tasks,
    in_progress_tasks,
    completed_tasks,
  } = project;

  const progress =
    total_tasks > 0
      ? Math.round((completed_tasks / total_tasks) * 100)
      : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-100 p-3 text-indigo-600">
            <FolderKanban size={21} />
          </div>

          <div>
            <h3 className="font-semibold text-slate-800">
              {name}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {description || "No description"}
            </p>
          </div>
        </div>

        <span className="text-sm font-semibold text-indigo-600">
          {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="mb-2 flex justify-between text-xs text-slate-500">
          <span>Project progress</span>
          <span>{completed_tasks}/{total_tasks} tasks completed</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task statistics */}
      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
        <div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Circle size={12} className="text-slate-400" />
            Todo
          </div>
          <p className="mt-2 text-lg font-semibold text-slate-800">
            {todo_tasks}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock3 size={13} className="text-amber-500" />
            Progress
          </div>
          <p className="mt-2 text-lg font-semibold text-slate-800">
            {in_progress_tasks}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <CheckCircle2 size={13} className="text-green-500" />
            Done
          </div>
          <p className="mt-2 text-lg font-semibold text-slate-800">
            {completed_tasks}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
