import {
  useEffect,
  useState
} from "react";

import {
  Navigate
} from "react-router-dom";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  auth,
  db
} from "../firebase";

export default function AdminRoute({
  children
}) {

  const [loading, setLoading] =
    useState(true);

  const [isAdmin, setIsAdmin] =
    useState(false);

  useEffect(() => {

    const checkAdmin = async () => {

      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {

        const docRef =
          doc(db, "users", user.uid);

        const docSnap =
          await getDoc(docRef);

        if (
          docSnap.exists() &&
          docSnap.data().role === "admin"
        ) {

          setIsAdmin(true);

        }

      } catch (error) {

        console.error(error);
      }

      setLoading(false);
    };

    checkAdmin();

  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
}