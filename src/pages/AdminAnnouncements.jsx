import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  MdCampaign,
  MdPushPin,
  MdThumbUp,
  MdVisibility,
  MdCloudUpload,
  MdCalendarToday,
  MdArchive,
  MdSearch,
} from "react-icons/md";

import "./AdminAnnouncements.css";

import AnnouncementPreview from "../components/AnnouncementPreview";

import { db, storage } from "../firebase";

import {
 collection,
addDoc,
query,
orderBy,
onSnapshot,
serverTimestamp,
deleteDoc,
doc,
updateDoc,
getDocs,
getDoc
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export default function AdminAnnouncements() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Health");
  const [content, setContent] = useState("");

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [isPinned, setIsPinned] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  const [loading, setLoading] = useState(false);

  const [announcements, setAnnouncements] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");

  // Analytics Modal
  const [analyticsAnnouncement, setAnalyticsAnnouncement] = useState(null);
  const [analyticsLikes, setAnalyticsLikes] = useState([]);
  const [analyticsViews, setAnalyticsViews] = useState([]);
    const publishedSectionRef = useRef(null);
  // ==========================
// COMMENTS
// ==========================

const [comments, setComments] = useState({});

const [replies, setReplies] = useState({});

const [replyInputs, setReplyInputs] = useState({});

const [activeReply, setActiveReply] = useState({});
/* ===========================
   IMAGE
=========================== */

const handleImageChange = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  setImage(file);
  setImagePreview(URL.createObjectURL(file));
};

/* ===========================
   LOAD
=========================== */

useEffect(() => {
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
  });

  return () => unsubscribe();
}, []);

/* ===========================
   PUBLISH / UPDATE
=========================== */

