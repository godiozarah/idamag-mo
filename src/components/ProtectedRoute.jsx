import { Navigate } from "react-router-dom";

import {
  onAuthStateChanged
} from "firebase/auth";

import {
  useEffect,
  useState
} from "react";

import { auth } from "../firebase";

export default function ProtectedRoute({
  children
}) {

  const [user, setUser] =
    useState(undefined);

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {

          setUser(currentUser);
        }
      );

    return () => unsubscribe();

  }, []);

  // LOADING
  if (user === undefined) {
    return <p>Loading...</p>;
  }

  // NOT LOGGED IN
  if (!user) {
    return <Navigate to="/login" />;
  }

  // LOGGED IN
  return children;
}