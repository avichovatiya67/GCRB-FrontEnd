// import logo from './logo.svg';
import React from "react";
import "./style.css";
import { Route, Routes } from "react-router-dom";
import UsersMaster from "./UsersMaster";
import AdminContextProvider from "../context/AdminContextProvider";
import Topbar from "../components/Topbar";
import Navbar from "./Navbar";
import Dashboard from "../pages/Dashboard";

function Admin() {
  return (
    <>
      <AdminContextProvider>
        <Topbar />
        <div className="d-flex">
          <Navbar />
          {/* <UsersMaster /> */}
          <div className="flex-fill">
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
            <Routes>
              <Route path="users" element={<UsersMaster />} />
            </Routes>
          </div>
        </div>
      </AdminContextProvider>
    </>
  );
}

export default Admin;
