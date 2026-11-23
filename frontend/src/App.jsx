import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import { ADMIN_PATH } from "./lib/adminPath";
import SiteLayout from "./site/SiteLayout";
import About from "./site/pages/About";
import Contact from "./site/pages/Contact";
import Gallery from "./site/pages/Gallery";
import Home from "./site/pages/Home";
import Menu from "./site/pages/Menu";
import NotFound from "./site/pages/NotFound";
import Privacy from "./site/pages/Privacy";
import Reserve from "./site/pages/Reserve";
import Track from "./site/pages/Track";

// The editor is its own bundle: visitors of the website never download it.
const AdminApp = lazy(() => import("./admin/AdminApp"));
// the map library is only downloaded when someone opens the Branches page
const Branches = lazy(() => import("./site/pages/Branches"));

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="menu" element={<Menu />} />
        <Route
          path="branches"
          element={
            <Suspense fallback={null}>
              <Branches />
            </Suspense>
          }
        />
        <Route path="gallery" element={<Gallery />} />
        <Route path="contact" element={<Contact />} />
        <Route path="reserve" element={<Reserve />} />
        <Route path="track" element={<Track />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route
        path={`${ADMIN_PATH}/*`}
        element={
          <Suspense fallback={null}>
            <AdminApp />
          </Suspense>
        }
      />
    </Routes>
  );
}
