import "./App.css";
import React, { useContext, useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Scheduler from "./components/scheduler/Scheduler";
import Admin from "./admin/Admin";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import { currentUserContext } from "./context/ContextProvider";

function App() {
  const [currentUser] = useContext(currentUserContext);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(Boolean(localStorage.getItem("currentUser")));
  }, [currentUser]);

  return (
    <>
      <Routes>
        <Route
          exact
          path="/login"
          element={!isAuth ? <Login /> : <Navigate to="/" />}
        />

        <Route
          exact
          path="/"
          element={isAuth ? <Home /> : <Navigate to="/login" />}
        />

        <Route path="admin/*" element={<Admin />} />

        <Route exact path="/bookroom" element={<Scheduler />} />
        {/* <Route exact path="/" component={<Home />} /> */}
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
