// Dashboard Component

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Topbar from "./Topbar";
import Confirmation from "./Confirmation";
import CreateProject from "./CreateProject";
import styles from "./styles/Projects.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faEllipsis,
  faEllipsisVertical,
  faPlus,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import {
  faTrashCan,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-regular-svg-icons";

const Dashboard = () => {
  // Vars
  const [project, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(""); // Message to display
  const [showStatus, setShowStatus] = useState(false); // Control visibility of the topbar
  const [selectedGoal, setSelectedGoal] = useState(null); // State to store the selected goal
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const [showCreate, setShowCreate] = useState(false); // State to control visibility of the Create component

  // Function to toggle the Create component visibility
  const toggleCreateForm = () => {
    setShowCreate((prev) => !prev);
  };

  // Function to delete a specific project with a confirmation prompt

  // Function to handle delete button click
  const handleDeleteClick = (projectId) => {
    setProjectToDelete(projectId);
    setShowConfirmation(true); // Show the confirmation modal
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false); // Close the modal
    setProjectToDelete(null); // Clear the goal to delete
  };

  // Function to handle confirm delete button click
  const handleConfirmDelete = () => {
    deleteProject(projectToDelete); // Proceed with deletion
    setProjectToDelete(null); // Clear the goal to delete
  };

  const deleteProject = async (projectId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/projects/${projectId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== projectId)
      );

      setShowConfirmation(false);

      // Show the topbar with success message
      setStatusMessage("Project Deleted");
      setShowStatus(true);

      // Auto-hide the status message after 3 seconds
      setTimeout(() => setShowStatus(false), 3000);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  // Load our projects from the API '/projects' endpoint
  useEffect(() => {
    const fetchProjects = async () => {
      // GET request to fetch projects
      try {
        const token = localStorage.getItem("authToken"); // Get the JWT token from localStorage (or wherever it's stored)
        const response = await fetch("http://localhost:5000/projects", {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token in the header
          },
        });

        // Make sure the response is valid
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        // Our project data
        const data = await response.json();

        // Assuming projects are in the 'data' variable
        if (data && Array.isArray(data.projects)) {
          setProjects(data.projects);
        } else {
          throw new Error("Invalid data format: projects not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Dashboard Structure
  return (
    <div className={styles.container}>
      {showConfirmation && (
        <Confirmation
          message="Are you sure you want to delete this goal?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
      {showStatus && (
        <div className={styles.statusTopbar}>
          <p>{statusMessage}</p>
        </div>
      )}
      <div className={styles.navbar}>
        <Topbar />
        <Navbar />
      </div>
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardTopbar}>
          <input
            type="search"
            id="search"
            name="search"
            placeholder="Search..."
            className={styles.searchbar}
          />
          <div className={styles.filters}>
            <div className={styles.dropdown}>
              <select id="sort-by" name="sort-by">
                <option value="new">Newest Created</option>
                <option value="old">Oldest Created</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.projectsList}>
          {project.map((project) => (
            <div key={project.id} className={styles.projectCard}>
              <div className={styles.projectTopbar}>
                <button className={styles.edit}>
                  <FontAwesomeIcon icon={faEllipsis} size="xl" />
                </button>
                <button
                  className={styles.trash}
                  onClick={() => handleDeleteClick(project.id)}
                >
                  <FontAwesomeIcon icon={faTrashCan} size="xl" />
                </button>
              </div>
              <div className={styles.projectHeader}>
                <p className={styles.projectTitle}>{project.title}</p>
                <img
                  src={`http://localhost:5000/uploads/${project.image}`}
                  ///uploads/1736962365347.jpg
                  alt="Project"
                  className={styles.projectImage}
                />
              </div>
            </div>
          ))}
          <button
            className={styles.projectCreateCard}
            onClick={toggleCreateForm}
          >
            <div>
              <FontAwesomeIcon icon={faPlus} size="xl" />
              <p>Create Project</p>
            </div>
          </button>
          {showCreate && <CreateProject onClose={toggleCreateForm} />}
        </div>
      </div>
    </div>
  );
};

/* 

<p className={styles.projectTitle}>{project.date_created}</p>
                <p className={styles.projectTitle}>{project.link}</p>

*/

export default Dashboard;
