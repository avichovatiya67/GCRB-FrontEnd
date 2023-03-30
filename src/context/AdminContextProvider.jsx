import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const usersContext = createContext();

const AdminContextProvider = ({ children }) => {
  const [users, setUsers] = useState([]);

  // Users
  const getUsers = () => {
    axios
      .get(`/users`)
      .then((res) => {
        setUsers(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //   // Location Details
  //   const getLocations = () => {
  //     axios
  //       .get(`/getLocations`)
  //       .then((res) => {})
  //       .catch((err) => {});
  //   };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <>
      <usersContext.Provider value={[users, setUsers]}>
        {children}
      </usersContext.Provider>
    </>
  );
};
export default AdminContextProvider;
