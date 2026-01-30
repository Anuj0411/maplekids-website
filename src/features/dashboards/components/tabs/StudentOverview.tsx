import React from 'react';
import { StatCard, CompactCard, ActivityItem, Grid } from '@/components/ui';
import { Student } from '@/firebase/services';
import type { AcademicReport, StudentRemark } from '@/hooks/data/useStudentDashboardData';

export interface AttendanceStudent {
  rollNumber: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
}

export interface AttendanceRecord {
  id?: string;
  class: string;
  date: string;
  students: AttendanceStudent[];
  createdAt?: any;
  createdBy?: string;
}

interface StudentOverviewProps {
  student: Student;
  attendance: AttendanceRecord[];
  academicReports: AcademicReport[];
  remarks: StudentRemark[];
}

/**
 * StudentOverview Component - Mobile-First Redesign
 * 
 * Layout:
 * - Mobile: Vertical stack, full width cards
 * - Tablet: 2-column grid for stats
 * - Desktop: 4-column grid for stats, 2-column for content
 */
const StudentOverview: React.FC<StudentOverviewProps> = ({
  student,
  attendance,
  academicReports,
  remarks,
}) => {
  // Calculate attendance statistics
  const getAttendanceStats = () => {
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => {
      const studentAttendance = a.students.find(s => s.rollNumber === student.rollNumber);
      return studentAttendance?.status === 'present';
    }).length;
    
    const absentDays = attendance.filter(a => {
      const studentAttendance = a.students.find(s => s.rollNumber === student.rollNumber);
      return studentAttendance?.status === 'absent';
    }).length;
    
    const lateDays = attendance.filter(a => {
      const studentAttendance = a.students.find(s => s.rollNumber === student.rollNumber);
      return studentAttendance?.status === 'late';
    }).length;
    
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    
    return { totalDays, presentDays, absentDays, lateDays, percentage };
  };

  const stats = getAttendanceStats();

  // Prepare recent activities
  const getRecentActivities = () => {
    const activities: Array<{
      id: string;
      icon: string;
      title: string;
      description?: string;
      timestamp: string;
      type: 'default' | 'success' | 'warning' | 'info';
    }> = [];

    // Add recent academic reports
    academicReports.slice(0, 3).forEach((report) => {
      const date = report.createdAt?.toDate?.() || new Date(report.createdAt || Date.now());
      activities.push({
        id: `report-${report.id}`,
        icon: '📊',
        title: `${report.term} Report Card`,
        description: `${report.subjects.length} subjects evaluated`,
        timestamp: date.toLocaleDateString(),
        type: 'info',
      });
    });

    // Add recent remarks
    remarks.slice(0, 3).forEach((remark) => {
      const date = remark.createdAt?.toDate?.() || new Date(remark.createdAt || Date.now());
      const remarkPreview = remark.remark.length > 60 
        ? remark.remark.substring(0, 60) + '...' 
        : remark.remark;
      
      activities.push({
        id: `remark-${remark.id}`,
        icon: remark.type === 'positive' ? '✅' : remark.type === 'negative' ? '⚠️' : '💬',
        title: remark.type === 'positive' ? 'Positive Remark' : remark.type === 'negative' ? 'Needs Attention' : 'Teacher Remark',
        description: remarkPreview,
        timestamp: date.toLocaleDateString(),
        type: remark.type === 'positive' ? 'success' : remark.type === 'negative' ? 'warning' : 'default',
      });
    });

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return activities.slice(0, 5);
  };

  const recentActivities = getRecentActivities();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quick Stats Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 px-1">
          📊 Quick Stats
        </h2>
        <Grid cols={{ mobile: 1, tablet: 2, desktop: 4 }} gap={4}>
          <StatCard
            icon="📈"
            label="Attendance Rate"
            value={`${stats.percentage}%`}
            color="primary"
            trend={
              stats.percentage >= 90 
                ? { value: stats.percentage - 85, isPositive: true }
                : stats.percentage < 75 
                ? { value: 80 - stats.percentage, isPositive: false }
                : undefined
            }
          />
          
          <StatCard
            icon="✅"
            label="Present Days"
            value={stats.presentDays}
            color="success"
          />
          
          <StatCard
            icon="❌"
            label="Absent Days"
            value={stats.absentDays}
            color={stats.absentDays > 5 ? 'danger' : 'warning'}
          />
          
          <StatCard
            icon="⏰"
            label="Late Arrivals"
            value={stats.lateDays}
            color="warning"
          />
        </Grid>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Visual */}
        <CompactCard
          title="📅 Attendance Overview"
          actions={
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View Details →
            </button>
          }
        >
          <div className="flex flex-col items-center justify-center py-6">
            {/* Circular Progress */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              <svg className="transform -rotate-90" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                {/* Progress circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(stats.percentage / 100) * 339.292} 339.292`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {stats.percentage}%
                </span>
                <span className="text-xs text-gray-600">Attendance</span>
              </div>
            </div>
            
            {/* Stats breakdown */}
            <div className="grid grid-cols-3 gap-4 mt-6 w-full">
              <div className="text-center">
                <div className="text-xl font-bold text-success-600">{stats.presentDays}</div>
                <div className="text-xs text-gray-600">Present</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-danger-600">{stats.absentDays}</div>
                <div className="text-xs text-gray-600">Absent</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-warning-600">{stats.lateDays}</div>
                <div className="text-xs text-gray-600">Late</div>
              </div>
            </div>
          </div>
        </CompactCard>

        {/* Recent Activity */}
        <CompactCard
          title="📈 Recent Activity"
          maxHeight="400px"
          actions={
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </button>
          }
        >
          {recentActivities.length > 0 ? (
            <div className="space-y-0">
              {recentActivities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  icon={activity.icon}
                  title={activity.title}
                  description={activity.description}
                  timestamp={activity.timestamp}
                  type={activity.type}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-5xl mb-3">📝</div>
              <p className="text-gray-600 font-medium">No recent activity</p>
              <p className="text-sm text-gray-500 mt-1">
                Academic reports and remarks will appear here
              </p>
            </div>
          )}
        </CompactCard>
      </div>

      {/* Academic Summary (if reports exist) */}
      {academicReports.length > 0 && (
        <CompactCard title="📚 Latest Academic Report">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">
                {academicReports[0].subjects.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Subjects</div>
            </div>
            <div className="text-center p-4 bg-success-50 rounded-lg">
              <div className="text-2xl font-bold text-success-600">
                {academicReports[0].term}
              </div>
              <div className="text-sm text-gray-600 mt-1">Term</div>
            </div>
            <div className="text-center p-4 bg-secondary-50 rounded-lg">
              <div className="text-2xl font-bold text-secondary-600">
                {new Date(academicReports[0].createdAt?.toDate?.() || academicReports[0].createdAt).toLocaleDateString('en-US', { month: 'short' })}
              </div>
              <div className="text-sm text-gray-600 mt-1">Month</div>
            </div>
            <div className="text-center p-4 bg-warning-50 rounded-lg">
              <div className="text-2xl font-bold text-warning-600">
                {new Date(academicReports[0].createdAt?.toDate?.() || academicReports[0].createdAt).getFullYear()}
              </div>
              <div className="text-sm text-gray-600 mt-1">Year</div>
            </div>
          </div>
        </CompactCard>
      )}
    </div>
  );
};

export default StudentOverview;
