import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { authService, studentService, financialService, eventService, userService, Student } from '../../firebase/services';
import { Button, Table } from '../common';
import AttendanceOverview from '../AttendanceOverview';
import UserCreationModal from '../UserCreationModal';
import ExcelBulkUserCreationModal from '../ExcelBulkUserCreationModal';
import AdminAnnouncementManager from '../AdminAnnouncementManager';
import { Announcement } from '../../services/announcementService';

// Use the exact interfaces from Firebase services to avoid type mismatches
interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

// Removed unused UserData interface. Use User from services.ts



interface FinancialRecord {
  id?: string; // Changed from string to string | undefined to match Firebase service
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  receiptNumber?: string;
  studentName?: string;
  studentClass?: string;
  month?: string;
  academicYear?: string;
}


interface Event {
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  isActive: boolean;
  createdAt?: any; // Made optional to match Firebase service
}

const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    admins: 0,
    teachers: 0,
    totalStudents: 0,
    totalIncome: 0,
    totalExpense: 0
  });
  
  // Financial records filtering
  const [financialFilters, setFinancialFilters] = useState({
    studentName: '',
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    studentClass: 'play' // Default to 'play' class
  });
  const [filteredFinancialRecords, setFilteredFinancialRecords] = useState<FinancialRecord[]>([]);

  // Students filtering
  const [studentFilters, setStudentFilters] = useState({
    name: '',
    class: 'play', // Default to 'play' class
    rollNumber: '',
    age: ''
  });
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isUserCreationModalOpen, setIsUserCreationModalOpen] = useState(false);
  const [isExcelBulkUserCreationModalOpen, setIsExcelBulkUserCreationModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user from Firebase Auth
    const fetchUser = async () => {
      const userData = await authService.getCurrentUserData();
      if (!userData) {
        navigate('/signin');
        return;
      }
      if (userData.role !== 'admin') {
        navigate('/user-dashboard');
        return;
      }
      setUser(userData);
      loadAllData();
    };
    fetchUser();
  }, [navigate]);


  const loadAllData = async () => {
    try {
      // Load all data from Firebase services
      const [studentsData, financialData, eventsData, usersData] = await Promise.all([
        studentService.getAllStudents(),
        financialService.getAllFinancialRecords(),
        eventService.getAllEvents(),
        userService.getAllUsers()
      ]);
      
      // Filter students to only show those who exist in the users collection
      const activeStudents = studentsData.filter(student => {
        return usersData.some(user => 
          user.role === 'student' && 
          user.email === student.email
        );
      });
      
      setStudents(activeStudents);
      setFilteredStudents(activeStudents.filter(s => s.class === 'play')); // Initialize with 'play' class only
      setFinancialRecords(financialData);
      setFilteredFinancialRecords(financialData.filter(record => record.studentClass === 'play')); // Initialize with 'play' class only
      setEvents(eventsData);
      setUsers(usersData);
      
      // Calculate financial stats
      const totalIncome = financialData
        .filter((record: any) => record.type === 'income')
        .reduce((sum: number, record: any) => sum + (record.amount || 0), 0);
      
      const totalExpense = financialData
        .filter((record: any) => record.type === 'expense')
        .reduce((sum: number, record: any) => sum + (record.amount || 0), 0);
      
      // Update stats
      const studentCount = activeStudents.length;
      const adminCount = usersData.filter((u: any) => u.role === 'admin').length;
      const teacherCount = usersData.filter((u: any) => u.role === 'teacher').length;
      
      setStats((prev) => ({
        ...prev,
        totalUsers: usersData.length,
        students: studentCount,
        admins: adminCount,
        teachers: teacherCount,
        totalStudents: studentsData.length,
        totalIncome,
        totalExpense
      }));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSignOut = async () => {
    // Sign out using Firebase Auth
    await authService.signOut();
    navigate('/');
  };

  // Format numbers with abbreviations
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Format currency with abbreviations
  const formatCurrency = (amount: number): string => {
    if (amount >= 10000000) { // 1 crore
      return '₹' + (amount / 10000000).toFixed(1) + 'Cr';
    } else if (amount >= 100000) { // 1 lakh
      return '₹' + (amount / 100000).toFixed(1) + 'L';
    } else if (amount >= 1000) {
      return '₹' + (amount / 1000).toFixed(1) + 'K';
    }
    return '₹' + amount.toLocaleString();
  };

  const editUser = (userId: string) => {
    navigate(`/admin/edit-user/${userId}`);
  };

  const deleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This will remove them from both the database and authentication system.')) {
      try {
        await userService.deleteUserCompletely(userId);
        loadAllData();
        alert('User deleted successfully from both database and authentication system.');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const deleteStudent = async (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        // Find student by ID to get roll number
        const student = students.find(s => s.id === studentId);
        if (student && student.rollNumber) {
          await studentService.deleteStudentByRollNumber(student.rollNumber);
        } else {
          await studentService.deleteStudent(studentId);
        }
        loadAllData();
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Failed to delete student. Please try again.');
      }
    }
  };

  const editStudent = async (studentId: string) => {
    // Find student by ID to get roll number
    const student = students.find(s => s.id === studentId);
    if (student && student.rollNumber) {
      // Navigate to edit form with roll number
      navigate(`/admin/edit-student/${student.rollNumber}`);
    } else {
      alert('Student roll number not found. Cannot edit.');
    }
  };

  const deleteFinancialRecord = async (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      await financialService.deleteFinancialRecord(recordId);
      loadAllData();
    }
  };


  const deleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await eventService.deleteEvent(eventId);
      loadAllData();
    }
  };

  const toggleEventStatus = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      await eventService.updateEvent(eventId, { isActive: !event.isActive });
      loadAllData();
    }
  };

  const navigateToForm = (formType: string) => {
    switch (formType) {
      case 'add-financial':
        navigate('/admin/add-financial');
        break;
      case 'add-photo':
        // Gallery feature disabled - Database not configured for image upload
        alert('Gallery feature coming soon - Database not configured for image upload');
        break;
      case 'add-event':
        navigate('/admin/add-event');
        break;
      case 'add-user':
        navigate('/admin/add-user');
        break;
      default:
        break;
    }
  };



  // Clear all filters
  const clearFinancialFilters = () => {
    setFinancialFilters({
      studentName: '',
      type: '',
      category: '',
      startDate: '',
      endDate: '',
      studentClass: 'play' // Reset to 'play' class
    });
    setFilteredFinancialRecords(financialRecords.filter(record => record.studentClass === 'play'));
  };

  // Clear student filters
  const clearStudentFilters = () => {
    setStudentFilters({
      name: '',
      class: 'play', // Reset to 'play' class
      rollNumber: '',
      age: ''
    });
    setFilteredStudents(students.filter(s => s.class === 'play'));
  };

  // Handle filter input changes
  const handleFilterChange = (name: string, value: string) => {
    setFinancialFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-apply filters for text inputs and class changes (real-time search)
    if (name === 'studentName' || name === 'studentClass') {
      const newFilters = { ...financialFilters, [name]: value };
      applyFilters(newFilters);
    }
    
    // Clear category when type changes to avoid invalid combinations
    if (name === 'type') {
      setFinancialFilters(prev => ({
        ...prev,
        category: ''
      }));
    }
  };

  // Apply filters with given filter object
  const applyFilters = useCallback((filters: typeof financialFilters) => {
    let filtered = financialRecords;

    // Always filter by class first
    if (filters.studentClass) {
      filtered = filtered.filter(record => record.studentClass === filters.studentClass);
    }

    if (filters.studentName) {
      filtered = filtered.filter(record => 
        record.studentName?.toLowerCase().includes(filters.studentName.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter(record => record.type === filters.type);
    }

    if (filters.category) {
      filtered = filtered.filter(record => record.category === filters.category);
    }

    if (filters.startDate) {
      filtered = filtered.filter(record => 
        new Date(record.date) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(record => 
        new Date(record.date) <= new Date(filters.endDate)
      );
    }

    setFilteredFinancialRecords(filtered);
  }, [financialRecords]);

  // Apply current filters
  const applyFinancialFilters = () => {
    applyFilters(financialFilters);
  };

  // Apply student filters with given filter object
  const applyStudentFiltersWithFilters = useCallback((filters: typeof studentFilters) => {
    let filtered = students;

    if (filters.name) {
      filtered = filtered.filter(student => 
        student.firstName?.toLowerCase().includes(filters.name.toLowerCase()) ||
        student.lastName?.toLowerCase().includes(filters.name.toLowerCase()) ||
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.class) {
      filtered = filtered.filter(student => student.class === filters.class);
    }

    if (filters.rollNumber) {
      filtered = filtered.filter(student => 
        student.rollNumber?.toLowerCase().includes(filters.rollNumber.toLowerCase())
      );
    }

    if (filters.age) {
      const age = parseInt(filters.age);
      if (!isNaN(age)) {
        filtered = filtered.filter(student => student.age === age);
      }
    }

    setFilteredStudents(filtered);
  }, [students]);

  // Apply current student filters
  const applyStudentFilters = () => {
    applyStudentFiltersWithFilters(studentFilters);
  };

  // Auto-apply filters when type, category, or date filters change
  useEffect(() => {
    if (financialRecords.length > 0) {
      applyFilters(financialFilters);
    }
  }, [financialFilters, applyFilters, financialRecords.length]);

  // Auto-apply student filters when class or age changes
  useEffect(() => {
    if (students.length > 0) {
      applyStudentFiltersWithFilters(studentFilters);
    }
  }, [studentFilters, applyStudentFiltersWithFilters, students.length]);

  // Table columns
  const studentColumns = [
    {
      key: 'photo',
      label: 'Photo',
      render: (s: Student) => (
        <div className="student-photo">
          {s.photo ? <img src={s.photo} alt={s.firstName} /> : <div className="photo-placeholder">👤</div>}
        </div>
      )
    },
    {
      key: 'name',
      label: 'Name',
      render: (s: Student) => `${s.firstName} ${s.lastName}`
    },
    {
      key: 'class',
      label: 'Class',
      render: (s: Student) => (
        <span className={`class-badge ${s.class}`}>{s.class.toUpperCase()}</span>
      )
    },
    { key: 'age', label: 'Age' },
    { key: 'parentName', label: 'Parent' },
    { key: 'parentPhone', label: 'Phone' },
    { key: 'admissionDate', label: 'Admission Date', render: (s: Student) => new Date(s.admissionDate).toLocaleDateString() }
  ];

  const financialColumns = [
    {
      key: 'type',
      label: 'Type',
      render: (r: FinancialRecord) => (
        <span className={`type-badge ${r.type}`}>{r.type === 'income' ? '💰 Income' : '💸 Expense'}</span>
      )
    },
    { key: 'category', label: 'Category' },
    { key: 'amount', label: 'Amount', render: (r: FinancialRecord) => `₹${r.amount.toLocaleString()}` },
    { key: 'description', label: 'Description' },
    { key: 'date', label: 'Date', render: (r: FinancialRecord) => new Date(r.date).toLocaleDateString() },
    { 
      key: 'studentInfo', 
      label: 'Student Info', 
      render: (r: FinancialRecord) => r.studentName ? `${r.studentName} (${r.studentClass})` : '-'
    },
    { 
      key: 'period', 
      label: 'Period', 
      render: (r: FinancialRecord) => r.month && r.academicYear ? `${r.month} ${r.academicYear}` : '-'
    },
    { key: 'receiptNumber', label: 'Receipt' }
  ];

  const userColumns = [
    { key: 'name', label: 'Name', render: (u: User) => `${u.firstName} ${u.lastName}` },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (u: any) => (<span className={`role-badge ${u.role}`}>{u.role === 'admin' ? 'Admin' : u.role === 'teacher' ? 'Teacher' : 'Student'}</span>) },
    { key: 'phone', label: 'Phone', render: (u: any) => (u.phone ? u.phone : '') },
    { key: 'createdAt', label: 'Joined', render: (u: any) => (u.createdAt && typeof u.createdAt === 'object' && 'seconds' in u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : '') }
  ];

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <span className="brand-icon">🏫</span>
          <h1>Maplekids Play School - Admin</h1>
        </div>
        <div className="nav-user">
          <span>Admin: {user.firstName} {user.lastName}</span>
          <Button variant="danger" onClick={handleSignOut} className="btn-signout">Sign Out</Button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Admin Dashboard 👨‍💼</h2>
          <p>Manage school operations, students, finances, and content.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            data-icon="📊"
            data-label="Overview"
          >
            <span className="tab-icon">📊</span>
            <span className="tab-text">Overview</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
            data-icon="👥"
            data-label="Students"
          >
            <span className="tab-icon">👥</span>
            <span className="tab-text">Students</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
            data-icon="📋"
            data-label="Attendance"
          >
            <span className="tab-icon">📋</span>
            <span className="tab-text">Attendance</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
            data-icon="📅"
            data-label="Events"
          >
            <span className="tab-icon">📅</span>
            <span className="tab-text">Events</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcements')}
            data-icon="📢"
            data-label="Announcements"
          >
            <span className="tab-icon">📢</span>
            <span className="tab-text">Announcements</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'finance' ? 'active' : ''}`}
            onClick={() => setActiveTab('finance')}
            data-icon="💰"
            data-label="Finance"
          >
            <span className="tab-icon">💰</span>
            <span className="tab-text">Finance</span>
          </button>
          <button 
            className="tab-button disabled"
            disabled
            data-icon="📸"
            data-label="Gallery"
            title="Gallery feature coming soon - Database not configured for image upload"
          >
            <span className="tab-icon">📸</span>
            <span className="tab-text">Gallery</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
            data-icon="👤"
            data-label="Users"
          >
            <span className="tab-icon">👤</span>
            <span className="tab-text">Users</span>
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>Total Students</h3>
                  <p className="stat-number">{formatNumber(stats.totalStudents)}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👨‍🏫</div>
                <div className="stat-content">
                  <h3>Staff Members</h3>
                  <p className="stat-number">{formatNumber(stats.admins + stats.teachers)}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👤</div>
                <div className="stat-content">
                  <h3>Total Users</h3>
                  <p className="stat-number">{formatNumber(stats.totalUsers)}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <h3>Active Events</h3>
                  <p className="stat-number">{formatNumber(events.filter(e => e.isActive).length)}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>Total Income</h3>
                  <p className="stat-number">{formatCurrency(stats.totalIncome)}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💸</div>
                <div className="stat-content">
                  <h3>Total Expense</h3>
                  <p className="stat-number">{formatCurrency(stats.totalExpense)}</p>
                </div>
              </div>
            </div>

            {/* Recent Events Section */}
            {events.length > 0 && (
              <div className="recent-events-section">
                <h3>📅 Recent Events</h3>
                <div className="events-grid">
                  {events.slice(0, 3).map((event) => (
                    <div key={event.id} className="event-card">
                      <div className="event-header">
                        <h4>{event.title}</h4>
                        <span className={`status-badge ${event.isActive ? 'active' : 'inactive'}`}>
                          {event.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="event-description">{event.description}</p>
                      <div className="event-details">
                        <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                        <span>🕒 {event.time}</span>
                        <span>📍 {event.location}</span>
                      </div>
                      <div className="event-actions">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => navigate(`/admin/edit-event/${event.id}`)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => deleteEvent(event.id || '')}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="events-footer">
                  <Button 
                    variant="primary" 
                    onClick={() => setActiveTab('events')}
                  >
                    View All Events
                  </Button>
                </div>
              </div>
            )}

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <Button className="btn-action" variant="primary" onClick={() => setIsUserCreationModalOpen(true)}>Add New User</Button>
                <Button className="btn-action" variant="primary" onClick={() => navigateToForm('add-financial')}>Add Financial Record</Button>
                <Button className="btn-action disabled" variant="secondary" disabled title="Gallery feature coming soon - Database not configured for image upload">Upload Photo</Button>
                <Button className="btn-action" variant="primary" onClick={() => navigateToForm('add-event')}>Create Event</Button>
                <Button className="btn-action" variant="secondary" onClick={() => setActiveTab('attendance')}>View Today's Attendance</Button>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="tab-content">
            <AttendanceOverview 
              selectedDate={attendanceDate}
              onDateChange={setAttendanceDate}
            />
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="tab-content">
            <div className="section-header">
              <h3>Student Management</h3>
            </div>

            {/* Student Filters */}
            <div className="student-filters">
              <h4>🔍 Filter Students</h4>
              <div className="filter-grid">
                <div className="filter-group">
                  <label>Class:</label>
                  <select
                    value={studentFilters.class}
                    onChange={(e) => {
                      setStudentFilters(prev => ({ ...prev, class: e.target.value }));
                      // Real-time filter for class
                      const newFilters = { ...studentFilters, class: e.target.value };
                      applyStudentFiltersWithFilters(newFilters);
                    }}
                  >
                    <option value="play">Play</option>
                    <option value="nursery">Nursery</option>
                    <option value="lkg">LKG</option>
                    <option value="ukg">UKG</option>
                    <option value="1st">1st</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Student Name:</label>
                  <input
                    type="text"
                    placeholder="Search by name"
                    value={studentFilters.name}
                    onChange={(e) => {
                      setStudentFilters(prev => ({ ...prev, name: e.target.value }));
                      // Real-time search for name
                      const newFilters = { ...studentFilters, name: e.target.value };
                      applyStudentFiltersWithFilters(newFilters);
                    }}
                  />
                </div>
                
                
                <div className="filter-group">
                  <label>Roll Number:</label>
                  <input
                    type="text"
                    placeholder="Search by roll number"
                    value={studentFilters.rollNumber}
                    onChange={(e) => {
                      setStudentFilters(prev => ({ ...prev, rollNumber: e.target.value }));
                      // Real-time search for roll number
                      const newFilters = { ...studentFilters, rollNumber: e.target.value };
                      applyStudentFiltersWithFilters(newFilters);
                    }}
                  />
                </div>
                
                <div className="filter-group">
                  <label>Age:</label>
                  <input
                    type="number"
                    placeholder="Filter by age"
                    value={studentFilters.age}
                    onChange={(e) => setStudentFilters(prev => ({ ...prev, age: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="filter-summary">
                <span className="filter-count">
                  Showing {filteredStudents.length} of {students.length} students
                </span>
              </div>
              
              <div className="filter-actions">
                <Button variant="primary" onClick={applyStudentFilters}>
                  🔍 Apply Filters
                </Button>
                <Button variant="secondary" onClick={clearStudentFilters}>
                  🗑️ Clear Filters
                </Button>
              </div>
            </div>

            <div className="students-table">
              <Table
                columns={studentColumns}
                data={filteredStudents}
                actions={(s: Student) => (
                  <>
                    <Button 
                      variant="secondary" 
                      className="btn-edit" 
                      onClick={() => editStudent(s.id || '')}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      className="btn-delete" 
                      onClick={() => deleteStudent(s.id || '')}
                    >
                      Delete
                    </Button>
                  </>
                )}
                emptyMessage="No students found."
              />
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="tab-content">
            <AdminAnnouncementManager 
              onAnnouncementChange={(announcements: Announcement[]) => {
                // Update local state if needed
                console.log('Announcements updated:', announcements);
              }}
            />
          </div>
        )}

        {/* Finance Tab */}
        {activeTab === 'finance' && (
          <div className="tab-content">
            <div className="section-header">
              <h3>Financial Records</h3>
              <Button className="btn-primary" variant="primary" onClick={() => navigateToForm('add-financial')}>Add Record</Button>
            </div>
            
            <div className="finance-summary">
              <div className="summary-card income">
                <h4>Total Income ({financialFilters.studentClass.toUpperCase()})</h4>
                <p>{formatCurrency(filteredFinancialRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0))}</p>
              </div>
              <div className="summary-card expense">
                <h4>Total Expense ({financialFilters.studentClass.toUpperCase()})</h4>
                <p>{formatCurrency(filteredFinancialRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0))}</p>
              </div>
              <div className="summary-card balance">
                <h4>Net Balance ({financialFilters.studentClass.toUpperCase()})</h4>
                <p>{formatCurrency(
                  filteredFinancialRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0) - 
                  filteredFinancialRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
                )}</p>
              </div>
            </div>

            {/* Financial Records Filters */}
            <div className="finance-filters">
              <h4>🔍 Filter Records</h4>
              <div className="filter-grid">
                <div className="filter-group">
                  <label>Class:</label>
                  <select
                    value={financialFilters.studentClass}
                    onChange={(e) => handleFilterChange('studentClass', e.target.value)}
                  >
                    <option value="play">Play</option>
                    <option value="nursery">Nursery</option>
                    <option value="lkg">LKG</option>
                    <option value="ukg">UKG</option>
                    <option value="1st">1st</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Student Name:</label>
                  <input
                    type="text"
                    placeholder="Search by student name"
                    value={financialFilters.studentName}
                    onChange={(e) => handleFilterChange('studentName', e.target.value)}
                  />
                </div>
                
                <div className="filter-group">
                  <label>Type:</label>
                  <select
                    value={financialFilters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Category:</label>
                  <select
                    value={financialFilters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {financialFilters.type === 'income' ? (
                      <>
                        <option value="Tuition Fees">Tuition Fees</option>
                        <option value="Admission Fees">Admission Fees</option>
                        <option value="Transportation Fees">Transportation Fees</option>
                        <option value="Van Fees">Van Fees</option>
                        <option value="Meal Charges">Meal Charges</option>
                        <option value="Activity Fees">Activity Fees</option>
                        <option value="Uniform Fees">Uniform Fees</option>
                        <option value="Book Fees">Book Fees</option>
                        <option value="Exam Fees">Exam Fees</option>
                        <option value="Donations">Donations</option>
                        <option value="Other Income">Other Income</option>
                      </>
                    ) : financialFilters.type === 'expense' ? (
                      <>
                        <option value="Staff Salaries">Staff Salaries</option>
                        <option value="Teacher Salaries">Teacher Salaries</option>
                        <option value="Van Driver Salaries">Van Driver Salaries</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Water">Water</option>
                        <option value="Internet">Internet</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Building Maintenance">Building Maintenance</option>
                        <option value="Van Maintenance">Van Maintenance</option>
                        <option value="Supplies">Supplies</option>
                        <option value="Stationery">Stationery</option>
                        <option value="Teaching Materials">Teaching Materials</option>
                        <option value="Food & Catering">Food & Catering</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Van Fuel & Maintenance">Van Fuel & Maintenance</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Van Insurance">Van Insurance</option>
                        <option value="School Insurance">School Insurance</option>
                        <option value="Other Expenses">Other Expenses</option>
                      </>
                    ) : (
                      <>
                        <option value="Tuition Fees">Tuition Fees</option>
                        <option value="Admission Fees">Admission Fees</option>
                        <option value="Transportation Fees">Transportation Fees</option>
                        <option value="Van Fees">Van Fees</option>
                        <option value="Meal Charges">Meal Charges</option>
                        <option value="Activity Fees">Activity Fees</option>
                        <option value="Uniform Fees">Uniform Fees</option>
                        <option value="Book Fees">Book Fees</option>
                        <option value="Exam Fees">Exam Fees</option>
                        <option value="Donations">Donations</option>
                        <option value="Other Income">Other Income</option>
                        <option value="Staff Salaries">Staff Salaries</option>
                        <option value="Teacher Salaries">Teacher Salaries</option>
                        <option value="Van Driver Salaries">Van Driver Salaries</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Water">Water</option>
                        <option value="Internet">Internet</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Building Maintenance">Building Maintenance</option>
                        <option value="Van Maintenance">Van Maintenance</option>
                        <option value="Supplies">Supplies</option>
                        <option value="Stationery">Stationery</option>
                        <option value="Teaching Materials">Teaching Materials</option>
                        <option value="Food & Catering">Food & Catering</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Van Fuel & Maintenance">Van Fuel & Maintenance</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Van Insurance">Van Insurance</option>
                        <option value="School Insurance">School Insurance</option>
                        <option value="Other Expenses">Other Expenses</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Start Date:</label>
                  <input
                    type="date"
                    value={financialFilters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </div>
                
                <div className="filter-group">
                  <label>End Date:</label>
                  <input
                    type="date"
                    value={financialFilters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="filter-summary">
                <span className="filter-count">
                  Showing {filteredFinancialRecords.length} of {financialRecords.length} records
                </span>
              </div>
              
              <div className="filter-actions">
                <Button variant="primary" onClick={applyFinancialFilters}>
                  🔍 Apply Filters
                </Button>
                <Button variant="secondary" onClick={clearFinancialFilters}>
                  🗑️ Clear Filters
                </Button>
              </div>
            </div>

            <div className="finance-table">
              <Table
                columns={financialColumns}
                data={filteredFinancialRecords}
                actions={(r: FinancialRecord) => (
                  <>
                    <Button variant="secondary" className="btn-edit">Edit</Button>
                    <Button variant="danger" className="btn-delete" onClick={() => deleteFinancialRecord(r.id || '')}>Delete</Button>
                  </>
                )}
                emptyMessage="No financial records found."
              />
            </div>
          </div>
        )}

        {/* Gallery Tab - DISABLED: Database not configured for image upload */}
        {/* 
        {activeTab === 'gallery' && (
          <div className="tab-content">
            <div className="section-header">
              <h3>Photo Gallery Management</h3>
              <Button className="btn-primary" variant="primary" onClick={() => navigateToForm('add-photo')}>Upload Photo</Button>
            </div>
            
            <div className="gallery-grid">
              {photos.map((photo) => (
                <div key={photo.id} className="gallery-item">
                  <img src={photo.imageUrl} alt={photo.title} />
                  <div className="photo-info">
                    <h4>{photo.title}</h4>
                    <p>{photo.description}</p>
                    <span className="photo-category">{photo.category}</span>
                    <div className="photo-actions">
                      <button className="btn-edit">Edit</button>
                      <Button variant="secondary" className="btn-edit">Edit</Button>
                      <Button variant="danger" className="btn-delete" onClick={() => deletePhoto(photo.id || '')}>Delete</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        */}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="tab-content">
            <div className="section-header">
              <h3>Event Management</h3>
              <Button className="btn-primary" variant="primary" onClick={() => navigateToForm('add-event')}>Create Event</Button>
            </div>
            
            <div className="events-grid">
              {events.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <h4>{event.title}</h4>
                    <span className={`status-badge ${event.isActive ? 'active' : 'inactive'}`}>
                      {event.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p>{event.description}</p>
                  <div className="event-details">
                    <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                    <span>🕒 {event.time}</span>
                    <span>📍 {event.location}</span>
                  </div>
                  <div className="event-actions">
                    <button 
                      className="btn-toggle"
                      onClick={() => toggleEventStatus(event.id || '')}
                      title={event.isActive ? 'Deactivate Event' : 'Activate Event'}
                    >
                      {event.isActive ? '⏸️' : '▶️'}
                    </button>
                    <Button 
                      variant="secondary" 
                      className="btn-edit"
                      onClick={() => navigate(`/admin/edit-event/${event.id}`)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      className="btn-delete" 
                      onClick={() => deleteEvent(event.id || '')}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="tab-content">
            <div className="section-header">
              <h3>User Management</h3>
              <div className="header-actions">
                <Button className="btn-secondary" variant="secondary" onClick={() => setIsExcelBulkUserCreationModalOpen(true)}>
                  📊 Excel Bulk Create
                </Button>
                <Button className="btn-primary" variant="primary" onClick={() => setIsUserCreationModalOpen(true)}>
                  ➕ Add Single User
                </Button>
              </div>
            </div>

            
            <div className="users-table">
              <Table
                columns={userColumns}
                data={users}
                actions={(u: User, _idx: number) => (
                  <>
                    <Button variant="secondary" className="btn-edit" onClick={() => editUser(u.id || '')}>Edit</Button>
                    <Button variant="danger" className="btn-delete" onClick={() => deleteUser(u.id || '')} disabled={u.id === user.id}>
                      {u.id === user.id ? 'Current User' : 'Delete'}
                    </Button>
                  </>
                )}
                emptyMessage="No users found."
              />
            </div>
          </div>
        )}
      </div>

      {/* User Creation Modal */}
      <UserCreationModal
        isOpen={isUserCreationModalOpen}
        onClose={() => setIsUserCreationModalOpen(false)}
        onUserCreated={() => {
          loadAllData(); // This will reload both users and students
          setIsUserCreationModalOpen(false);
        }}
      />

      {/* Excel Bulk User Creation Modal */}
      <ExcelBulkUserCreationModal
        isOpen={isExcelBulkUserCreationModalOpen}
        onClose={() => setIsExcelBulkUserCreationModalOpen(false)}
        onUsersCreated={() => {
          loadAllData(); // This will reload both users and students
          setIsExcelBulkUserCreationModalOpen(false);
        }}
      />
    </div>
  );
};

export default AdminDashboard;
