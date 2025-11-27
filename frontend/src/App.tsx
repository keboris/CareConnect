import { BrowserRouter, Route, Routes } from "react-router";

import Home from "./pages/Home";

import Register from "./pages/Register";
import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import { MainLayout, ProtectedLayout } from "./layouts";
import NotFound from "./pages/NotFound";
import Conversation from "./pages/Conversation";

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
            <Route path="chat" element={<Conversation />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
