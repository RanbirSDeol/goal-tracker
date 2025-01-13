import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar"; // Make sure the path is correct
import Topbar from "./Topbar";
import styles from "./styles/Dashboard.module.css"; // Optional styling for Dashboard
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";

const calculateDaysLeft = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const timeDiff = due - today;

  // Convert time difference to days
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return daysLeft > 0 ? `${daysLeft} days left` : "Past Due";
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const Dashboard = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(""); // Message to display
  const [showStatus, setShowStatus] = useState(false); // Control visibility of the topbar
  const [sortBy, setSortBy] = useState("new");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGoals = goals.filter((goal) =>
    goal.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch("http://localhost:5000/goals");
        if (!response.ok) {
          throw new Error("Failed to fetch goals");
        }
        const data = await response.json();
        if (data && Array.isArray(data.goals)) {
          let sortedGoals = [...data.goals];

          switch (sortBy) {
            case "new":
              sortedGoals.sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
              );
              break;
            case "old":
              sortedGoals.sort(
                (a, b) => new Date(a.created_at) - new Date(b.created_at)
              );
              break;
            case "due":
              sortedGoals.sort(
                (a, b) => new Date(a.due_date) - new Date(b.due_date)
              );
              break;
            case "priority":
              sortedGoals.sort((a, b) => b.priority - a.priority); // Adjust this based on your actual field
              break;
            case "completed":
              sortedGoals.sort((a, b) => a.completed - b.completed); // Assuming a completed boolean field
              break;
            default:
              break;
          }

          setGoals(sortedGoals);
        } else {
          throw new Error("Invalid data format: goals not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [sortBy]); // Add sortBy as a dependency to re-fetch when it changes

  const deleteGoal = async (goalId) => {
    try {
      const response = await fetch(`http://localhost:5000/goals/${goalId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete goal");
      }

      setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== goalId));

      // Show the topbar with success message
      setStatusMessage("Goal Deleted");
      setShowStatus(true);

      // Auto-hide the status message after 3 seconds
      setTimeout(() => setShowStatus(false), 3000);
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const getProgressClass = (progress) => {
    if (progress <= 20) return styles.low;
    if (progress <= 40) return styles.mediumLow;
    if (progress <= 60) return styles.medium;
    if (progress <= 80) return styles.mediumHigh;
    return styles.high;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.container}>
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
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div className={styles.filters}>
            <div className={styles.dropdown}>
              <select
                id="sort-by"
                name="sort-by"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="new">Newest Created</option>
                <option value="old">Oldest Created</option>
                <option value="due">Due Date</option>
                <option value="priority">Priority</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.goalsList}>
          {filteredGoals.length === 0 ? (
            <p>No goals found</p>
          ) : (
            filteredGoals.map((goal) => {
              const progress = Math.round(
                (goal.current_value / goal.target_value) * 100
              );
              return (
                <div key={goal.id} className={styles.goalCard}>
                  <div className={styles.goalTopbar}>
                    <button className={styles.edit}>
                      <FontAwesomeIcon icon={faBars} size="xl" />
                    </button>
                    <button
                      className={styles.trash}
                      onClick={() => deleteGoal(goal.id)}
                    >
                      <FontAwesomeIcon icon={faTrashCan} size="xl" />
                    </button>
                  </div>
                  <div className={styles.goalHeader}>
                    <p className={styles.goalTitle}>{goal.title}</p>
                  </div>
                  <div>
                    <p
                      className={`${styles.goalPercent} ${getProgressClass(
                        progress
                      )}`}
                    >
                      {progress}%
                    </p>
                    <div className={styles.numberDisplay}>
                      <div className={styles.currentValue}>
                        {goal.current_value} /
                      </div>
                      <div className={styles.endValue}>
                        {goal.target_value} {goal.unit}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`${styles.progressContainer} ${getProgressClass(
                      progress
                    )}`}
                    style={{ width: `100%` }}
                  >
                    <div
                      className={`${styles.progressBar} ${getProgressClass(
                        progress
                      )}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className={styles.goalStatus}>
                    Created @ {goal.created_at}
                  </p>
                  <p className={styles.goalDueDate}>
                    {formatDate(goal.due_date)}
                  </p>
                  <p
                    className={`${styles.goalDaysLeft} ${
                      calculateDaysLeft(goal.due_date) === "Past Due"
                        ? styles.overdue
                        : ""
                    }`}
                  >
                    {calculateDaysLeft(goal.due_date)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
