import { BrowserRouter, Route, Routes } from "react-router";

import { MainLayout, ProtectedLayout, ScrollToTop } from "./layouts";

import {
  Categories,
  Dashboard,
  Home,
  Login,
  NotFound,
  Register,
} from "./pages";

function App() {
  const dashboardRoutes = [
    "offers",
    "offers2",
    "requests",
    "sessions",
    "profile",
    "chat",
    "notifications",
    "map",
    "settings",
    "support",
    "offers/create",
    "offers/:id",
    "offers/:id/edit",
    "requests/:id",
    "requests/:id/edit",
  ];

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:id" element={<Categories />} />

          {/* Dashboard routes */}
          <Route path="app" element={<ProtectedLayout />}>
            <Route index element={<Dashboard />} />
            {dashboardRoutes.map((path) => (
              <Route key={path} path={path} element={<Dashboard />} />
            ))}
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
