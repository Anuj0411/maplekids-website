import {
	collection,
	doc,
	addDoc,
	updateDoc,
	deleteDoc,
	getDocs,
	query,
	where,
	serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config';
import type { Event } from '../types';
import { handleError } from '../utils/errorHandler';

/**
 * Event Service
 * Handles event management, including creation, updates, and auto-expiration
 */
export const eventService = {
	/**
	 * Add new event
	 */
	async addEvent(eventData: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
		try {
			console.log('Adding event to Firebase:', eventData);
			const docRef = await addDoc(collection(db, 'events'), {
				...eventData,
				createdAt: serverTimestamp(),
			});
			const createdEvent = { ...eventData, id: docRef.id };
			console.log('Event added successfully:', createdEvent);
			return createdEvent;
		} catch (error) {
			console.error('Error adding event:', error);
			throw handleError(error, 'Error adding event');
		}
	},

	/**
	 * Get all events
	 * Automatically expires past events
	 */
	async getAllEvents(): Promise<Event[]> {
		try {
			console.log('Fetching all events from Firebase...');
			const querySnapshot = await getDocs(collection(db, 'events'));
			const events = querySnapshot.docs.map((doc: any) => ({
				id: doc.id,
				...doc.data(),
			})) as Event[];
			console.log('All events fetched:', events);
			
			// Auto-expire past events
			await this.expirePastEvents(events);
			
			return events;
		} catch (error) {
			console.error('Error fetching all events:', error);
			throw handleError(error, 'Error fetching all events');
		}
	},

	/**
	 * Auto-expire past events
	 * Marks events as inactive if their date has passed
	 */
	async expirePastEvents(events: Event[]): Promise<void> {
		try {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			
			const expiredEvents = events.filter(event => {
				const eventDate = new Date(event.date);
				eventDate.setHours(0, 0, 0, 0);
				return event.isActive && eventDate < today;
			});

			if (expiredEvents.length > 0) {
				console.log(`Auto-expiring ${expiredEvents.length} past events`);
				
				const updatePromises = expiredEvents.map(event => {
					if (event.id) {
						return updateDoc(doc(db, 'events', event.id), {
							isActive: false
						});
					}
					return Promise.resolve();
				});

				await Promise.all(updatePromises);
				console.log('Past events auto-expired successfully');
			}
		} catch (error) {
			console.error('Error auto-expiring past events:', error);
		}
	},

	/**
	 * Get active events only
	 * Returns events sorted by date
	 */
	async getActiveEvents(): Promise<Event[]> {
		try {
			const q = query(
				collection(db, 'events'),
				where('isActive', '==', true)
			);
			const querySnapshot = await getDocs(q);
			const events = querySnapshot.docs.map((doc: any) => ({
				id: doc.id,
				...doc.data(),
			})) as Event[];
			
			// Sort by date on the client side since date might be stored as string
			return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
		} catch (error) {
			console.error('Error getting active events:', error);
			throw handleError(error, 'Error fetching active events');
		}
	},

	/**
	 * Update event
	 */
	async updateEvent(id: string, eventData: Partial<Event>): Promise<void> {
		try {
			const eventRef = doc(db, 'events', id);
			await updateDoc(eventRef, eventData);
		} catch (error) {
			throw handleError(error, `Error updating event ${id}`);
		}
	},

	/**
	 * Delete event
	 */
	async deleteEvent(id: string): Promise<void> {
		try {
			const eventRef = doc(db, 'events', id);
			await deleteDoc(eventRef);
		} catch (error) {
			throw handleError(error, `Error deleting event ${id}`);
		}
	},

	/**
	 * Get event by ID
	 */
	async getEventById(id: string): Promise<Event | null> {
		try {
			const allEvents = await this.getAllEvents();
			return allEvents.find(event => event.id === id) || null;
		} catch (error) {
			throw handleError(error, `Error fetching event ${id}`);
		}
	},

	/**
	 * Get events by date range
	 */
	async getEventsByDateRange(startDate: string, endDate: string): Promise<Event[]> {
		try {
			const allEvents = await this.getAllEvents();
			return allEvents.filter(event => {
				const eventDate = new Date(event.date);
				const start = new Date(startDate);
				const end = new Date(endDate);
				return eventDate >= start && eventDate <= end;
			}).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
		} catch (error) {
			throw handleError(error, `Error fetching events from ${startDate} to ${endDate}`);
		}
	},

	/**
	 * Create event (alias for addEvent for consistency)
	 */
	async createEvent(eventData: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
		return this.addEvent(eventData);
	},
};
