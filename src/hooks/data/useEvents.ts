import { useState, useEffect, useCallback } from 'react';
import type { Event } from '@/firebase/types';
import { eventService } from '@/firebase/services';

interface UseEventsOptions {
	activeOnly?: boolean;
	autoFetch?: boolean;
}

/**
 * Events Data Hook
 * 
 * Fetches event data with optional filtering for active events only.
 * Provides loading states, error handling, and manual refetch capability.
 * 
 * @param options - Configuration options
 * @param options.activeOnly - Filter for only active (non-expired) events
 * @param options.autoFetch - Whether to automatically fetch on mount (default: true)
 * 
 * @returns Event data and control functions
 * 
 * @example
 * // Fetch all events
 * const { events, loading } = useEvents();
 * 
 * @example
 * // Fetch only active events
 * const { events, loading } = useEvents({ activeOnly: true });
 */
export const useEvents = (options: UseEventsOptions = {}) => {
	const { activeOnly = false, autoFetch = true } = options;

	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(autoFetch);
	const [error, setError] = useState<string | null>(null);

	const fetchEvents = useCallback(async (fetchOptions?: UseEventsOptions) => {
		try {
			setLoading(true);
			setError(null);

			const opts = fetchOptions || options;
			let data: Event[] = [];

			if (opts.activeOnly) {
				// Get only active events
				data = await eventService.getActiveEvents();
			} else {
				// Get all events
				data = await eventService.getAllEvents();
			}

			setEvents(data);
		} catch (err: any) {
			console.error('Error fetching events:', err);
			setError(err.message || 'Failed to fetch events');
			setEvents([]);
		} finally {
			setLoading(false);
		}
	}, [options]);

	useEffect(() => {
		if (autoFetch) {
			fetchEvents();
		}
	}, [activeOnly, autoFetch, fetchEvents]);

	const refetch = useCallback(() => {
		fetchEvents();
	}, [fetchEvents]);

	/**
	 * Add a new event
	 */
	const addEvent = useCallback(async (eventData: Omit<Event, 'id' | 'createdAt'>) => {
		try {
			setLoading(true);
			setError(null);
			
			console.log('useEvents: Adding event:', eventData);
			const newEvent = await eventService.addEvent(eventData);
			
			// Optimistically update local state
			setEvents(prev => [...prev, newEvent]);
			console.log('useEvents: Event added successfully');
			
			return newEvent;
		} catch (err: any) {
			const errorMessage = err.message || 'Error adding event';
			setError(errorMessage);
			console.error('useEvents: Error adding event:', err);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Update an existing event
	 */
	const updateEvent = useCallback(async (id: string, eventData: Partial<Event>) => {
		try {
			setLoading(true);
			setError(null);
			
			console.log('useEvents: Updating event:', id, eventData);
			await eventService.updateEvent(id, eventData);
			
			// Optimistically update local state
			setEvents(prev => 
				prev.map(event => 
					event.id === id ? { ...event, ...eventData } : event
				)
			);
			console.log('useEvents: Event updated successfully');
		} catch (err: any) {
			const errorMessage = err.message || 'Error updating event';
			setError(errorMessage);
			console.error('useEvents: Error updating event:', err);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Delete an event
	 */
	const deleteEvent = useCallback(async (id: string) => {
		try {
			setLoading(true);
			setError(null);
			
			console.log('useEvents: Deleting event:', id);
			await eventService.deleteEvent(id);
			
			// Optimistically update local state
			setEvents(prev => prev.filter(event => event.id !== id));
			console.log('useEvents: Event deleted successfully');
		} catch (err: any) {
			const errorMessage = err.message || 'Error deleting event';
			setError(errorMessage);
			console.error('useEvents: Error deleting event:', err);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Toggle event active status
	 */
	const toggleEventStatus = useCallback(async (id: string) => {
		const event = events.find(e => e.id === id);
		if (!event) {
			console.error('useEvents: Event not found:', id);
			return;
		}

		try {
			setLoading(true);
			setError(null);
			
			const newStatus = !event.isActive;
			console.log('useEvents: Toggling event status:', id, 'to', newStatus);
			
			await eventService.updateEvent(id, { isActive: newStatus });
			
			// Optimistically update local state
			setEvents(prev => 
				prev.map(e => 
					e.id === id ? { ...e, isActive: newStatus } : e
				)
			);
			console.log('useEvents: Event status toggled successfully');
		} catch (err: any) {
			const errorMessage = err.message || 'Error toggling event status';
			setError(errorMessage);
			console.error('useEvents: Error toggling event status:', err);
			throw err;
		} finally {
			setLoading(false);
		}
	}, [events]);

	/**
	 * Get only active events
	 */
	const getActiveEvents = useCallback(() => {
		return events.filter(event => event.isActive);
	}, [events]);

	/**
	 * Get upcoming events (future dates + active)
	 */
	const getUpcomingEvents = useCallback(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		
		return events
			.filter(event => event.isActive && new Date(event.date) >= today)
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
	}, [events]);

	/**
	 * Get past events
	 */
	const getPastEvents = useCallback(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		
		return events
			.filter(event => new Date(event.date) < today)
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	}, [events]);

	/**
	 * Get events by date range
	 */
	const getEventsByDateRange = useCallback((startDate: string, endDate: string) => {
		const start = new Date(startDate);
		const end = new Date(endDate);
		start.setHours(0, 0, 0, 0);
		end.setHours(23, 59, 59, 999);
		
		return events.filter(event => {
			const eventDate = new Date(event.date);
			return eventDate >= start && eventDate <= end;
		});
	}, [events]);

	return {
		// Data
		events,
		activeEvents: getActiveEvents(),
		upcomingEvents: getUpcomingEvents(),
		pastEvents: getPastEvents(),
		
		// State
		loading,
		error,
		
		// Actions (CRUD)
		addEvent,
		updateEvent,
		deleteEvent,
		toggleEventStatus,
		refetch,
		fetchEvents,
		
		// Filters/Helpers
		getActiveEvents,
		getUpcomingEvents,
		getPastEvents,
		getEventsByDateRange,
	};
};
