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

  // Loading
  if (user === undefined) {

    return <p>Loading...</p>;

  }

  // Not logged in
  if (!user) {

    return <Navigate to="/login" replace />;

  }

  // Logged in
  return children;

}