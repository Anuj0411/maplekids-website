import React, { useState, useEffect } from 'react';
import { holidayService, Holiday } from '@/firebase/services/holiday.service';
import { useCurrentUser } from '@/hooks/auth/useCurrentUser';
import { Button } from '@/components/common';
import { Toast, ToastType } from '@/components/ui';
import './HolidayManager.css';

const HolidayManager: React.FC = () => {
  const { userData: currentUser } = useCurrentUser();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: ToastType }>({
    isOpen: false,
    message: '',
    type: 'info'
  });

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    name: ''
  });

  const loadHolidays = async () => {
    try {
      setLoading(true);
      const data = await holidayService.getHolidaysByYear(selectedYear);
      setHolidays(data.sort((a, b) => a.startDate.localeCompare(b.startDate)));
    } catch (error) {
      console.error('Error loading holidays:', error);
      showToast('Failed to load holidays', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  const showToast = (message: string, type: ToastType) => {
    setToast({ isOpen: true, message, type });
  };

  const resetForm = () => {
    setFormData({
      startDate: '',
      endDate: '',
      name: ''
    });
    setEditingHoliday(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      showToast('User not authenticated', 'error');
      return;
    }

    // Validate that end date is not before start date
    if (formData.endDate < formData.startDate) {
      showToast('End date cannot be before start date', 'error');
      return;
    }

    try {
      if (editingHoliday) {
        // Update existing holiday
        await holidayService.updateHoliday(editingHoliday.id!, formData);
        showToast('Holiday updated successfully', 'success');
      } else {
        // Add new holiday
        const holidayData: Omit<Holiday, 'id'> = {
          ...formData,
          createdAt: new Date().toISOString(),
          createdBy: {
            userId: currentUser.id,
            name: `${currentUser.firstName} ${currentUser.lastName}`,
            email: currentUser.email
          }
        };
        await holidayService.addHoliday(holidayData);
        showToast('Holiday added successfully', 'success');
      }

      resetForm();
      loadHolidays();
    } catch (error) {
      console.error('Error saving holiday:', error);
      showToast('Failed to save holiday', 'error');
    }
  };

  const handleEdit = (holiday: Holiday) => {
    setFormData({
      startDate: holiday.startDate,
      endDate: holiday.endDate,
      name: holiday.name
    });
    setEditingHoliday(holiday);
    setShowAddForm(true);
  };

  const handleDelete = async (holidayId: string) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) {
      return;
    }

    try {
      await holidayService.deleteHoliday(holidayId);
      showToast('Holiday deleted successfully', 'success');
      loadHolidays();
    } catch (error) {
      console.error('Error deleting holiday:', error);
      showToast('Failed to delete holiday', 'error');
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    
    if (startDate === endDate) {
      return start.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else {
      const startStr = start.toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric' 
      });
      const endStr = end.toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      return `${startStr} - ${endStr}`;
    }
  };

  const getDayCount = (startDate: string, endDate: string) => {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days === 1 ? '1 day' : `${days} days`;
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i);

  if (loading) {
    return (
      <div className="holiday-manager-loading">
        <div className="spinner"></div>
        <p>Loading holidays...</p>
      </div>
    );
  }

  return (
    <div className="holiday-manager">
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />

      <div className="holiday-header">
        <div className="holiday-header-left">
          <h3>🗓️ Holiday Management</h3>
          <p>Manage school holidays and non-working days</p>
        </div>
        <div className="holiday-header-right">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="year-select"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant="primary"
            className="add-holiday-btn"
          >
            {showAddForm ? '❌ Cancel' : '➕ Add Holiday'}
          </Button>
        </div>
      </div>

      {showAddForm && (
        <div className="holiday-form-card">
          <h4>{editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}</h4>
          <form onSubmit={handleSubmit} className="holiday-form">
            <div className="form-group">
              <label htmlFor="name">Holiday Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Independence Day, Summer Break"
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) => {
                    const newStartDate = e.target.value;
                    setFormData({ 
                      ...formData, 
                      startDate: newStartDate,
                      endDate: formData.endDate || newStartDate // Auto-fill end date if empty
                    });
                  }}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End Date *</label>
                <input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-actions">
              <Button type="submit" variant="primary">
                {editingHoliday ? '💾 Update Holiday' : '➕ Add Holiday'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="holidays-list">
        {holidays.length === 0 ? (
          <div className="no-holidays">
            <p>📅 No holidays found for {selectedYear}</p>
            <p className="no-holidays-hint">Click "Add Holiday" to create one</p>
          </div>
        ) : (
          <div className="holidays-grid">
            {holidays.map((holiday) => (
              <div key={holiday.id} className="holiday-card">
                <div className="holiday-card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 className="holiday-name">{holiday.name}</h4>
                    <span className="holiday-type-badge">
                      {getDayCount(holiday.startDate, holiday.endDate)}
                    </span>
                  </div>
                  <p className="holiday-date">{formatDateRange(holiday.startDate, holiday.endDate)}</p>
                </div>
                <div className="holiday-actions">
                  <button
                    onClick={() => handleEdit(holiday)}
                    className="action-btn edit-btn"
                    title="Edit holiday"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(holiday.id!)}
                    className="action-btn delete-btn"
                    title="Delete holiday"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="holiday-info-card">
        <h4>ℹ️ Important Information</h4>
        <ul>
          <li>🚫 Teachers cannot mark attendance on holidays</li>
          <li>📊 Holidays are excluded from attendance calculations</li>
          <li>☀️ Sundays are automatically treated as non-working days</li>
          <li>📅 Calendar dates will be greyed out for holidays and Sundays</li>
        </ul>
      </div>
    </div>
  );
};

export default HolidayManager;
