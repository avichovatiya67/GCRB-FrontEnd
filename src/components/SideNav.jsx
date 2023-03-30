import React from "react";
import { Link } from "react-router-dom";
import "./style.css";
import { theme_color } from "../theme/colors";
import logo from "../assets/logo.png";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";

const SideNav = () => {
  const navOptStyle = {
    color: "",
    fontWeight: "bold",
    mx: 0.5,
    fontSize: 40,
  };
  return (
    <div className="side_nav h-100 ">
      <div className="logo hover-zoom">
        <Link></Link>
        <img src={logo} alt="CRB" width="50px" height="50px" />
      </div>
      <div className="nav_options" style={{ color: "#C0C0C0" }}>
        <div className="nav_menu hover-zoom">
          <div>
            <DashboardOutlinedIcon sx={{ ...navOptStyle, color: theme_color }} />
          </div>
        </div>
        <div className="active_option mb-5">
          <LogoutOutlinedIcon sx={navOptStyle} />
        </div>
      </div>
    </div>
  );
};

export default SideNav;