const handlePublish = async () => {
  try {
    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    if (!content.trim()) {
      alert("Please enter announcement content.");
      return;
    }

    setLoading(true);

    let imageUrl = "";

    if (editingId) {
      const existing = announcements.find(
        (a) => a.id === editingId
      );

      imageUrl = existing?.imageUrl || "";
    }

    if (image) {
      const imageRef = ref(
        storage,
        `announcements/${Date.now()}-${image.name}`
      );

      await uploadBytes(imageRef, image);

      imageUrl = await getDownloadURL(imageRef);
    }

    const payload = {
      title,
      category,
      content,
      imageUrl,
      author: "Barangay Admin",
      scheduleDate: scheduleDate || null,
      isPinned,
      updatedAt: serverTimestamp(),
    };

    if (editingId) {
      await updateDoc(
        doc(db, "announcements", editingId),
        payload
      );

      toast.success("Announcement updated successfully!");
    } else {
      await addDoc(
        collection(db, "announcements"),
        {
          ...payload,
          likes: 0,
          comments: 0,
          views: 0,
          status: "Published",
          createdAt: serverTimestamp(),
        }
      );

      toast.success("Announcement published successfully!");
    }

    setEditingId(null);
    setTitle("");
    setCategory("Health");
    setContent("");
    setImage(null);
    setImagePreview("");
    setScheduleDate("");
    setIsPinned(false);
  } catch (error) {
    console.error(error);
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};
 /* ===========================
   DELETE
=========================== */

const handleDelete = async (announcement) => {
  const confirmDelete = window.confirm(
    `Delete "${announcement.title}"?`
  );

  if (!confirmDelete) return;

  try {
    await deleteDoc(
      doc(db, "announcements", announcement.id)
    );

    toast.success("Announcement deleted successfully!");
  } catch (error) {
    console.error(error);
    alert("Failed to delete announcement.");
  }
};

/* ===========================
   EDIT
=========================== */

const handleEdit = (announcement) => {
  setEditingId(announcement.id);

  setTitle(announcement.title);
  setCategory(announcement.category);
  setContent(announcement.content);

  setIsPinned(announcement.isPinned || false);

  setScheduleDate(
    announcement.scheduleDate || ""
  );

  setImage(null);

  setImagePreview(
    announcement.imageUrl || ""
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

/* ===========================
   PIN / UNPIN
=========================== */

const handlePin = async (announcement) => {
  try {
    await updateDoc(
      doc(db, "announcements", announcement.id),
      {
        isPinned: !announcement.isPinned,
        updatedAt: serverTimestamp(),
      }
    );
  } catch (error) {
    console.error(error);
    alert("Unable to update pin.");
  }
};

  /* ===========================
     ARCHIVE
  ============================ */

  const handleArchive = async (
    announcement
  ) => {
    try {
      await updateDoc(
        doc(db, "announcements", announcement.id),
        {
          status: "Archived",
          updatedAt: serverTimestamp(),
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  /* ===========================
     RESTORE
  ============================ */

  const handleRestore = async (
    announcement
  ) => {
    try {
      await updateDoc(
        doc(db, "announcements", announcement.id),
        {
          status: "Published",
          updatedAt: serverTimestamp(),
        }
      );
    } catch (error) {
      console.error(error);
    }
  };
/* ===========================
   LOAD COMMENTS
=========================== */

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

  return onSnapshot(q, (snapshot) => {
    setReplies((prev) => ({
      ...prev,
      [commentId]: snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    }));
  });
}

function loadComments(announcementId) {
  const q = query(
    collection(
      db,
      "announcements",
      announcementId,
      "comments"
    ),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setComments((prev) => ({
      ...prev,
      [announcementId]: data,
    }));

    data.forEach((comment) => {
      loadReplies(
        announcementId,
        comment.id
      );
    });
  });
}
useEffect(() => {
  const unsubscribers = announcements.map((announcement) =>
    loadComments(announcement.id)
  );

   return () => {
    unsubscribers.forEach((unsubscribe) => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    });
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [announcements]);
/* ===========================
   REPLY TO COMMENT
=========================== */

const handleReply = async (announcementId, commentId) => {
  const text = (replyInputs[commentId] || "").trim();

  if (!text) return;

  try {
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
        text,
        isAdmin: true,
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
    console.error(error);
    toast.error("Failed to send reply.");
  }
};
const openAnalytics = async (announcement) => {
  console.log("Opening analytics...");

  setAnalyticsAnnouncement(announcement);

  try {
    const likesSnapshot = await getDocs(
      collection(db, "announcements", announcement.id, "likes")
    );

    console.log("Likes:", likesSnapshot.size);

    const viewsSnapshot = await getDocs(
      collection(db, "announcements", announcement.id, "views")
    );

    console.log("Views:", viewsSnapshot.size);

    const likes = await Promise.all(
  likesSnapshot.docs.map(async (likeDoc) => {
    const userSnap = await getDoc(
      doc(db, "users", likeDoc.id)
    );

    return {
      id: likeDoc.id,
      ...(userSnap.exists() ? userSnap.data() : {}),
    };
  })
);

setAnalyticsLikes(likes);

    const views = await Promise.all(
  viewsSnapshot.docs.map(async (viewDoc) => {
    const userSnap = await getDoc(
      doc(db, "users", viewDoc.id)
    );

    return {
      id: viewDoc.id,
      ...(userSnap.exists() ? userSnap.data() : {}),
    };
  })
);

setAnalyticsViews(views);

  } catch (error) {
    console.error("Analytics Error:", error);
  }
};
  /* ===========================
     FILTERS
  ============================ */

  const filteredAnnouncements = useMemo(() => {
  return announcements.filter((a) => {
    const matchesSearch =
      (a.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (a.content || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    switch (filter) {
      case "Published":
        return matchesSearch && a.status === "Published";

      case "Archived":
        return matchesSearch && a.status === "Archived";

      case "Pinned":
        return matchesSearch && a.isPinned;

      default:
        return matchesSearch;
    }
  });
}, [announcements, searchTerm, filter]);
  /* ===========================
     ANALYTICS
  ============================ */

  const totalLikes =
    announcements.reduce(
      (sum, item) =>
        sum + (item.likes || 0),
      0
    );

  const totalViews =
    announcements.reduce(
      (sum, item) =>
        sum + (item.views || 0),
      0
    );
  const publishedCount =
    announcements.filter(
      (a) =>
        a.status === "Published"
    ).length;

  const archivedCount =
    announcements.filter(
      (a) =>
        a.status === "Archived"
    ).length;

  const pinnedCount =
    announcements.filter(
      (a) => a.isPinned
    ).length;

  return (
    <div className="announcement-page">

  {/* ===========================
      HEADER
  ============================ */}

  <div className="page-header">
    <h1>📢 Manage Announcements</h1>
    <p>
      Create, edit, archive and monitor official Barangay
      announcements.
    </p>
  </div>

  {/* ===========================
      ANALYTICS
  ============================ */}

  <div className="stats-grid">

    <div className="stat-card">
      <MdCampaign className="stat-icon" />
      <div>
        <h3>{publishedCount}</h3>
        <p>Published</p>
      </div>
    </div>

    <div className="stat-card">
      <MdArchive className="stat-icon" />
      <div>
        <h3>{archivedCount}</h3>
        <p>Archived</p>
      </div>
    </div>

    <div className="stat-card">
      <MdPushPin className="stat-icon" />
      <div>
        <h3>{pinnedCount}</h3>
        <p>Pinned</p>
      </div>
    </div>

    <div className="stat-card">
      <MdThumbUp className="stat-icon" />
      <div>
        <h3>{totalLikes}</h3>
        <p>Total Likes</p>
      </div>
    </div>

    <div className="stat-card">
      <MdVisibility className="stat-icon" />
      <div>
        <h3>{totalViews}</h3>
        <p>Total Views</p>
      </div>
    </div>

  </div>

  {/* ===========================
      SEARCH & FILTER
  ============================ */}

  <div className="announcement-toolbar">

    <div className="search-box">
      <MdSearch />
      <input
        type="text"
        placeholder="Search announcements..."
        value={searchTerm}
        onChange={(e) =>
          setSearchTerm(e.target.value)
        }
      />
    </div>

    <select
  value={filter}
  onChange={(e) => {
    setFilter(e.target.value);

    setTimeout(() => {
      publishedSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }}
>
      <option>All</option>
      <option>Published</option>
      <option>Pinned</option>
      <option>Archived</option>
    </select>

  </div>

  {/* ===========================
      FORM + PREVIEW
  ============================ */}

  <div className="announcement-grid">

    <div className="announcement-form">

      <h2>
        {editingId
          ? "Edit Announcement"
          : "Create Announcement"}
      </h2>

      <label>Announcement Title</label>

      <input
        type="text"
        value={title}
        placeholder="Enter announcement title..."
        onChange={(e) =>
          setTitle(e.target.value)
        }
      />

      <label>Category</label>

      <select
        value={category}
        onChange={(e) =>
          setCategory(e.target.value)
        }
      >
        <option>Health</option>
        <option>Education</option>
        <option>Disaster</option>
        <option>Events</option>
        <option>Sports</option>
        <option>Traffic</option>
        <option>Emergency</option>
        <option>Others</option>
      </select>

      <label>Upload Image</label>

      <div className="upload-box">

        <MdCloudUpload className="upload-icon" />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

      </div>

      <label>Announcement Content</label>

      <textarea
        rows="7"
        value={content}
        placeholder="Write your announcement..."
        onChange={(e) =>
          setContent(e.target.value)
        }
      />

      <div className="pin-row">

        <label>

          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) =>
              setIsPinned(e.target.checked)
            }
          />

          Pin Announcement

        </label>

      </div>

      <label className="date-label">

        <MdCalendarToday />

        Schedule Date

      </label>

      <input
        type="date"
        value={scheduleDate}
        onChange={(e) =>
          setScheduleDate(e.target.value)
        }
      />

      <button
        className="publish-btn"
        disabled={loading}
        onClick={handlePublish}
      >
        {loading
          ? "Saving..."
          : editingId
          ? "Update Announcement"
          : "Publish Announcement"}
      </button>
      {editingId && (
  <button
    className="cancel-btn"
    type="button"
    onClick={() => {
      setEditingId(null);
      setTitle("");
      setCategory("Health");
      setContent("");
      setImage(null);
      setImagePreview("");
      setScheduleDate("");
      setIsPinned(false);
    }}
  >
    Cancel Editing
  </button>
)}

    </div>

    <AnnouncementPreview
      title={title}
      category={category}
      content={content}
      imagePreview={imagePreview}
      scheduleDate={scheduleDate}
      isPinned={isPinned}
    />

  </div>
{/* ===========================
    PUBLISHED ANNOUNCEMENTS
=========================== */}

<div
  className="published-section"
  ref={publishedSectionRef}
>
  <h2>
    {filter === "All"
      ? "All Announcements"
      : `${filter} Announcements`}
  </h2>

  {filteredAnnouncements.length === 0 ? (
    <div className="empty-state">
      <h3>No announcements found.</h3>
    </div>
  ) : (
    filteredAnnouncements.map((announcement) => (
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

          <div className="announcement-header">

            <div>

              <span className="category">
                {announcement.category}
              </span>

              <h2>{announcement.title}</h2>

            </div>

            {announcement.isPinned && (
              <span className="pinned-badge">
                📌 Pinned
              </span>
            )}

          </div>

          <p>{announcement.content}</p>

          <div className="announcement-actions">

            <span>
              ❤️ {announcement.likes || 0}
            </span>

            <span>
              💬 {announcement.comments || 0}
            </span>

            <span>
              👁 {announcement.views || 0}
            </span>

          </div>

          {/* COMMENTS START HERE */}

  {/* COMMENTS START HERE */}
  <div className="comments-section">

  {(comments[announcement.id] || []).length === 0 ? (
    <p className="no-comments">
      No comments yet.
    </p>
  ) : (
    (comments[announcement.id] || []).map((comment) => (
      <div
        key={comment.id}
        className="comment-card"
      >
        <div className="comment-header">

          <strong>
            {comment.residentNumber
              ? `Resident #${String(
                  comment.residentNumber
                ).padStart(4, "0")}`
              : "Resident"}
          </strong>

          <small>
            {comment.createdAt?.toDate?.().toLocaleString()}
          </small>

        </div>

        <p>{comment.text}</p>

        {(replies[comment.id] || []).map((reply) => (
          <div
            key={reply.id}
            className="reply-card"
          >
            <strong>
              {reply.isAdmin
                ? "✔ Barangay Ucab"
                : reply.residentNumber
                ? `Resident #${String(
                    reply.residentNumber
                  ).padStart(4, "0")}`
                : "Resident"}
            </strong>

            <p>{reply.text}</p>
          </div>
        ))}

        {activeReply[comment.id] ? (
          <div className="reply-box">

            <textarea
              placeholder="Write a reply..."
              value={
                replyInputs[comment.id] || ""
              }
              onChange={(e) =>
                setReplyInputs((prev) => ({
                  ...prev,
                  [comment.id]: e.target.value,
                }))
              }
            />

            <div className="reply-actions">

              <button
                className="send-reply-btn"
                onClick={() =>
                  handleReply(
                    announcement.id,
                    comment.id
                  )
                }
              >
                Send Reply
              </button>

              <button
                className="cancel-reply-btn"
                onClick={() =>
                  setActiveReply((prev) => ({
                    ...prev,
                    [comment.id]: false,
                  }))
                }
              >
                Cancel
              </button>

            </div>

          </div>
        ) : (
          <button
            className="reply-btn"
            onClick={() =>
              setActiveReply((prev) => ({
                ...prev,
                [comment.id]: true,
              }))
            }
          >
            Reply
          </button>
        )}

      </div>
    ))
  )}

</div>

{/* COMMENTS END HERE */}
<div className="announcement-extra-actions">

  <button
    className="edit-btn"
    onClick={() => handleEdit(announcement)}
  >
    Edit
  </button>

  <button
    className="pin-btn"
    onClick={() => handlePin(announcement)}
  >
    {announcement.isPinned ? "Unpin" : "Pin"}
  </button>

  <button
  className="analytics-btn"
  onClick={() => {
    console.log("Analytics clicked");
    openAnalytics(announcement);
  }}
>
  Analytics
</button>

  {(announcement.status || "Published") === "Published" ? (
    <>
      <button
        className="archive-btn"
        onClick={() => handleArchive(announcement)}
      >
        Archive
      </button>

      <button
        className="delete-btn"
        onClick={() => handleDelete(announcement)}
      >
        Delete
      </button>
    </>
  ) : (
    <button
      className="restore-btn"
      onClick={() => handleRestore(announcement)}
    >
      Restore
    </button>
  )}

</div>

        </div>
      </div>
    ))
  )}
</div>
{/* ===========================
    ANALYTICS MODAL
=========================== */}

{analyticsAnnouncement && (
  <div className="analytics-modal-overlay">
    <div className="analytics-modal">

      <div className="analytics-header">

  <h2>📊 Announcement Analytics</h2>

  <button
    className="analytics-close"
    onClick={() => setAnalyticsAnnouncement(null)}
  >
    &times;
  </button>

</div>

      <div className="analytics-grid">

        <div className="analytics-card">
          <h4>Title</h4>
          <p>{analyticsAnnouncement.title}</p>
        </div>

        <div className="analytics-card">
          <h4>Category</h4>
          <p>{analyticsAnnouncement.category}</p>
        </div>

        <div className="analytics-card">
          <h4>Status</h4>
          <p>
            {analyticsAnnouncement.status || "Published"}
          </p>
        </div>

        <div className="analytics-card">
          <h4>Pinned</h4>
          <p>
            {analyticsAnnouncement.isPinned
              ? "Yes"
              : "No"}
          </p>
        </div>

        <div className="analytics-card">
          <h4>❤️ Likes</h4>
          <h3>{analyticsAnnouncement.likes || 0}</h3>
        </div>

        <div className="analytics-card">
          <h4>💬 Comments</h4>
          <h3>{analyticsAnnouncement.comments || 0}</h3>
        </div>

        <div className="analytics-card">
          <h4>👁 Views</h4>
          <h3>{analyticsAnnouncement.views || 0}</h3>
        </div>

      </div>
{/* PEOPLE WHO LIKED */}

<div className="analytics-list">

  <h3>❤️ Residents Who Liked</h3>

  {analyticsLikes.length === 0 ? (
    <p>No likes yet.</p>
  ) : (
    analyticsLikes.map((person) => (
      <div
        key={person.id}
        className="analytics-person"
      >
        <img
          src={person.avatar || "/default-avatar.png"}
          alt="avatar"
          className="analytics-avatar"
        />

        <div>
          <strong>
            Resident #
            {String(
              person.residentNumber || 0
            ).padStart(4, "0")}
          </strong>
        </div>

      </div>
    ))
  )}

</div>

{/* PEOPLE WHO VIEWED */}

<div className="analytics-list">

  <h3>👁 Residents Who Viewed</h3>

  {analyticsViews.length === 0 ? (
    <p>No views yet.</p>
  ) : (
    analyticsViews.map((person) => (
      <div
        key={person.id}
        className="analytics-person"
      >
        <img
          src={person.avatar || "/default-avatar.png"}
          alt="avatar"
          className="analytics-avatar"
        />

        <div>
          <strong>
            Resident #
            {String(
              person.residentNumber || 0
            ).padStart(4, "0")}
          </strong>
        </div>

      </div>
    ))
  )}

</div>
      <div className="analytics-actions">

        <button
          className="close-modal-btn"
          onClick={() =>
            setAnalyticsAnnouncement(null)
          }
        >
          Close
        </button>

      </div>

    </div>
  </div>
)}  
</div>
);
}