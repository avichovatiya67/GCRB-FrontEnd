import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
export const locationsContext = createContext();
export const currentLocationContext = createContext();
export const isBookingFormOpenContext = createContext();
export const allUserDataContext = createContext();
export const bookingHistoryContext = createContext();
export const creatingEventContext = createContext();
export const updatingEventContext = createContext();
export const currentUserContext = createContext();
export const myResourcesContext = createContext();
export const allResourcesContext = createContext();
export const allBookingsContext = createContext();
export const viewOnlyFormContext = createContext();
export const getUsersFunctionContext = createContext();
export const filterEventsContext = createContext();
export const openCancelConfirmContext = createContext();

const ContextProvider = ({ children }) => {
  const [locations, setLocations] = useState([]);
  const [myResources, setMyResources] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [currentLocation, setCurrentLocation] = useState();
  const [currentUser, setCurrentUser] = useState({});
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [openCancelConfirm, setOpenCancelConfirm] = useState(null);
  const [viewOnlyForm, setViewOnlyForm] = useState(false);
  const [allUserData, setAllUserData] = useState();
  const [bookingHistory, setBookingHistory] = useState([]);
  const [allBookings, setAllBookings] = useState([{}]);
  const [creatingEvent, setCreatingEvent] = useState({
    resourceId: "",
    start: "",
    end: "",
  });
  const [updatingEvent, setUpdatingEvent] = useState();

  const authToken = Boolean(localStorage.getItem("currentUser"))
    ? JSON.parse(localStorage.getItem("currentUser"))?.authToken
    : "";
  // Set default header for all axios requests
  axios.defaults.headers.common["Authorization"] = "Bearer " + authToken;

  // Logout the current user
  const unAuthorizeUser = () => {
    setCurrentUser();
    localStorage.clear();
    localStorage.removeItem("currentUser");
    // toast.error("Login expired!!!", {
    //   position: toast.POSITION.TOP_RIGHT,
    // });
    return <Navigate to="/login" />;
  };

  // Set currentUser from localStorage
  useEffect(() => {
    setCurrentUser(
      Boolean(localStorage.getItem("currentUser"))
        ? JSON.parse(localStorage.getItem("currentUser"))
        : ""
    );
  }, []);

  // Get All Locations
  const getLocations = () => {
    axios
      .get(`/getLocations`)
      .then((res) => {
        setLocations(res.data);
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          unAuthorizeUser();
        }
        setLocations([{ city: "No locations found" }]);
      });
  };

  // Get All Users
  const getUsers = () => {
    axios
      .get(`/users`)
      .then((res) => {
        setAllUserData(res.data.data);
        // setCurrentUser(res.data.data[-1]);
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          unAuthorizeUser();
        }
        setAllUserData("No users found");
      });
  };

  // Get All Resources
  const getResources = () => {
    axios
      .get(`/getResource`)
      .then((res) => {
        setAllResources(res.data);
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          unAuthorizeUser();
        }
        setAllResources([{ roomName: "No resources found" }]);
      });
  };

  // Get bookings by organizer
  const getBookingsByOrg = () => {
    if (currentUser?._id) {
      axios
        .get(`/getBookingByOrg?id=${currentUser._id}`)
        .then((res) => {
          setBookingHistory(res.data.data);
        })
        .catch((err) => {
          if (err?.response?.status === 401) {
            unAuthorizeUser();
          }
          setBookingHistory([]);
        });
    }
  };

  // Get All Bookings
  const getAllBookings = async () => {
    await axios
      .get(`/getBookingByOrg`)
      .then((res) => {
        setAllBookings(res.data.data);
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          unAuthorizeUser();
        }
        setAllBookings([{ title: "No history found" }]);
      });
  };

  // Set current location
  useEffect(() => {
    setCurrentLocation(currentUser?.location);
  }, [currentUser]);

  // getBookingsByOrg
  useEffect(() => {
    getBookingsByOrg();
    getAllBookings();
  }, [currentUser, isBookingFormOpen]);

  // getAllBookings
  // useEffect(() => {
  //   getAllBookings();
  // }, [currentUser, isBookingFormOpen]);

  // Location Resource
  useEffect(() => {
    if (allResources.length)
      setMyResources(
        allResources?.filter(
          (resource) => resource?.location?._id === currentLocation
        )
      );
  }, [currentLocation, allResources, currentUser]);

  // Loads location, users, resources
  useEffect(() => {
    getLocations();
    getUsers();
    getResources();
    // getBookingsByOrg();
  }, [currentUser]);

  // Filter Upcoming Bookings
  const filterUpcomingEvents = (events) => {
    return events
      ?.filter((item) => {
        const endDate = new Date(item.endDate);
        const end = new Date(item.end);
        const today = new Date();
        if (endDate.getMonth() >= today.getMonth()) {
          if (endDate.getMonth() === today.getMonth()) {
            if (endDate.getDate() >= today.getDate()) {
              if (
                endDate.getDate() === today.getDate() &&
                end.getHours() <= today.getHours()
              ) {
                if (end.getHours() === today.getHours()) {
                  if (end.getMinutes() > today.getMinutes()) return true;
                  if (end.getMinutes() <= today.getMinutes()) return false;
                }
                return false;
              }
              return true;
            }
            return false;
          }
          return true;
        }
        return false;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.startDate}T${a.time}`);
        const dateB = new Date(b.start);
        return dateA.getTime() - dateB.getTime();
      });
  };
  // Filter Completed Events
  const filterCompletedEvents = (events) => {
    return events
      ?.filter((item) => {
        const endDate = new Date(item.endDate);
        const end = new Date(item.end);
        const today = new Date();

        if (endDate.getMonth() >= today.getMonth()) {
          if (
            endDate.getMonth() === today.getMonth() &&
            endDate.getDate() <= today.getDate()
          ) {
            if (
              endDate.getDate() === today.getDate() &&
              end.getHours() >= today.getHours()
            ) {
              if (end.getHours() === today.getHours()) {
                if (end.getMinutes() > today.getMinutes()) return false;
                if (end.getMinutes() <= today.getMinutes()) return true;
              }
              return false;
            }
            return true;
          }
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.end);
        const dateB = new Date(b.end);
        return dateB.getTime() - dateA.getTime();
      })
      .sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateB.getDate() - dateA.getDate();
      })
      .sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateB.getMonth() - dateA.getMonth();
      });
  };

  return (
    <>
      <isBookingFormOpenContext.Provider
        value={[isBookingFormOpen, setIsBookingFormOpen]}
      >
        <openCancelConfirmContext.Provider
          value={[openCancelConfirm, setOpenCancelConfirm]}
        >
          <locationsContext.Provider value={[locations, setLocations]}>
            <currentLocationContext.Provider
              value={[currentLocation, setCurrentLocation]}
            >
              <currentUserContext.Provider
                value={[currentUser, setCurrentUser]}
              >
                <allUserDataContext.Provider
                  value={[allUserData, setAllUserData]}
                >
                  <bookingHistoryContext.Provider
                    value={[bookingHistory, setBookingHistory]}
                  >
                    <creatingEventContext.Provider
                      value={[creatingEvent, setCreatingEvent]}
                    >
                      <updatingEventContext.Provider
                        value={[updatingEvent, setUpdatingEvent]}
                      >
                        <myResourcesContext.Provider
                          value={[myResources, setMyResources]}
                        >
                          <allResourcesContext.Provider
                            value={[allResources, setAllResources]}
                          >
                            <allBookingsContext.Provider
                              value={[allBookings, setAllBookings]}
                            >
                              <viewOnlyFormContext.Provider
                                value={[viewOnlyForm, setViewOnlyForm]}
                              >
                                <filterEventsContext.Provider
                                  value={[
                                    filterUpcomingEvents,
                                    filterCompletedEvents,
                                  ]}
                                >
                                  {children}
                                </filterEventsContext.Provider>
                              </viewOnlyFormContext.Provider>
                            </allBookingsContext.Provider>
                          </allResourcesContext.Provider>
                        </myResourcesContext.Provider>
                      </updatingEventContext.Provider>
                    </creatingEventContext.Provider>
                  </bookingHistoryContext.Provider>
                </allUserDataContext.Provider>
              </currentUserContext.Provider>
            </currentLocationContext.Provider>
          </locationsContext.Provider>
        </openCancelConfirmContext.Provider>
      </isBookingFormOpenContext.Provider>
      {/* {children} */}
    </>
  );
};

export default ContextProvider;
