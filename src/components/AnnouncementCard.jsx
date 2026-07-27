import {
  MdThumbUp,
  MdComment,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdPushPin,
  MdAnalytics,
} from "react-icons/md";

import barangaySeal from "../assets/barangayseal.png";
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
}) {
  return (
    <div className="announcement-card">
      <div className="announcement-body">

        {/* OFFICIAL HEADER */}
        <div className="announcement-author">
          <img
            src={barangaySeal}
            alt="Barangay Ucab"
            className="announcement-avatar"
          />

          <div>
            <h4>Barangay Ucab</h4>
            <small>Official Announcement</small>
            <br />
            <small>{date}</small>
          </div>
        </div>

        {/* PINNED */}
        {pinned && (
          <div className="announcement-pin">
            <MdPushPin />
            <span>Pinned</span>
          </div>
        )}

        {/* CATEGORY */}
        <span
          className={`announcement-category ${
            category ? category.toLowerCase() : ""
          }`}
        >
          {category}
        </span>

        {/* TITLE */}
        <h3>{title}</h3>

        {/* CONTENT */}
        <p className="announcement-content">
          {content}
        </p>

        {/* IMAGE */}
        {image && (
          <img
            src={image}
            alt={title}
            className="announcement-image"
          />
        )}

        {/* STATS */}
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

        {/* ACTION BUTTONS */}
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