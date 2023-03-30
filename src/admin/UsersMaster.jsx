import  { useContext } from "react";
import MUIDataTable from "mui-datatables";
import { BorderColor, Delete } from "@mui/icons-material";
// import { allUserDataContext } from "../context/ContextProvider";
import { IconButton } from "@mui/material";
import { usersContext } from "../context/AdminContextProvider";

const UsersMaster = () => {
  const [users] = useContext(usersContext);
  // const [allUserData, setAllUserData] = useContext(allUserDataContext);

  const options = {
    search: true,
    // searchAlwaysOpen:true,
    download: true,
    print: true,
    viewColumns: true,
    filter: true,
    filterType: "dropdown",
    // responsive: "simple",
    // tableBodyHeight,
    selectableRows: "none",
    // expandableRows: true,
    // tableBodyMaxHeight: "60vh",
    onTableChange: (action, state) => {
      //   console.log(action);
      //   console.dir(state);
    },
    rowsPerPage: 10,
    // resizableColumns: true,
    // customFooter: (
    //   count,
    //   page,
    //   rowsPerPage,
    //   changeRowsPerPage,
    //   changePage,
    //   textLabels
    // ) => {
    //   return (
    //     <CustomFooter
    //       count={count}
    //       page={page}
    //       rowsPerPage={rowsPerPage}
    //       changeRowsPerPage={changeRowsPerPage}
    //       changePage={changePage}
    //       textLabels={textLabels}
    //     />
    //   );
    // },
  };

  const columns = [
    {
      name: "empID",
      label: "Emp Id",
      options: {
        filter: false,
        customBodyRender: (value) => {
          return <div className="ms-3">{value}</div>;
        },
      },
    },
    {
      name: "userName",
      label: "User Name",
      options: {
        filter: false,
        filterOptions: { fullWidth: true },
        customBodyRender: (value) => {
          return <div className="ms-3">{value}</div>;
        },
      },
    },
    {
      name: "email",
      label: "Email",
      options: {
        filter: false,
        customBodyRender: (value) => {
          return <div className="ms-3">{value}</div>;
        },
      },
    },
    {
      name: "contactNo",
      label: "Phone",
      options: {
        filter: false,
        customBodyRender: (value) => {
          return <div className="ms-3">{value}</div>;
        },
      },
    },
    {
      name: "location",
      label: "Location",
      options: {
        filter: true,
        filterOptions: { fullWidth: true },
        customBodyRender: (value) => {
          return <div className="ms-3">{value}</div>;
        },
      },
    },
    {
      name: "userRole",
      label: "Role",
      options: {
        filter: true,
        filterOptions: { fullWidth: true },
        customBodyRender: (value) => {
          var eventColor = "";
          if (value === "Frontdesk") {
            eventColor = "black";
          } else if (value === "User") {
            eventColor = "green";
          } else {
            eventColor = "red";
          }
          return (
            <div style={{ color: eventColor }} className="ms-3">
              {value}
              {/* {value ? "Active" : "Inactive"} */}
            </div>
          );
        },
      },
    },
    {
      name: "_id",
      label: "Actions",
      options: {
        filter: false,
        download: false,
        customBodyRender: (id, tableMeta, updateValue) => {
          return (
            <div className="gap-3 d-flex ms-1">
              <IconButton
                onClick={() => {
                  // dispatch(applicationTypeAction(tableMeta.rowData[0]));
                  alert(id);
                  //   editFunction(id, tableMeta);
                }}
              >
                <BorderColor sx={{ fontSize: "17px" }} />
              </IconButton>
              <IconButton
                onClick={() => {
                  alert("Want to delete..?"); //? deleteFunction(id) : '';
                }}
              >
                <Delete sx={{ fontSize: "17px", color: "#bf4342" }} />
              </IconButton>
            </div>
          );
        },
      },
    },
  ];

  return (
    <>
      <MUIDataTable
      
        title="Users"
        data={users}
        columns={columns}
        options={options}
      />
      {console.log(users)}
    </>
  );
};

export default UsersMaster;
