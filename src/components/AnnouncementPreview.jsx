import {
  MdThumbUp,
  MdComment,
  MdVisibility,
  MdPushPin,
} from "react-icons/md";

import "./AnnouncementPreview.css";

export default function AnnouncementPreview({
  title,
  category,
  content,
  imagePreview,
  scheduleDate,
  isPinned,
}) {
  return (
    <div className="preview-card">
      <h2>Live Preview</h2>

      {isPinned && (
        <div className="pinned-badge">
          <MdPushPin />
          <span>Pinned Announcement</span>
        </div>
      )}

      {/* Show image only if uploaded */}
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Announcement Preview"
          className="preview-img"
        />
      )}

      <div className="preview-content">
        <span
          className={`preview-category ${category.toLowerCase()}`}
        >
          {category}
        </span>

        <h3>
          {title || "Announcement Title"}
        </h3>

        <p className="preview-date">
          {scheduleDate
            ? new Date(scheduleDate).toLocaleDateString()
            : "No schedule selected"}
        </p>

        <p className="preview-text">
          {content ||
            "Your announcement content will appear here as you type."}
        </p>
      </div>

      <div className="preview-footer">
        <div className="preview-stat">
          <MdThumbUp />
          <span>0</span>
        </div>

        <div className="preview-stat">
          <MdComment />
          <span>0</span>
        </div>

        <div className="preview-stat">
          <MdVisibility />
          <span>0</span>
        </div>
      </div>
    </div>
  );
}