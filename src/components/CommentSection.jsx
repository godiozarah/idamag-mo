import { useState } from "react";
import "./CommentSection.css";

export default function CommentSection({

  comments = [],
  onAddComment,

}) {

  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {

    e.preventDefault();

    if (!comment.trim()) return;

    if (onAddComment) {
      onAddComment(comment);
    }

    setComment("");

  };

  return (

    <div className="comment-section">

      <h3>Comments</h3>

      {comments.length === 0 && (

        <p>No comments yet.</p>

      )}

      {comments.map((item, index) => (

        <div
          key={index}
          className="comment-card"
        >

          <strong>
            Resident #{item.residentNumber}
          </strong>

          <p>{item.comment}</p>

          <small>{item.createdAt}</small>

        </div>

      ))}

      <form onSubmit={handleSubmit}>

        <textarea
          rows="3"
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) =>
            setComment(e.target.value)
          }
        />

        <button type="submit">

          Post Comment

        </button>

      </form>

    </div>

  );

}