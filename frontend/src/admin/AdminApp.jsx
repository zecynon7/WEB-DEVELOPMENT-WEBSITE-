import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router";
import { ADMIN_PATH } from "../lib/adminPath";
import "./admin.css";
import { AuthProvider } from "./auth";
import Shell from "./Shell";
import { UiProvider } from "./ui";
import Account from "./pages/Account";
import BranchesAdmin from "./pages/BranchesAdmin";
import Dashboard from "./pages/Dashboard";
import GalleryAdmin from "./pages/GalleryAdmin";
import Inquiries from "./pages/Inquiries";
import Login from "./pages/Login";
import MenuAdmin from "./pages/MenuAdmin";
import PageEditor from "./pages/PageEditor";
import Reservations from "./pages/Reservations";

export default function AdminApp() {
  useEffect(() => {
    document.title = "Editor";
    // keep search engines away from the editor
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    document.documentElement.classList.add("adm-area");
    return () => {
      meta.remove();
      document.documentElement.classList.remove("adm-area");
    };
  }, []);

  return (
    <AuthProvider>
      <UiProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<Shell />}>
            <Route index element={<Dashboard />} />
            <Route path="content/:key" element={<PageEditor />} />
            <Route path="menu" element={<MenuAdmin />} />
            <Route path="branches" element={<BranchesAdmin />} />
            <Route path="gallery" element={<GalleryAdmin />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="inquiries" element={<Inquiries />} />
            <Route path="account" element={<Account />} />
            <Route path="*" element={<Navigate to={ADMIN_PATH} replace />} />
          </Route>
        </Routes>
      </UiProvider>
    </AuthProvider>
  );
}
