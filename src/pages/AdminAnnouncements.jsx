import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import CommentsModal from "../components/CommentsModal";
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
import AnnouncementCard from "../components/AnnouncementCard";

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

  // Comments Modal
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  // Analytics Modal
  const [analyticsAnnouncement, setAnalyticsAnnouncement] = useState(null);

  const publishedSectionRef = useRef(null);
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
   COMMENTS
=========================== */

const handleComments = (announcement) => {
  setSelectedAnnouncement(announcement);
  setShowCommentsModal(true);
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
      <h3>No announcements found</h3>

      <p>
        Try changing the search or filter,
        or create your first announcement.
      </p>
    </div>
  ) : (
    filteredAnnouncements.map((announcement) => (
      <div
        key={announcement.id}
        className="announcement-wrapper"
      >
        <AnnouncementCard
          title={announcement.title}
          category={announcement.category}
          content={announcement.content}
          image={announcement.imageUrl}
          date={
            announcement.createdAt?.toDate
              ? announcement.createdAt
                  .toDate()
                  .toLocaleDateString()
              : "Just now"
          }
          likes={announcement.likes || 0}
          comments={announcement.comments || 0}
          views={announcement.views || 0}
          pinned={announcement.isPinned}
          onEdit={() => handleEdit(announcement)}
          onDelete={() => handleDelete(announcement)}
          onPin={() => handlePin(announcement)}
          onComments={() => handleComments(announcement)}
          onAnalytics={() =>
            setAnalyticsAnnouncement(announcement)
          }
        />

        <div className="announcement-extra-actions">
          {(announcement.status || "Published") ===
          "Published" ? (
            <button
              className="archive-btn"
              onClick={() =>
                handleArchive(announcement)
              }
            >
              <MdArchive />
              Archive
            </button>
          ) : (
            <button
              className="restore-btn"
              onClick={() =>
                handleRestore(announcement)
              }
            >
              <MdCampaign />
              Restore
            </button>
          )}
        </div>
      </div>
    ))
  )}
</div>

{/* ===========================
    COMMENTS MODAL
=========================== */}

{showCommentsModal && (
  <CommentsModal
    announcement={selectedAnnouncement}
    onClose={() => {
      setShowCommentsModal(false);
      setSelectedAnnouncement(null);
    }}
  />
)}

{/* ===========================
    ANALYTICS MODAL
=========================== */}

{analyticsAnnouncement && (
  <div className="analytics-modal-overlay">
    <div className="analytics-modal">
      <h2>📊 Announcement Analytics</h2>

      <div className="analytics-item">
        <strong>Title</strong>
        <span>{analyticsAnnouncement.title}</span>
      </div>

      <div className="analytics-item">
        <strong>Category</strong>
        <span>{analyticsAnnouncement.category}</span>
      </div>

      <div className="analytics-item">
        <strong>Likes</strong>
        <span>{analyticsAnnouncement.likes || 0}</span>
      </div>

      <div className="analytics-item">
        <strong>Comments</strong>
        <span>{analyticsAnnouncement.comments || 0}</span>
      </div>

      <div className="analytics-item">
        <strong>Views</strong>
        <span>{analyticsAnnouncement.views || 0}</span>
      </div>

      <div className="analytics-item">
        <strong>Status</strong>
        <span>
          {analyticsAnnouncement.status || "Published"}
        </span>
      </div>

      <div className="analytics-item">
        <strong>Pinned</strong>
        <span>
          {analyticsAnnouncement.isPinned ? "Yes" : "No"}
        </span>
      </div>

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
)}

</div>
);
}