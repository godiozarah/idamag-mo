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
  doc,
  arrayUnion,
  deleteDoc
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

  const [comments, setComments] =
    useState({});

  // DELETE MODAL STATES
  const [
    showDeleteModal,
    setShowDeleteModal
  ] = useState(false);

  const [
    selectedPostId,
    setSelectedPostId
  ] = useState(null);

  // ADMIN EMAIL
  const adminEmail =
    "admin@ucab.com";

  // LOAD POSTS
  useEffect(() => {

    const unsubscribe =
      onSnapshot(
        collection(db, "posts"),
        (snapshot) => {

          const postList =
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data()
              })
            );

          setPosts(postList);
        }
      );

    return () => unsubscribe();

  }, []);

  // CREATE POST
  const createPost = async () => {

    if (
      post.trim() === ""
    ) return;

    const user =
      auth.currentUser;

    if (!user) return;

    try {

      await addDoc(
        collection(db, "posts"),
        {
          author:
            user.email,

          content:
            post,

          likes: 0,

          likedBy: [],

          comments: [],

          createdAt:
            serverTimestamp()
        }
      );

      setPost("");

    } catch (error) {

      console.error(error);
    }
  };

  // DELETE POST
  const deletePost = async () => {

    try {

      await deleteDoc(
        doc(
          db,
          "posts",
          selectedPostId
        )
      );

      setShowDeleteModal(
        false
      );

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

    const user =
      auth.currentUser;

    if (!user) return;

    // PREVENT MULTIPLE LIKES
    if (
      likedBy &&
      likedBy.includes(
        user.uid
      )
    ) {

      return;
    }

    try {

      const postRef =
        doc(
          db,
          "posts",
          postId
        );

      await updateDoc(
        postRef,
        {
          likes:
            likes + 1,

          likedBy: [
            ...(likedBy || []),
            user.uid
          ]
        }
      );

    } catch (error) {

      console.error(error);
    }
  };

  // ADD COMMENT
  const addComment = async (
    postId
  ) => {

    const user =
      auth.currentUser;

    if (!user) return;

    if (
      !comments[postId] ||
      comments[
        postId
      ].trim() === ""
    ) {

      return;
    }

    try {

      const postRef =
        doc(
          db,
          "posts",
          postId
        );

      await updateDoc(
        postRef,
        {

          comments:
            arrayUnion({
              author:
                user.email,

              text:
                comments[
                  postId
                ]
            })

        }
      );

      setComments({
        ...comments,
        [postId]: ""
      });

    } catch (error) {

      console.error(error);
    }
  };

  return (

    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom, #f4f7f4, #e8f5e9)",
        padding: "40px",
        fontFamily:
          "'Segoe UI', sans-serif"
      }}
    >

      {/* HEADER */}

      <div
        style={{
          marginBottom:
            "35px"
        }}
      >

        <h1
          style={{
            fontSize:
              "42px",

            color:
              "#1B5E20",

            marginBottom:
              "10px",

            fontWeight:
              "700"
          }}
        >
          Community Feed
        </h1>

        <p
          style={{
            color:
              "#555",

            fontSize:
              "16px"
          }}
        >
          Share updates and
          announcements with
          Barangay Ucab residents.
        </p>

      </div>

      {/* CREATE POST */}

      <div
        style={{
          backgroundColor:
            "white",

          padding:
            "30px",

          borderRadius:
            "25px",

          marginBottom:
            "35px",

          boxShadow:
            "0 8px 20px rgba(0,0,0,0.08)"
        }}
      >

        <h2
          style={{
            color:
              "#1B5E20",

            marginBottom:
              "20px"
          }}
        >
          Create New Post
        </h2>

        <textarea
          placeholder="Share updates with the community..."
          value={post}
          onChange={(e) =>
            setPost(
              e.target.value
            )
          }
          style={{
            width:
              "100%",

            height:
              "140px",

            padding:
              "18px",

            borderRadius:
              "15px",

            border:
              "1px solid #ccc",

            marginBottom:
              "20px",

            fontSize:
              "16px",

            resize:
              "none",

            outline:
              "none"
          }}
        />

        <button
          onClick={
            createPost
          }
          style={{
            background:
              "linear-gradient(90deg,#1B5E20,#43A047)",

            color:
              "white",

            border:
              "none",

            padding:
              "14px 28px",

            borderRadius:
              "14px",

            cursor:
              "pointer",

            fontWeight:
              "600"
          }}
        >
          Publish Post
        </button>

      </div>

      {/* NO POSTS */}

      {posts.length === 0 && (

        <div
          style={{
            backgroundColor:
              "white",

            padding:
              "30px",

            borderRadius:
              "25px",

            textAlign:
              "center"
          }}
        >

          <h2
            style={{
              color:
                "#1B5E20"
            }}
          >
            No community posts yet.
          </h2>

        </div>

      )}

      {/* POSTS */}

      {posts.map((item) => (

        <div
          key={item.id}
          style={{
            backgroundColor:
              "white",

            padding:
              "30px",

            borderRadius:
              "25px",

            marginBottom:
              "25px",

            boxShadow:
              "0 8px 20px rgba(0,0,0,0.08)"
          }}
        >

          {/* AUTHOR */}

          <div
            style={{
              marginBottom:
                "18px"
            }}
          >

            <h3
              style={{
                color:
                  "#1B5E20",

                marginBottom:
                  "6px"
              }}
            >
              {item.author}
            </h3>

            <p
              style={{
                color:
                  "#888",

                fontSize:
                  "14px",

                margin: 0
              }}
            >
              Barangay Ucab Resident
            </p>

          </div>

          {/* CONTENT */}

          <div
            style={{
              backgroundColor:
                "#f8f8f8",

              padding:
                "20px",

              borderRadius:
                "18px",

              marginBottom:
                "20px"
            }}
          >

            <p
              style={{
                fontSize:
                  "17px",

                lineHeight:
                  "1.8",

                color:
                  "#333",

                margin: 0
              }}
            >
              {item.content}
            </p>

          </div>

          {/* ACTIONS */}

          <div
            style={{
              display:
                "flex",

              justifyContent:
                "space-between",

              alignItems:
                "center",

              flexWrap:
                "wrap",

              gap:
                "15px",

              marginBottom:
                "25px"
            }}
          >

            <div
              style={{
                color:
                  "#666",

                fontSize:
                  "15px",

                fontWeight:
                  "500"
              }}
            >
              {item.likes || 0}
              {" "}
              Likes
            </div>

            <div
              style={{
                display:
                  "flex",

                gap:
                  "10px",

                flexWrap:
                  "wrap"
              }}
            >

              {/* LIKE */}

              <button
                onClick={() =>
                  likePost(
                    item.id,
                    item.likes,
                    item.likedBy
                  )
                }
                style={{
                  backgroundColor:
                    "#43A047",

                  color:
                    "white",

                  border:
                    "none",

                  padding:
                    "12px 22px",

                  borderRadius:
                    "12px",

                  cursor:
                    "pointer",

                  fontWeight:
                    "600"
                }}
              >
                Like Post
              </button>

              {/* ADMIN DELETE */}

              {auth.currentUser
                ?.email ===
                adminEmail && (

                <button
                  onClick={() => {

                    setSelectedPostId(
                      item.id
                    );

                    setShowDeleteModal(
                      true
                    );

                  }}
                  style={{
                    backgroundColor:
                      "#d32f2f",

                    color:
                      "white",

                    border:
                      "none",

                    padding:
                      "12px 22px",

                    borderRadius:
                      "12px",

                    cursor:
                      "pointer",

                    fontWeight:
                      "600"
                  }}
                >
                  Delete Post
                </button>

              )}

            </div>

          </div>

          {/* COMMENTS */}

          <div
            style={{
              marginTop:
                "15px"
            }}
          >

            <h4
              style={{
                color:
                  "#1B5E20",

                marginBottom:
                  "15px"
              }}
            >
              Comments
            </h4>

            {/* COMMENT LIST */}

            {item.comments &&
              item.comments.map(
                (
                  comment,
                  index
                ) => (

                  <div
                    key={index}
                    style={{
                      backgroundColor:
                        "#f5f5f5",

                      padding:
                        "14px",

                      borderRadius:
                        "14px",

                      marginBottom:
                        "12px"
                    }}
                  >

                    <strong>
                      {comment.author}
                    </strong>

                    <p
                      style={{
                        marginTop:
                          "6px",

                        marginBottom:
                          0,

                        lineHeight:
                          "1.6"
                      }}
                    >
                      {comment.text}
                    </p>

                  </div>

                )
              )}

            {/* COMMENT INPUT */}

            <div
              style={{
                display:
                  "flex",

                gap:
                  "10px",

                marginTop:
                  "15px"
              }}
            >

              <input
                type="text"
                placeholder="Write a comment..."
                value={
                  comments[
                    item.id
                  ] || ""
                }
                onChange={(e) =>
                  setComments({
                    ...comments,
                    [item.id]:
                      e.target.value
                  })
                }
                style={{
                  flex: 1,

                  padding:
                    "14px",

                  borderRadius:
                    "12px",

                  border:
                    "1px solid #ccc",

                  outline:
                    "none",

                  fontSize:
                    "15px"
                }}
              />

              <button
                onClick={() =>
                  addComment(
                    item.id
                  )
                }
                style={{
                  background:
                    "linear-gradient(90deg,#1B5E20,#43A047)",

                  color:
                    "white",

                  border:
                    "none",

                  padding:
                    "12px 20px",

                  borderRadius:
                    "12px",

                  cursor:
                    "pointer",

                  fontWeight:
                    "600"
                }}
              >
                Comment
              </button>

            </div>

          </div>

        </div>

      ))}

      {/* DELETE MODAL */}

      {showDeleteModal && (

        <div
          style={{
            position:
              "fixed",

            top: 0,
            left: 0,

            width:
              "100%",

            height:
              "100%",

            backgroundColor:
              "rgba(0,0,0,0.5)",

            display:
              "flex",

            justifyContent:
              "center",

            alignItems:
              "center",

            zIndex:
              9999
          }}
        >

          <div
            style={{
              backgroundColor:
                "white",

              padding:
                "35px",

              borderRadius:
                "25px",

              width:
                "400px",

              textAlign:
                "center",

              boxShadow:
                "0 10px 30px rgba(0,0,0,0.2)"
            }}
          >

            <h2
              style={{
                color:
                  "#1B5E20",

                marginBottom:
                  "15px"
              }}
            >
              Delete Post
            </h2>

            <p
              style={{
                color:
                  "#555",

                marginBottom:
                  "30px",

                lineHeight:
                  "1.7"
              }}
            >
              Are you sure you
              want to permanently
              delete this post?
            </p>

            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "center",

                gap:
                  "15px"
              }}
            >

              {/* CANCEL */}

              <button
                onClick={() =>
                  setShowDeleteModal(
                    false
                  )
                }
                style={{
                  padding:
                    "12px 20px",

                  borderRadius:
                    "12px",

                  border:
                    "1px solid #ccc",

                  backgroundColor:
                    "white",

                  cursor:
                    "pointer",

                  fontWeight:
                    "600"
                }}
              >
                Cancel
              </button>

              {/* DELETE */}

              <button
                onClick={
                  deletePost
                }
                style={{
                  padding:
                    "12px 20px",

                  borderRadius:
                    "12px",

                  border:
                    "none",

                  backgroundColor:
                    "#d32f2f",

                  color:
                    "white",

                  cursor:
                    "pointer",

                  fontWeight:
                    "600"
                }}
              >
                Delete
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}