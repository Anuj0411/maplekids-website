import { useState, useEffect, useCallback } from 'react';
import type { Photo } from '@/firebase/types';
import { photoService } from '@/firebase/services';

interface UsePhotosOptions {
	category?: string;
	autoFetch?: boolean;
}

/**
 * Photos Data Hook
 * 
 * Fetches photo gallery data with optional category filtering.
 * Provides loading states, error handling, and manual refetch capability.
 * 
 * @param options - Configuration options
 * @param options.category - Filter photos by category
 * @param options.autoFetch - Whether to automatically fetch on mount (default: true)
 * 
 * @returns Photo data and control functions
 * 
 * @example
 * // Fetch all photos
 * const { photos, loading } = usePhotos();
 * 
 * @example
 * // Fetch photos by category
 * const { photos, loading } = usePhotos({ category: 'events' });
 */
export const usePhotos = (options: UsePhotosOptions = {}) => {
	const { category, autoFetch = true } = options;

	const [photos, setPhotos] = useState<Photo[]>([]);
	const [loading, setLoading] = useState(autoFetch);
	const [error, setError] = useState<string | null>(null);

	const fetchPhotos = useCallback(async (fetchOptions?: UsePhotosOptions) => {
		try {
			setLoading(true);
			setError(null);

			const opts = fetchOptions || options;
			let data: Photo[] = [];

			if (opts.category) {
				// Filter by category
				data = await photoService.getPhotosByCategory(opts.category);
			} else {
				// Get all photos
				data = await photoService.getAllPhotos();
			}

			setPhotos(data);
		} catch (err: any) {
			console.error('Error fetching photos:', err);
			setError(err.message || 'Failed to fetch photos');
			setPhotos([]);
		} finally {
			setLoading(false);
		}
	}, [options]);

	useEffect(() => {
		if (autoFetch) {
			fetchPhotos();
		}
	}, [category, autoFetch, fetchPhotos]);

	const refetch = useCallback(() => {
		fetchPhotos();
	}, [fetchPhotos]);

	return {
		photos,
		loading,
		error,
		refetch,
		fetchPhotos,
	};
};
