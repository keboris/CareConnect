import { BrowserRouter, Route, Routes } from "react-router";

import { MainLayout, ProtectedLayout, ScrollToTop } from "./layouts";

import {
  Categories,
  Chat,
  Dashboard,
  Home,
  Login,
  NotFound,
  Profile,
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
            <Route path="profile" element={<Profile />} />
            <Route path="chat" element={<Chat />} />
            <Route path="settings" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
