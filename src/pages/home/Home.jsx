import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import Topbar from "../../components/Topbar";
import Dashboard from "../Dashboard";

function Home() {
  useEffect(() => {
    localStorage.getItem("authToken");
  }, []);

  return (
    <div className="d-flex flex-column h-100 m-0 p-0" style={{ overflow: "" }}>
      {/* <div style={{ height: "100vh" }}>
        <SideNav />
      </div> */}

      {/* Topbar */}
      <Topbar />

      <Dashboard />
    </div>
  );
}

export default Home;
