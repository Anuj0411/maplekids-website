import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config';

export interface Holiday {
  id?: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  name: string;
  createdAt: string;
  createdBy: {
    userId: string;
    name: string;
    email: string;
  };
}

const HOLIDAYS_COLLECTION = 'holidays';

class HolidayService {
  /**
   * Get all holidays
   */
  async getAllHolidays(): Promise<Holiday[]> {
    try {
      const holidaysRef = collection(db, HOLIDAYS_COLLECTION);
      const snapshot = await getDocs(holidaysRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Holiday));
    } catch (error) {
      console.error('Error fetching holidays:', error);
      throw error;
    }
  }

  /**
   * Get holidays for a specific year
   */
  async getHolidaysByYear(year: number): Promise<Holiday[]> {
    try {
      const allHolidays = await this.getAllHolidays();
      const yearStart = `${year}-01-01`;
      const yearEnd = `${year}-12-31`;
      
      // Filter holidays that overlap with the year
      return allHolidays.filter(holiday => {
        return holiday.startDate <= yearEnd && holiday.endDate >= yearStart;
      });
    } catch (error) {
      console.error('Error fetching holidays by year:', error);
      throw error;
    }
  }

  /**
   * Get holidays for a specific date range
   */
  async getHolidaysByDateRange(startDate: string, endDate: string): Promise<Holiday[]> {
    try {
      const allHolidays = await this.getAllHolidays();
      
      // Filter holidays that overlap with the date range
      return allHolidays.filter(holiday => {
        return holiday.startDate <= endDate && holiday.endDate >= startDate;
      });
    } catch (error) {
      console.error('Error fetching holidays by date range:', error);
      throw error;
    }
  }

  /**
   * Check if a specific date is a holiday
   */
  async isHoliday(date: string): Promise<boolean> {
    try {
      const allHolidays = await this.getAllHolidays();
      return allHolidays.some(holiday => date >= holiday.startDate && date <= holiday.endDate);
    } catch (error) {
      console.error('Error checking if date is holiday:', error);
      return false;
    }
  }

  /**
   * Get holiday set (dates only) for quick lookup
   * Works purely with date strings - no timezone conversion
   */
  async getHolidayDatesSet(year?: number): Promise<Set<string>> {
    try {
      console.log('getHolidayDatesSet called with year:', year);
      
      const holidays = year 
        ? await this.getHolidaysByYear(year)
        : await this.getAllHolidays();
      
      console.log('Raw holidays from DB:', holidays);
      console.log('Number of holidays:', holidays.length);
      
      const dateSet = new Set<string>();
      
      // Simply add all holiday dates as strings
      holidays.forEach(holiday => {
        console.log(`Processing holiday: ${holiday.name}, startDate: "${holiday.startDate}", endDate: "${holiday.endDate}"`);
        
        // Add start date
        dateSet.add(holiday.startDate);
        console.log(`Added start date: ${holiday.startDate}`);
        
        // If it's a range, add all dates in between
        if (holiday.startDate !== holiday.endDate) {
          const start = holiday.startDate; // "2026-01-30"
          const end = holiday.endDate;     // "2026-02-05"
          
          let currentDate = start;
          
          // Generate all dates between start and end
          while (currentDate <= end) {
            dateSet.add(currentDate);
            console.log(`Added: ${currentDate}`);
            
            // Increment date by adding 1 day
            currentDate = this.addDays(currentDate, 1);
          }
        } else {
          console.log(`Single day holiday: ${holiday.startDate}`);
        }
      });
      
      console.log('Final holiday dates set:', Array.from(dateSet));
      return dateSet;
    } catch (error) {
      console.error('Error getting holiday dates set:', error);
      return new Set();
    }
  }

  /**
   * Add days to a date string (YYYY-MM-DD format)
   * Pure string/math manipulation - no Date objects
   */
  private addDays(dateStr: string, days: number): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);
    
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    
    return `${y}-${m}-${d}`;
  }

  /**
   * Add a new holiday
   */
  async addHoliday(holiday: Omit<Holiday, 'id'>): Promise<string> {
    try {
      const holidaysRef = collection(db, HOLIDAYS_COLLECTION);
      const docRef = await addDoc(holidaysRef, holiday);
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding holiday:', error);
      throw error;
    }
  }

  /**
   * Update an existing holiday
   */
  async updateHoliday(holidayId: string, updates: Partial<Holiday>): Promise<void> {
    try {
      const holidayRef = doc(db, HOLIDAYS_COLLECTION, holidayId);
      await updateDoc(holidayRef, updates);
    } catch (error) {
      console.error('Error updating holiday:', error);
      throw error;
    }
  }

  /**
   * Delete a holiday
   */
  async deleteHoliday(holidayId: string): Promise<void> {
    try {
      const holidayRef = doc(db, HOLIDAYS_COLLECTION, holidayId);
      await deleteDoc(holidayRef);
    } catch (error) {
      console.error('Error deleting holiday:', error);
      throw error;
    }
  }

  /**
   * Check if a date is Sunday
   */
  isSunday(date: string): boolean {
    const d = new Date(date + 'T00:00:00');
    return d.getDay() === 0;
  }

  /**
   * Check if a date is a non-working day (Sunday or holiday)
   */
  async isNonWorkingDay(date: string): Promise<boolean> {
    if (this.isSunday(date)) {
      return true;
    }
    return await this.isHoliday(date);
  }

  /**
   * Get working days count between two dates (excluding Sundays and holidays)
   */
  async getWorkingDaysCount(startDate: string, endDate: string): Promise<number> {
    try {
      const holidays = await this.getAllHolidays();
      const holidayDates = new Set<string>();
      
      // Expand all holiday ranges into individual dates
      holidays.forEach(holiday => {
        const start = new Date(holiday.startDate + 'T00:00:00');
        const end = new Date(holiday.endDate + 'T00:00:00');
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          holidayDates.add(d.toISOString().split('T')[0]);
        }
      });
      
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');
      let workingDays = 0;
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const isSunday = d.getDay() === 0;
        const isHoliday = holidayDates.has(dateStr);
        
        if (!isSunday && !isHoliday) {
          workingDays++;
        }
      }
      
      return workingDays;
    } catch (error) {
      console.error('Error calculating working days:', error);
      throw error;
    }
  }
}

export const holidayService = new HolidayService();
