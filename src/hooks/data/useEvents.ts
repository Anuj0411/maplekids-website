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

	return {
		events,
		loading,
		error,
		refetch,
		fetchEvents,
	};
};
