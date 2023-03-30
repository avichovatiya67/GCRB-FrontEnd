import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="d-flex flex-column bg-white p-3 pt-5">
      <NavLink to="/admin">
        <DashboardOutlinedIcon fontSize="large" sx={{ fontSize: "60" }} />
      </NavLink>
      <NavLink to="/admin/users">
        <DashboardOutlinedIcon fontSize="large" sx={{ fontSize: "60" }} />
      </NavLink>
    </div>
  );
};
export default Navbar;
