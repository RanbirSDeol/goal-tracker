import React from "react";
import Navbar from "../components/Navbar"; // Make sure the path is correct
import Logout from "./Logout";
import styles from "./styles/Dashboard.module.css"; // Optional styling for Dashboard

const Dashboard = () => {
  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.dashboardContent}>
        <h2>Welcome to your Dashboard</h2>
      </div>
    </div>
  );
};

export default Dashboard;
