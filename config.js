import firebase from "firebase/compat/app";
import "firebase/compat/storage"; // Import Firebase storage if you're using it

const firebaseConfig = {
  apiKey: "AIzaSyAE3qbwcd31IXDKUVOr3B5xePX4jJUKlKc",
  authDomain: "documentexpo-8dd4d.firebaseapp.com",
  projectId: "documentexpo-8dd4d",
  storageBucket: "documentexpo-8dd4d.appspot.com",
  messagingSenderId: "975646910782",
  appId: "1:975646910782:web:3af6421b325d4d06efe46f",
  measurementId: "G-QC5B8SE8WL",
};

// Check if Firebase is already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };
