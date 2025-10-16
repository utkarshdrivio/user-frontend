import React, { useState, useEffect } from "react";
import { Card, Input, Button, Spin, Alert } from "antd";

const UserProfile = () => {
  const [userId, setUserId] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const fetchUserData = async () => {
    if (!userId) {
      setError("Please enter a user ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:3001/api/users/${userId}`);
      if (response.ok) {
        const user = await response.json();
        setUserData(user);
        setError("");
      } else {
        setUserData(null);
        setError("User not found");
      }
    } catch (err) {
      setError("Failed to fetch user data");
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h2>User Profile Lookup</h2>
      
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <Input
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ flex: 1 }}
        />
        <Button type="primary" onClick={fetchUserData} loading={loading}>
          Search
        </Button>
      </div>

      {error && <Alert message={error} type="error" style={{ marginBottom: "20px" }} />}

      {loading && <Spin size="large" />}

      {userData && (
        <Card title={`User Profile - ID: ${userData.id}`}>
          <p><strong>Name:</strong> {userData.first_name} {userData.last_name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Gender:</strong> {userData.gender}</p>
          <p><strong>Mobile:</strong> {userData.phone}</p>
          <p><strong>Age:</strong> {userData.age}</p>
          <p><strong>Department:</strong> {userData.department?.name || 'N/A'}</p>
          <p><strong>Role:</strong> {userData.role}</p>
          <p><strong>Joining Date:</strong> {userData.joining_date}</p>
          <p><strong>Status:</strong> {userData.is_active ? "Active" : "Inactive"}</p>
          <p><strong>Rating:</strong> {userData.rating}/5</p>
        </Card>
      )}
    </div>
  );
};

export default UserProfile;