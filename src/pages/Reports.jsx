import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";

import { auth, db, storage } from "../firebase";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

import Swal from "sweetalert2";

import {
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaTrash,
  FaSearch,
  FaPaperPlane,
} from "react-icons/fa";


export default function Reports() {

  // ==========================
  // STATES
  // ==========================

  const [title, setTitle] = useState("");

  const [image, setImage] = useState(null);

  const [imagePreview, setImagePreview] = useState("");

  const [category, setCategory] = useState("");

  const [concern, setConcern] = useState("");

  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  


  // ADMIN EMAIL
  const adminEmail = "admin@ucab.com";


 // ==========================
// LOAD REPORTS
// ==========================

useEffect(() => {

  const reportsRef = collection(db, "reports");

  const unsubscribe = onSnapshot(

    reportsRef,

    (snapshot) => {

      const allReports = snapshot.docs.map((document) => ({

        id: document.id,
        ...document.data(),

      }));

      // Everyone (resident & admin) can see all reports
      setReports(allReports);

      setLoading(false);

    },

    (error) => {

      console.error("Error loading reports:", error);

      setLoading(false);

    }

  );

  return () => unsubscribe();

}, []);



  // ==========================
  // SUBMIT REPORT
  // ==========================

  const submitReport = async () => {

    console.log("Submit button clicked");


    if (
      title.trim() === "" ||
      category.trim() === "" ||
      concern.trim() === ""
    ) {

      Swal.fire({
        icon: "warning",
        title: "Incomplete Information",
        text: "Please fill in all required fields.",
      });

      return;

    }



    const user = auth.currentUser;


    if (!user) {

      Swal.fire({
        icon: "error",
        title: "Not Logged In",
        text: "Please login first.",
      });

      return;

    }
let imageUrl = "";


if(image){

const imageRef =
ref(
storage,
`reports/${Date.now()}-${image.name}`
);


await uploadBytes(
imageRef,
image
);


imageUrl =
await getDownloadURL(
imageRef
);

}


    try {


     const userDoc = await getDoc(doc(db, "users", user.uid));

if (!userDoc.exists()) {
  alert("User profile not found.");
  return;
}

const userData = userDoc.data();

await addDoc(collection(db, "reports"), {
  title,
  category,
  concern,

  status: "Pending",

  adminSolution: "",
  imageUrl,

  residentNumber: userData.residentNumber,
  reporterEmail: user.email,

  userId: user.uid,

  createdAt: serverTimestamp(),
});

      setTitle("");

      setCategory("");

      setConcern("");
      setImage(null);
      setImagePreview("");



      Swal.fire({
        icon: "success",
        title: "Report Submitted",
        text: "Your concern has been sent to the barangay.",
        timer: 2000,
        showConfirmButton: false,
      });



    } catch (error) {


      console.error(
        "Submit error:",
        error
      );


      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Unable to submit report.",
      });


    }

  };




  // ==========================
  // DELETE REPORT
  // ==========================

  const deleteReport = async (reportId) => {


    const result =
      await Swal.fire({

        title:
          "Delete Report?",

        text:
          "This action cannot be undone.",

        icon:
          "warning",


        showCancelButton:
          true,


        confirmButtonColor:
          "#d33",


        cancelButtonColor:
          "#6c757d",


        confirmButtonText:
          "Yes, Delete",

      });



    if (!result.isConfirmed)
      return;



    try {


      await deleteDoc(
        doc(
          db,
          "reports",
          reportId
        )
      );



      Swal.fire({

        icon:
          "success",

        title:
          "Deleted",

        text:
          "Report removed successfully.",

        timer:
          1500,

        showConfirmButton:
          false,

      });



    } catch (error) {


      console.error(
        error
      );


      Swal.fire({

        icon:
          "error",

        title:
          "Delete Failed",

        text:
          "Unable to delete report.",

      });


    }


  };



  // ==========================
  // STATUS HELPERS
  // ==========================


  const getStatusClass = (status) => {


    switch(status) {


      case "Resolved":

        return "success";


      case "In Progress":

        return "primary";


      case "Declined":

        return "danger";


      default:

        return "warning";


    }

  };




  const getProgressValue = (status) => {


    switch(status) {


      case "Resolved":

        return 100;


      case "In Progress":

        return 60;


      case "Declined":

        return 100;


      default:

        return 25;


    }

  };




  const formatDate = (timestamp) => {


    if (!timestamp)
      return "Just now";


    return timestamp
      .toDate()
      .toLocaleDateString(
        "en-PH",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );


  };
  // ==========================
  // STATISTICS
  // ==========================

  const totalReports = reports.length;


  const pendingReports =
    reports.filter(
      (report) =>
        report.status === "Pending"
    ).length;


  const progressReports =
    reports.filter(
      (report) =>
        report.status === "In Progress"
    ).length;


  const resolvedReports =
    reports.filter(
      (report) =>
        report.status === "Resolved"
    ).length;



  // ==========================
  // FILTER REPORTS
  // ==========================


  const filteredReports =
    reports.filter((report) => {


      const searchText =
        search.toLowerCase();



      const matchesSearch =
        report.title
          ?.toLowerCase()
          .includes(searchText) ||

        report.category
          ?.toLowerCase()
          .includes(searchText) ||

        report.concern
          ?.toLowerCase()
          .includes(searchText);



      const matchesStatus =
        statusFilter === "All" ||
        report.status === statusFilter;



      return (
        matchesSearch &&
        matchesStatus
      );


    });



  return (

    <div className="container-fluid py-4 bg-light min-vh-100">


      {/* ==========================
          HEADER
      ========================== */}


      <div className="mb-4">


        <h1
          className="fw-bold text-success"
        >

          Resident Reports

        </h1>


        <p className="text-muted">

          Submit concerns and monitor barangay responses.

        </p>


      </div>





      {
      
  /* ==========================
          STATISTICS CARDS
      ========================== */}


      <div className="row g-3 mb-4">


        <div className="col-12 col-md-3">


          <div className="card shadow-sm border-0 h-100">


            <div className="card-body d-flex align-items-center">


              <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">

                <FaFileAlt
                  className="text-success fs-4"
                />

              </div>


              <div>


                <h6 className="text-muted mb-1">

                  Total Reports

                </h6>


                <h3 className="fw-bold mb-0">

                  {totalReports}

                </h3>


              </div>


            </div>


          </div>


        </div>





        <div className="col-12 col-md-3">


          <div className="card shadow-sm border-0 h-100">


            <div className="card-body d-flex align-items-center">


              <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">


                <FaClock
                  className="text-warning fs-4"
                />


              </div>



              <div>


                <h6 className="text-muted mb-1">

                  Pending

                </h6>


                <h3 className="fw-bold mb-0">

                  {pendingReports}

                </h3>


              </div>


            </div>


          </div>


        </div>





        <div className="col-12 col-md-3">


          <div className="card shadow-sm border-0 h-100">


            <div className="card-body d-flex align-items-center">


              <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">


                <FaSpinner
                  className="text-primary fs-4"
                />


              </div>



              <div>


                <h6 className="text-muted mb-1">

                  In Progress

                </h6>


                <h3 className="fw-bold mb-0">

                  {progressReports}

                </h3>


              </div>


            </div>


          </div>


        </div>





        <div className="col-12 col-md-3">


          <div className="card shadow-sm border-0 h-100">


            <div className="card-body d-flex align-items-center">


              <div className="bg-success bg-opacity-25 rounded-circle p-3 me-3">


                <FaCheckCircle
                  className="text-success fs-4"
                />


              </div>



              <div>


                <h6 className="text-muted mb-1">

                  Resolved

                </h6>


                <h3 className="fw-bold mb-0">

                  {resolvedReports}

                </h3>


              </div>


            </div>


          </div>


        </div>



      </div>






      {/* ==========================
          SUBMIT REPORT FORM
      ========================== */}



      <div className="card shadow-sm border-0 mb-4">


        <div className="card-body p-4">


          <h4
            className="fw-bold text-success mb-4"
          >

            Submit New Report

          </h4>




          <div className="row g-3">



            <div className="col-12">


              <label className="form-label fw-semibold">

                Report Title

              </label>


              <input

                type="text"

                className="form-control"

                placeholder="Example: Broken street light"

                value={title}

                onChange={(e)=>
                  setTitle(e.target.value)
                }

              />


            </div>





            <div className="col-12 col-md-6">


              <label className="form-label fw-semibold">

                Category

              </label>


<select
  className="form-select"
  value={category}
  onChange={(e)=>
    setCategory(e.target.value)
  }
>

  <option value="">
    Select Category
  </option>

  <option value="Damaged Infrastructure">
    Damaged Infrastructure
  </option>

  <option value="Waste Management">
    Waste Management
  </option>

  <option value="Drainage Problems">
    Drainage Problems
  </option>

  <option value="Street Lighting">
    Street Lighting
  </option>

  <option value="Public Safety">
    Public Safety
  </option>

  <option value="Others">
    Others
  </option>

</select>


            </div>





            <div className="col-12">


              <label className="form-label fw-semibold">

                Description

              </label>



              <textarea

                className="form-control"

                rows="5"

                placeholder="Describe your concern..."

                value={concern}

                onChange={(e)=>
                  setConcern(
                    e.target.value
                  )
                }

              />
              {/* IMAGE UPLOAD */}
                

<div className="col-12 mt-3">

  <label className="form-label fw-semibold">
    Attach Image (Optional)
  </label>


  <input

    type="file"

    className="form-control"

    accept="image/*"

    onChange={(e)=>{

      const file =
        e.target.files[0];


      setImage(file);


      if(file){

        setImagePreview(
          URL.createObjectURL(file)
        );

      }

    }}

  />

</div>



{/* IMAGE PREVIEW */}

{imagePreview && (

  <div className="col-12 mt-3">

    <label className="form-label fw-semibold">
      Image Preview
    </label>


    <div>

      <img

        src={imagePreview}

        alt="Preview"

        className="img-fluid rounded shadow-sm"

        style={{
          maxHeight:"250px"
        }}

      />

    </div>

  </div>

)}
              <div className="col-12">

<label className="form-label fw-semibold">
 Report Image (Optional)
</label>


<input

type="file"

className="form-control"

accept="image/*"

onChange={(e)=>{

 const file = e.target.files[0];

 setImage(file);


 if(file){

 setImagePreview(
 URL.createObjectURL(file)
 );

 }

}}

/>

</div>



            </div>




            <div className="col-12">


              <button

                className="btn btn-success px-4"

                onClick={submitReport}

              >

                <FaPaperPlane className="me-2"/>

                Submit Report


              </button>



            </div>



          </div>


        </div>


      </div>
      {/* ==========================
          SEARCH AND FILTER
      ========================== */}


      <div className="card shadow-sm border-0 mb-4">


        <div className="card-body">


          <div className="row g-3">



            <div className="col-12 col-md-8">


              <div className="input-group">


                <span className="input-group-text bg-success text-white">

                  <FaSearch />

                </span>


                <input

                  type="text"

                  className="form-control"

                  placeholder="Search reports..."

                  value={search}

                  onChange={(e)=>
                    setSearch(
                      e.target.value
                    )
                  }

                />


              </div>


            </div>





            <div className="col-12 col-md-4">


              <select

                className="form-select"

                value={statusFilter}

                onChange={(e)=>
                  setStatusFilter(
                    e.target.value
                  )
                }

              >


                <option value="All">

                  All Status

                </option>


                <option value="Pending">

                  Pending

                </option>


                <option value="In Progress">

                  In Progress

                </option>


                <option value="Resolved">

                  Resolved

                </option>


                <option value="Declined">

                  Declined

                </option>


              </select>


            </div>



          </div>


        </div>


      </div>






      {/* ==========================
          LOADING
      ========================== */}



      {loading && (


        <div className="text-center py-5">


          <div

            className="spinner-border text-success"

            role="status"

          >

          </div>


          <p className="mt-3 text-muted">

            Loading reports...

          </p>


        </div>


      )}







      {/* ==========================
          EMPTY STATE
      ========================== */}



      {!loading &&
        filteredReports.length === 0 && (


        <div className="card shadow-sm border-0 text-center p-5">


          <h4 className="text-success">

            No Reports Found

          </h4>


          <p className="text-muted mb-0">

            There are no submitted concerns matching your search.

          </p>


        </div>


      )}








      {/* ==========================
          REPORT CARDS
      ========================== */}



      <div className="row g-4">



        {filteredReports.map((report)=>(



          <div

            className="col-12"

            key={report.id}

          >



            <div className="card shadow-sm border-0">



              <div className="card-body p-4">





                {/* HEADER */}



                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">



                  <div>


                    <h4 className="fw-bold text-success mb-1">

                      {report.title || "Untitled Report"}

                    </h4>



                    <span className="badge bg-secondary">

                      {report.category}

                    </span>



                  </div>





                  <span

                    className={`badge bg-${getStatusClass(
                      report.status
                    )} fs-6 px-3 py-2`}

                  >

                    {report.status}


                  </span>



                </div>







                {/* REPORT INFORMATION */}



                <div className="mb-3">


                  <p className="text-muted mb-2">


                    <strong>Reporter:</strong>{" "}

                   Resident #{String(report.residentNumber || 0).padStart(4, "0")}

                  </p>



                  <p className="text-muted mb-3">


                    <strong>Date:</strong>{" "}

                    {formatDate(
                      report.createdAt
                    )}


                  </p>



                </div>







                {/* CONCERN */}



                <div className="bg-light rounded p-3 mb-4">


                  <h6 className="fw-bold">

                    Concern Description

                  </h6>


                  <p className="mb-0 text-secondary">


                    {report.concern}


                  </p>



                </div>

{report.imageUrl && (

<div className="mb-4">

<h6 className="fw-bold">
Attached Image
</h6>


<img

src={report.imageUrl}

alt="Report"

className="img-fluid rounded shadow-sm"

style={{
maxHeight:"300px"
}}

/>

</div>

)}





                {/* PROGRESS BAR */}



                <div className="mb-4">


                  <div className="d-flex justify-content-between mb-2">


                    <small className="fw-semibold">

                      Report Progress

                    </small>



                    <small>

                      {getProgressValue(
                        report.status
                      )}%

                    </small>



                  </div>





                  <div className="progress">


                    <div

                      className={`progress-bar bg-${getStatusClass(
                        report.status
                      )}`}

                      role="progressbar"

                      style={{

                        width:
                          `${getProgressValue(
                            report.status
                          )}%`

                      }}

                    >


                    </div>


                  </div>


                </div>







                {/* BARANGAY RESPONSE */}



                {report.adminSolution && (


                  <div className="alert alert-success">


                    <h5 className="fw-bold">

                      Barangay Response

                    </h5>



                    <p className="mb-0">


                      {report.adminSolution}


                    </p>



                  </div>


                )}






                {/* DELETE BUTTON ADMIN ONLY */}



                {auth.currentUser?.email === adminEmail && (



                  <button

                    className="btn btn-danger"

                    onClick={()=>
                      deleteReport(
                        report.id
                      )
                    }

                  >


                    <FaTrash className="me-2"/>


                    Delete Report



                  </button>



                )}







              </div>


            </div>


          </div>
        ))}

      </div>

    </div>

  );

}