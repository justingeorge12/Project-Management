
import { Navigate, Route, Routes } from "react-router-dom";

import Sidebar from "./components/layout/sidebar";
import Topbar from "./components/layout/topbar";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Projects from "./components/projects/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import MyTasks from "./pages/MyTasks";


function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      <Sidebar />

      <main className="ml-6 flex min-w-0 flex-1 flex-col overflow-y-auto">

        <Topbar />

        <div className="p-8">
          <Dashboard />
        </div>

      </main>
    </div>
  );
}
// function DashboardLayout() {
//   return (
//     <div className="min-h-screen bg-slate-50">
//       <Sidebar />

//       <main className="ml-64 min-w-0">
//         <Topbar />

//         <div className="p-8">
//           <Dashboard />
//         </div>
//       </main>
//     </div>
//   );
// }

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardLayout />} />
      </Route>

      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:projectId" element={<ProjectDetails />}/>
      <Route path="my-tasks" element={<MyTasks />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
