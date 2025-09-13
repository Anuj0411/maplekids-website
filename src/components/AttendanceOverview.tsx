import React, { useState, useEffect } from 'react';
import { attendanceService } from '../firebase/services';
import { Button } from './common';
import './AttendanceOverview.css';

interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  missed: number;
}

interface AttendanceOverviewProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

type ViewMode = 'daily' | 'dateRange' | 'monthly';

interface DateRangeStats {
  dailyStats: { [date: string]: { [className: string]: AttendanceStats } };
  summaryStats: { [className: string]: AttendanceStats & { daysWithAttendance: number } };
  totalDays: number;
  workingDays?: number;
}

const AttendanceOverview: React.FC<AttendanceOverviewProps> = ({ 
  selectedDate, 
  onDateChange 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [attendanceStats, setAttendanceStats] = useState<{ [className: string]: AttendanceStats }>({});
  const [dateRangeStats, setDateRangeStats] = useState<DateRangeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Date range state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Monthly view state
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    
  const loadAttendanceStats = async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const stats = await attendanceService.getAttendanceStatistics(date);
      setAttendanceStats(stats);
    } catch (err) {
      console.error('Error loading attendance stats:', err);
      setError('Failed to load attendance statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadDateRangeStats = async (start: string, end: string) => {
    setLoading(true);
    setError(null);
    try {
      const stats = await attendanceService.getAttendanceStatisticsByDateRange(start, end);
      setDateRangeStats(stats);
    } catch (err) {
      console.error('Error loading date range stats:', err);
      setError('Failed to load date range statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyStats = async (year: number, month: number) => {
    setLoading(true);
    setError(null);
    try {
      const stats = await attendanceService.getAttendanceStatisticsByMonth(year, month);
      setDateRangeStats(stats);
    } catch (err) {
      console.error('Error loading monthly stats:', err);
      setError('Failed to load monthly statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'daily') {
      loadAttendanceStats(selectedDate);
    } else if (viewMode === 'dateRange' && startDate && endDate) {
      loadDateRangeStats(startDate, endDate);
    } else if (viewMode === 'monthly') {
      loadMonthlyStats(selectedYear, selectedMonth);
    }
  }, [selectedDate, viewMode, startDate, endDate, selectedYear, selectedMonth]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(e.target.value);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setDateRangeStats(null);
    setAttendanceStats({});
  };

  const handleDateRangeChange = () => {
    if (startDate && endDate && new Date(startDate) <= new Date(endDate)) {
      loadDateRangeStats(startDate, endDate);
    }
  };

  const handleMonthlyChange = () => {
    loadMonthlyStats(selectedYear, selectedMonth);
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const getAttendancePercentage = (stats: AttendanceStats) => {
    if (stats.total === 0) return 0;
    return Math.round(((stats.present + stats.late) / stats.total) * 100);
  };



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return '✅';
      case 'absent': return '❌';
      case 'late': return '⏰';
      case 'missed': return '❓';
      default: return '❓';
    }
  };

  const classOrder = ['play', 'nursery', 'lkg', 'ukg', '1st'];

  return (
    <div className="attendance-overview">
      <div className="attendance-header">
        <h3>📊 Attendance Overview</h3>
        
        {/* View Mode Selector */}
        <div className="view-mode-selector">
          <button 
            className={`mode-button ${viewMode === 'daily' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('daily')}
          >
            📅 Daily
          </button>
          <button 
            className={`mode-button ${viewMode === 'dateRange' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('dateRange')}
          >
            📆 Date Range
          </button>
          <button 
            className={`mode-button ${viewMode === 'monthly' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('monthly')}
          >
            📊 Monthly
          </button>
        </div>

        {/* Date Controls */}
        <div className="date-controls">
          {viewMode === 'daily' && (
            <div className="date-selector">
              <label htmlFor="attendance-date">Select Date:</label>
              <input
                id="attendance-date"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="date-input"
              />
            </div>
          )}

          {viewMode === 'dateRange' && (
            <div className="date-range-selector">
              <div className="date-input-group">
                <label htmlFor="start-date">From:</label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="date-input"
                />
              </div>
              <div className="date-input-group">
                <label htmlFor="end-date">To:</label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="date-input"
                />
              </div>
              <Button 
                variant="primary" 
                onClick={handleDateRangeChange}
                disabled={!startDate || !endDate || new Date(startDate) > new Date(endDate)}
              >
                Load Range
              </Button>
            </div>
          )}

          {viewMode === 'monthly' && (
            <div className="monthly-selector">
              <div className="date-input-group">
                <label htmlFor="year-select">Year:</label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="date-input"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="date-input-group">
                <label htmlFor="month-select">Month:</label>
                <select
                  id="month-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="date-input"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>{getMonthName(month)}</option>
                  ))}
                </select>
              </div>
              <Button 
                variant="primary" 
                onClick={handleMonthlyChange}
              >
                Load Month
              </Button>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Loading attendance data...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <Button 
            variant="primary" 
            onClick={() => loadAttendanceStats(selectedDate)}
            className="retry-button"
          >
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && (
        <div className="attendance-content">
          {viewMode === 'daily' && Object.keys(attendanceStats).length === 0 ? (
            <div className="no-data-message">
              <p>📅 No attendance data available for {new Date(selectedDate).toLocaleDateString()}</p>
              <p className="sub-message">Teachers can mark attendance for their classes to see statistics here.</p>
            </div>
          ) : viewMode === 'dateRange' && !dateRangeStats ? (
            <div className="no-data-message">
              <p>📆 Select a date range to view attendance statistics</p>
              <p className="sub-message">Choose start and end dates to analyze attendance patterns.</p>
            </div>
          ) : viewMode === 'monthly' && !dateRangeStats ? (
            <div className="no-data-message">
              <p>📊 Select a month and year to view monthly attendance statistics</p>
              <p className="sub-message">Choose a month to see comprehensive attendance analysis.</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="attendance-summary">
                {classOrder.map(className => {
                  let stats: AttendanceStats;
                  let additionalInfo = '';
                  
                  if (viewMode === 'daily') {
                    stats = attendanceStats[className];
                    if (!stats) return null;
                  } else {
                    const rangeStats = dateRangeStats?.summaryStats[className];
                    if (!rangeStats) return null;
                    stats = rangeStats;
                    additionalInfo = viewMode === 'monthly' 
                      ? ` (${rangeStats.daysWithAttendance}/${dateRangeStats?.workingDays || 0} working days)`
                      : ` (${rangeStats.daysWithAttendance}/${dateRangeStats?.totalDays || 0} days)`;
                  }
                  
                  const percentage = getAttendancePercentage(stats);
                  
                  return (
                    <div key={className} className="class-summary-card">
                      <div className="class-header">
                        <h4 className="class-name">{className.toUpperCase()}</h4>
                        <span className="attendance-percentage">{percentage}%</span>
                      </div>
                      
                      <div className="class-stats">
                        <div className="stat-item present">
                          <span className="stat-icon">✅</span>
                          <span className="stat-label">Present</span>
                          <span className="stat-value">{stats.present}</span>
                        </div>
                        
                        <div className="stat-item absent">
                          <span className="stat-icon">❌</span>
                          <span className="stat-label">Absent</span>
                          <span className="stat-value">{stats.absent}</span>
                        </div>
                        
                        <div className="stat-item late">
                          <span className="stat-icon">⏰</span>
                          <span className="stat-label">Late</span>
                          <span className="stat-value">{stats.late}</span>
                        </div>
                        
                        <div className="stat-item missed">
                          <span className="stat-icon">❓</span>
                          <span className="stat-label">Not Marked</span>
                          <span className="stat-value">{stats.missed}</span>
                        </div>
                      </div>
                      
                      <div className="class-total">
                        <span className="total-label">Total Students:</span>
                        <span className="total-value">{stats.total}</span>
                        {additionalInfo && (
                          <div className="additional-info">{additionalInfo}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Table */}
              <div className="attendance-table-container">
                <h4>📋 Detailed Class-wise Attendance</h4>
                <div className="attendance-table">
                  <div className="table-header">
                    <div className="header-cell class">Class</div>
                    <div className="header-cell total">Total</div>
                    <div className="header-cell present">Present</div>
                    <div className="header-cell absent">Absent</div>
                    <div className="header-cell late">Late</div>
                    <div className="header-cell missed">Not Marked</div>
                    <div className="header-cell percentage">Attendance %</div>
                  </div>
                  
                  {classOrder.map(className => {
                    const stats = attendanceStats[className];
                    if (!stats) return null;
                    
                    const percentage = getAttendancePercentage(stats);
                    
                    return (
                      <div key={className} className="table-row">
                        <div className="table-cell class">
                          <span className="class-badge">{className.toUpperCase()}</span>
                        </div>
                        <div className="table-cell total">{stats.total}</div>
                        <div className="table-cell present">
                          <span className="status-badge present">
                            {getStatusIcon('present')} {stats.present}
                          </span>
                        </div>
                        <div className="table-cell absent">
                          <span className="status-badge absent">
                            {getStatusIcon('absent')} {stats.absent}
                          </span>
                        </div>
                        <div className="table-cell late">
                          <span className="status-badge late">
                            {getStatusIcon('late')} {stats.late}
                          </span>
                        </div>
                        <div className="table-cell missed">
                          <span className="status-badge missed">
                            {getStatusIcon('missed')} {stats.missed}
                          </span>
                        </div>
                        <div className="table-cell percentage">
                          <div className="percentage-bar">
                            <div 
                              className="percentage-fill"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: percentage >= 80 ? '#10B981' : percentage >= 60 ? '#F59E0B' : '#EF4444'
                              }}
                            ></div>
                            <span className="percentage-text">{percentage}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Overall Statistics */}
              <div className="overall-stats">
                <h4>📈 Overall Statistics</h4>
                <div className="overall-cards">
                  {(() => {
                    const totalStats = Object.values(attendanceStats).reduce(
                      (acc, stats) => ({
                        total: acc.total + stats.total,
                        present: acc.present + stats.present,
                        absent: acc.absent + stats.absent,
                        late: acc.late + stats.late,
                        missed: acc.missed + stats.missed
                      }),
                      { total: 0, present: 0, absent: 0, late: 0, missed: 0 }
                    );
                    
                    const overallPercentage = totalStats.total > 0 
                      ? Math.round(((totalStats.present + totalStats.late) / totalStats.total) * 100)
                      : 0;
                    
                    return (
                      <>
                        <div className="overall-card">
                          <div className="card-icon">👥</div>
                          <div className="card-content">
                            <h5>Total Students</h5>
                            <p className="card-value">{totalStats.total}</p>
                          </div>
                        </div>
                        
                        <div className="overall-card">
                          <div className="card-icon">✅</div>
                          <div className="card-content">
                            <h5>Present Today</h5>
                            <p className="card-value">{totalStats.present + totalStats.late}</p>
                          </div>
                        </div>
                        
                        <div className="overall-card">
                          <div className="card-icon">📊</div>
                          <div className="card-content">
                            <h5>Overall Attendance</h5>
                            <p className="card-value">{overallPercentage}%</p>
                          </div>
                        </div>
                        
                        <div className="overall-card">
                          <div className="card-icon">❓</div>
                          <div className="card-content">
                            <h5>Not Marked</h5>
                            <p className="card-value">{totalStats.missed}</p>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </>
          )}
        </div>
      )}


    </div>
  );
};

export default AttendanceOverview;
