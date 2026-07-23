import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  getDoc,
  setDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import "./Announcements.css";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);

  const [commentInputs, setCommentInputs] = useState({});

  const [comments, setComments] = useState({});

  const [replies, setReplies] = useState({});

  const [replyInputs, setReplyInputs] = useState({});

  const [activeReply, setActiveReply] = useState({});

  // ==========================
  // LIKE
  // ==========================

  async function handleLike(announcementId) {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Please log in first.");
        return;
      }

      const likeRef = doc(
        db,
        "announcements",
        announcementId,
        "likes",
        user.uid
      );

      const likeSnap = await getDoc(likeRef);

      if (likeSnap.exists()) {
        alert("You already liked this announcement.");
        return;
      }

      await setDoc(likeRef, {
        liked: true,
        createdAt: serverTimestamp(),
      });

      await updateDoc(
        doc(db, "announcements", announcementId),
        {
          likes: increment(1),
        }
      );
    } catch (error) {
      console.error("Like Error:", error);
    }
  }

  // ==========================
  // VIEW
  // ==========================

  async function handleView(announcementId) {
    try {
      const user = auth.currentUser;

      if (!user) return;

      const viewRef = doc(
        db,
        "announcements",
        announcementId,
        "views",
        user.uid
      );

      const viewSnap = await getDoc(viewRef);

      if (viewSnap.exists()) return;

      await setDoc(viewRef, {
        viewed: true,
        createdAt: serverTimestamp(),
      });

      await updateDoc(
        doc(db, "announcements", announcementId),
        {
          views: increment(1),
        }
      );
    } catch (error) {
      console.error("View Error:", error);
    }
  }
    // ==========================
  // LOAD REPLIES
  // ==========================

  function loadReplies(announcementId, commentId) {
    const q = query(
      collection(
        db,
        "announcements",
        announcementId,
        "comments",
        commentId,
        "replies"
      ),
      orderBy("createdAt", "asc")
    );

    onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReplies((prev) => ({
        ...prev,
        [commentId]: data,
      }));
    });
  }

  // ==========================
  // LOAD COMMENTS
  // ==========================

  const loadComments = useCallback((announcementId) => {
    const q = query(
      collection(
        db,
        "announcements",
        announcementId,
        "comments"
      ),
      orderBy("createdAt", "asc")
    );

    onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setComments((prev) => ({
        ...prev,
        [announcementId]: data,
      }));

      data.forEach((comment) => {
        loadReplies(announcementId, comment.id);
      });
    });
  }, []);

  // ==========================
  // POST COMMENT
  // ==========================

  async function handleComment(announcementId) {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Please log in first.");
        return;
      }

      const text = commentInputs[announcementId]?.trim();

      if (!text) return;

      await addDoc(
        collection(
          db,
          "announcements",
          announcementId,
          "comments"
        ),
        {
          author: user.displayName || user.email,
          text,
          createdAt: serverTimestamp(),
        }
      );

      await updateDoc(
        doc(db, "announcements", announcementId),
        {
          comments: increment(1),
        }
      );

      setCommentInputs((prev) => ({
        ...prev,
        [announcementId]: "",
      }));
    } catch (error) {
      console.error("Comment Error:", error);
    }
  }

  // ==========================
  // POST REPLY
  // ==========================

  async function handleReply(
    announcementId,
    commentId
  ) {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Please log in first.");
        return;
      }

      const text =
        replyInputs[commentId]?.trim();

      if (!text) return;

      await addDoc(
        collection(
          db,
          "announcements",
          announcementId,
          "comments",
          commentId,
          "replies"
        ),
        {
          author:
            user.displayName || user.email,
          text,
          isAdmin: false,
          createdAt: serverTimestamp(),
        }
      );

      setReplyInputs((prev) => ({
        ...prev,
        [commentId]: "",
      }));

      setActiveReply((prev) => ({
        ...prev,
        [commentId]: false,
      }));
    } catch (error) {
      console.error("Reply Error:", error);
    }
  }  useEffect(() => {
    const q = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAnnouncements(data);

      data.forEach((announcement) => {
        handleView(announcement.id);
        loadComments(announcement.id);
      });
    });

    return () => unsubscribe();
  }, [loadComments]);

  return (
    <div className="announcements-page">
      <h1>📢 Barangay Announcements</h1>

      {announcements.length === 0 ? (
        <div className="empty-announcements">
          <h3>No announcements yet.</h3>
          <p>
            Please check back later for official
            barangay announcements.
          </p>
        </div>
      ) : (
        <div className="announcement-list">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="announcement-card"
            >
              {announcement.imageUrl && (
                <img
                  src={announcement.imageUrl}
                  alt={announcement.title}
                  className="announcement-image"
                />
              )}

              <div className="announcement-content">
                <span className="category">
                  {announcement.category}
                </span>

                <h2>{announcement.title}</h2>

                <p>{announcement.content}</p>

                <div className="announcement-actions">
                  <button
                    className="like-btn"
                    onClick={() =>
                      handleLike(announcement.id)
                    }
                  >
                    ❤️ {announcement.likes || 0}
                  </button>

                  <span className="view-count">
                    👁 {announcement.views || 0}
                  </span>

                  <span className="comment-count">
                    💬 {announcement.comments || 0}
                  </span>
                </div>

                <div className="comments-section">
                  {(comments[announcement.id] || [])
                    .length > 0 ? (
                    (comments[announcement.id] || []).map(
                      (comment) => (
                        <div
                          key={comment.id}
                          className="comment-card"
                        >
                          <div className="comment-header">
                            <strong>
                              {comment.author}
                            </strong>

                            <small>
                              {comment.createdAt?.toDate
                                ? comment.createdAt
                                    .toDate()
                                    .toLocaleString()
                                : "Just now"}
                            </small>
                          </div>

                          <p>{comment.text}</p>

                          <button
                            className="reply-btn"
                            onClick={() =>
                              setActiveReply(
                                (prev) => ({
                                  ...prev,
                                  [comment.id]:
                                    !prev[
                                      comment.id
                                    ],
                                })
                              )
                            }
                          >
                            Reply
                          </button>

                          {activeReply[
                            comment.id
                          ] && (
                            <div className="reply-input-container">
                              <input
                                type="text"
                                className="reply-input"
                                placeholder="Write a reply..."
                                value={
                                  replyInputs[
                                    comment.id
                                  ] || ""
                                }
                                onChange={(e) =>
                                  setReplyInputs(
                                    (prev) => ({
                                      ...prev,
                                      [comment.id]:
                                        e.target
                                          .value,
                                    })
                                  )
                                }
                              />

                              <button
                                className="reply-post-btn"
                                onClick={() =>
                                  handleReply(
                                    announcement.id,
                                    comment.id
                                  )
                                }
                              >
                                Post Reply
                              </button>
                            </div>
                          )}                          {(replies[comment.id] || []).map(
                            (reply) => (
                              <div
                                key={reply.id}
                                className="admin-reply"
                              >
                                <strong>
                                  {reply.isAdmin
                                    ? "✔ Barangay Ucab"
                                    : reply.author}
                                </strong>

                                <p>{reply.text}</p>

                                <small>
                                  {reply.createdAt?.toDate
                                    ? reply.createdAt
                                        .toDate()
                                        .toLocaleString()
                                    : "Just now"}
                                </small>
                              </div>
                            )
                          )}
                        </div>
                      )
                    )
                  ) : (
                    <p className="no-comments">
                      No comments yet.
                    </p>
                  )}

                  <div className="comment-input-container">
                    <input
                      type="text"
                      className="comment-input"
                      placeholder="Write a comment..."
                      value={
                        commentInputs[
                          announcement.id
                        ] || ""
                      }
                      onChange={(e) =>
                        setCommentInputs(
                          (prev) => ({
                            ...prev,
                            [announcement.id]:
                              e.target.value,
                          })
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleComment(
                            announcement.id
                          );
                        }
                      }}
                    />

                    <button
                      className="post-comment-btn"
                      onClick={() =>
                        handleComment(
                          announcement.id
                        )
                      }
                    >
                      Post
                    </button>
                  </div>
                </div>

                <small className="posted-date">
                  Posted{" "}
                  {announcement.createdAt?.toDate
                    ? announcement.createdAt
                        .toDate()
                        .toLocaleDateString()
                    : "Just now"}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}