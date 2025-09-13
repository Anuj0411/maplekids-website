import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { authService } from '../../firebase/services';
import { Button } from '../common';

type User = import("../../firebase/services").User;

const UserDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await authService.getCurrentUserData();
      if (!userData) {
        navigate('/signin');
        return;
      }
      if (userData.role !== 'student') {
        // Redirect to appropriate dashboard based on role
        if (userData.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (userData.role === 'teacher') {
          navigate('/teacher-dashboard');
        }
        return;
      }
      setUser(userData);
    };
    fetchUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await authService.signOut();
    navigate('/');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <span className="brand-icon">🏫</span>
          <h1>Maplekids Play School</h1>
        </div>
        <div className="nav-user">
          <span>Welcome, {user.firstName}!</span>
            <Button variant="danger" onClick={handleSignOut} className="btn-signout">Sign Out</Button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome to Your Dashboard, {user.firstName}! 👋</h2>
          <p>Here you can view your child's progress and stay connected with our school community.</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon">📚</div>
            <h3>Child's Progress</h3>
            <p>View your child's learning journey and achievements</p>
            <Button variant="primary" className="btn-card">View Progress</Button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📅</div>
            <h3>School Calendar</h3>
            <p>Stay updated with important dates and events</p>
            <Button variant="primary" className="btn-card">View Calendar</Button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">💬</div>
            <h3>Communication</h3>
            <p>Connect with teachers and school staff</p>
            <Button variant="primary" className="btn-card">Send Message</Button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📖</div>
            <h3>Resources</h3>
            <p>Access educational materials and activities</p>
            <Button variant="primary" className="btn-card">Browse Resources</Button>
          </div>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <Button variant="secondary" className="btn-action">Update Contact Info</Button>
            <Button variant="secondary" className="btn-action">View Attendance</Button>
            <Button variant="secondary" className="btn-action">Download Reports</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
