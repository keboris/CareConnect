import { BrowserRouter, Route, Routes } from "react-router";

import { MainLayout, ProtectedLayout } from "./layouts";

import {
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
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="app" element={<ProtectedLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="chat" element={<Chat />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
