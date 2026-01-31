/**
 * Firebase Services
 * Centralized export for all service modules
 */

// Auth Service
export { authService } from './auth.service';

// User Service
export { userService } from './user.service';

// Student Service
export { studentService } from './student.service';

// Attendance Service
export { attendanceService } from './attendance.service';

// Financial Service
export { financialService } from './financial.service';

// Event Service
export { eventService } from './event.service';

// Photo Service
export { photoService } from './photo.service';

// Announcement Service
export { announcementService } from './announcement.service';

// Holiday Service
export { holidayService } from './holiday.service';

// Re-export for backward compatibility
// Components can import from '@/firebase/services' and get all services
export * from './auth.service';
export * from './user.service';
export * from './student.service';
export * from './attendance.service';
export * from './financial.service';
export * from './event.service';
export * from './photo.service';
export * from './announcement.service';
export * from './holiday.service';
