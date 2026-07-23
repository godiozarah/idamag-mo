import {
  MdThumbUp,
  MdComment,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdPushPin,
  MdAnalytics,
  MdForum,
} from "react-icons/md";

import "./AnnouncementCard.css";

export default function AnnouncementCard({
  title,
  category,
  content,
  image,
  date,
  likes = 0,
  comments = 0,
  views = 0,
  pinned = false,
  onEdit,
  onDelete,
  onPin,
  onAnalytics,
  onComments,
}) {
  return (
    <div className="announcement-card">
      {image && (
        <img
          src={image}
          alt={title}
          className="announcement-image"
        />
      )}

      <div className="announcement-body">
        {pinned && (
          <div className="announcement-pin">
            <MdPushPin />
            <span>Pinned</span>
          </div>
        )}

        <span
          className={`announcement-category ${
            category ? category.toLowerCase() : ""
          }`}
        >
          {category}
        </span>

        <h3>{title}</h3>

        <p className="announcement-date">{date}</p>

        <p className="announcement-content">{content}</p>

        <div className="announcement-stats">
          <div>
            <MdThumbUp />
            <span>{likes}</span>
          </div>

          <div>
            <MdComment />
            <span>{comments}</span>
          </div>

          <div>
            <MdVisibility />
            <span>{views}</span>
          </div>
        </div>

        <div className="announcement-actions">
          <button
            className="edit-btn"
            onClick={onEdit}
            type="button"
          >
            <MdEdit />
            Edit
          </button>

          <button
            className="pin-btn"
            onClick={onPin}
            type="button"
          >
            <MdPushPin />
            {pinned ? "Unpin" : "Pin"}
          </button>

          <button
            className="comments-btn"
            onClick={onComments}
            type="button"
          >
            <MdForum />
            Comments
          </button>

          <button
            className="analytics-btn"
            onClick={onAnalytics}
            type="button"
          >
            <MdAnalytics />
            Analytics
          </button>

          <button
            className="delete-btn"
            onClick={onDelete}
            type="button"
          >
            <MdDelete />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}