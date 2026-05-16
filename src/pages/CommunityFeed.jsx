import {
  useEffect,
  useState
} from "react";

import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc
} from "firebase/firestore";

import {
  auth,
  db
} from "../firebase";

export default function CommunityFeed() {

  const [post, setPost] =
    useState("");

  const [posts, setPosts] =
    useState([]);

  // LOAD POSTS
  useEffect(() => {

    const unsubscribe =
      onSnapshot(
        collection(db, "posts"),
        (snapshot) => {

          const postList =
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data()
            }));

          setPosts(postList);
        }
      );

    return () => unsubscribe();

  }, []);

  // CREATE POST
  const createPost = async () => {

    if (post.trim() === "") return;

    const user = auth.currentUser;

    if (!user) return;

    try {

      await addDoc(
        collection(db, "posts"),
        {
          author: user.email,
          content: post,
          likes: 0,
          likedBy: [],
          createdAt: serverTimestamp()
        }
      );

      setPost("");

    } catch (error) {

      console.error(error);
    }
  };

  // LIKE POST
  const likePost = async (
    postId,
    likes,
    likedBy
  ) => {

    const user = auth.currentUser;

    if (!user) return;

    // PREVENT MULTIPLE LIKES
    if (
      likedBy &&
      likedBy.includes(user.uid)
    ) {
      alert(
        "You already liked this post."
      );

      return;
    }

    try {

      const postRef =
        doc(db, "posts", postId);

      await updateDoc(postRef, {
        likes: likes + 1,
        likedBy: [
          ...(likedBy || []),
          user.uid
        ]
      });

    } catch (error) {

      console.error(error);
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "20px auto",
        fontFamily: "Arial"
      }}
    >

      <h1
        style={{
          fontSize: "45px",
          color: "#1B5E20",
          marginBottom: "30px"
        }}
      >
        🏘 Community Feed
      </h1>

      {/* CREATE POST */}
      <div
        style={{
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "20px",
          marginBottom: "30px",
          boxShadow:
            "0 4px 10px rgba(0,0,0,0.1)"
        }}
      >

        <textarea
          placeholder="What's happening in Barangay Ucab?"
          value={post}
          onChange={(e) =>
            setPost(e.target.value)
          }
          style={{
            width: "100%",
            height: "120px",
            padding: "15px",
            borderRadius: "12px",
            border: "1px solid #ccc",
            marginBottom: "15px",
            fontSize: "16px"
          }}
        />

        <button
          onClick={createPost}
          style={{
            backgroundColor: "#1B5E20",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Post
        </button>

      </div>

      {/* POSTS */}
      {posts.map((item) => (

        <div
          key={item.id}
          style={{
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "20px",
            marginBottom: "20px",
            boxShadow:
              "0 4px 10px rgba(0,0,0,0.1)"
          }}
        >

          {/* AUTHOR */}
          <h3
            style={{
              color: "#1B5E20",
              marginBottom: "10px"
            }}
          >
            👤 {item.author}
          </h3>

          {/* CONTENT */}
          <p
            style={{
              fontSize: "18px",
              lineHeight: "1.7",
              marginBottom: "20px"
            }}
          >
            {item.content}
          </p>

          {/* LIKE BUTTON */}
          <button
            onClick={() =>
              likePost(
                item.id,
                item.likes,
                item.likedBy
              )
            }
            style={{
              backgroundColor: "#43A047",
              color: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            👍 Like ({item.likes || 0})
          </button>

        </div>

      ))}

    </div>
  );
}