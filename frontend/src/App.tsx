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
            <Route path="offers" element={<Dashboard />} />
            <Route path="offers2" element={<Dashboard />} />
            <Route path="requests" element={<Dashboard />} />
            <Route path="profile" element={<Dashboard />} />
            <Route path="chat" element={<Dashboard />} />
            <Route path="notifications" element={<Dashboard />} />
            <Route path="map" element={<Dashboard />} />
            <Route path="settings" element={<Dashboard />} />
            <Route path="support" element={<Dashboard />} />
            <Route path="offers/create" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
