import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import "./CommentsModal.css";

export default function CommentsModal({
  announcement,
  onClose,
}) {
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState({});
  const [replyInputs, setReplyInputs] = useState({});

  // ==========================
  // LOAD REPLIES
  // ==========================

  const loadReplies = useCallback((commentId) => {
  const q = query(
    collection(
      db,
      "announcements",
      announcement.id,
      "comments",
      commentId,
      "replies"
    ),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    setReplies((prev) => ({
      ...prev,
      [commentId]: data,
    }));
  });
}, [announcement]);
  // ==========================
  // LOAD COMMENTS
  // ==========================

  useEffect(() => {
    if (!announcement) return;

    const q = query(
      collection(
        db,
        "announcements",
        announcement.id,
        "comments"
      ),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentData = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setComments(commentData);

      commentData.forEach((comment) => {
        loadReplies(comment.id);
      });
    });

    return () => {
      unsubscribe();
    };
  }, [announcement, loadReplies]);

  // ==========================
  // REPLY
  // ==========================

  async function handleReply(commentId) {
    const text = replyInputs[commentId]?.trim();

    if (!text) return;

    try {
      await addDoc(
        collection(
          db,
          "announcements",
          announcement.id,
          "comments",
          commentId,
          "replies"
        ),
        {
          author: "Barangay Ucab",
          text,
          isAdmin: true,
          createdAt: serverTimestamp(),
        }
      );

      setReplyInputs((prev) => ({
        ...prev,
        [commentId]: "",
      }));
    } catch (error) {
      console.error("Reply Error:", error);
    }
  }

  // ==========================
  // DELETE COMMENT
  // ==========================

  async function handleDelete(commentId) {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await deleteDoc(
        doc(
          db,
          "announcements",
          announcement.id,
          "comments",
          commentId
        )
      );
    } catch (error) {
      console.error("Delete Error:", error);
    }
  }

  if (!announcement) return null;

  return (
    <div className="comments-overlay">
      <div className="comments-modal">
        <div className="comments-modal-header">
  <h2>💬 {announcement.title}</h2>

  <button
    className="close-comments-btn"
    onClick={onClose}
  >
    ✕
  </button>
</div>

        {comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="comment-card"
            >
              <div className="comment-header">
                <strong>{comment.author}</strong>

                <small>
                  {comment.createdAt?.toDate
                    ? comment.createdAt
                        .toDate()
                        .toLocaleString()
                    : "Just now"}
                </small>
              </div>

              <p>{comment.text}</p>

              {(replies[comment.id] || []).map((reply) => (
                <div
                  key={reply.id}
                  className="admin-reply"
                >
                  <strong>✔ Barangay Ucab</strong>

                  <p>{reply.text}</p>

                  <small>
                    {reply.createdAt?.toDate
                      ? reply.createdAt
                          .toDate()
                          .toLocaleString()
                      : "Just now"}
                  </small>
                </div>
              ))}

              <textarea
                placeholder="Write a reply..."
                value={replyInputs[comment.id] || ""}
                onChange={(e) =>
                  setReplyInputs((prev) => ({
                    ...prev,
                    [comment.id]: e.target.value,
                  }))
                }
              />

              <div className="comment-buttons">
                <button
                  onClick={() => handleReply(comment.id)}
                >
                  Reply
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(comment.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}

        <button
          className="close-btn"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}