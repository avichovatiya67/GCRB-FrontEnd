import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";

// Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "AIzaSyBIEic2OjCVTAlW5aPEChsLMzVBmvVw1RA",
  authDomain: "merndemo-auth.firebaseapp.com",
  projectId: "merndemo-auth",
  storageBucket: "merndemo-auth.appspot.com",
  messagingSenderId: "152359613254",
  appId: "1:152359613254:web:801db57de27df9a7706b47",
  measurementId: "G-RCJGBSXC50",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
// const auth = getAuth(app);

export default app