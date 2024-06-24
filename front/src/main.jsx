import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Login } from "./components/Login";
import { Navbar } from "./components/Navbar";
import { Register } from "./components/Register";
import { PrivateRoute } from "./components/PrivateRoute";
import { DashboardAgr } from "./components/DashboardAgr";
import { DashboardFabr } from "./components/DashboardFabr";
import { DashboardClient } from "./components/DashboardClient";

import { BrowserRouter, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route index element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboardAgr" element={<PrivateRoute><DashboardAgr /></PrivateRoute>} />
          <Route path="dashboardFabr" element={<PrivateRoute><DashboardFabr /></PrivateRoute>} />
          <Route path="dashboardClient" element={<PrivateRoute><DashboardClient /></PrivateRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
