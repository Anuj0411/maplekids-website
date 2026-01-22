import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Photo } from '@/firebase/types';
import { photoService } from '@/firebase/services';
import { db, storage } from '@/firebase/config';

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

	/**
	 * Upload photo to Firebase Storage
	 * Returns the download URL
	 */
	const uploadPhoto = useCallback(async (file: File): Promise<string> => {
		try {
			const storageRef = ref(
				storage,
				`photos/${Date.now()}_${file.name}`
			);
			const snapshot = await uploadBytes(storageRef, file);
			const downloadURL = await getDownloadURL(snapshot.ref);
			return downloadURL;
		} catch (err: any) {
			console.error('Error uploading photo to storage:', err);
			throw new Error(err.message || 'Failed to upload photo to storage');
		}
	}, []);

	/**
	 * Add photo metadata to Firestore
	 * Includes optimistic update to local state
	 */
	const addPhoto = useCallback(async (
		photoData: Omit<Photo, 'id' | 'uploadedAt'>
	): Promise<Photo> => {
		try {
			const docRef = await addDoc(collection(db, 'photos'), {
				...photoData,
				uploadedAt: serverTimestamp(),
			});
			
			const newPhoto = { ...photoData, id: docRef.id } as Photo;
			
			// Optimistic update: Add to local state
			setPhotos(prev => [newPhoto, ...prev]);
			
			return newPhoto;
		} catch (err: any) {
			console.error('Error adding photo to Firestore:', err);
			throw new Error(err.message || 'Failed to add photo metadata');
		}
	}, []);

	/**
	 * Convenience method that uploads photo and saves metadata
	 * Combines uploadPhoto and addPhoto in one call
	 */
	const uploadPhotoWithMetadata = useCallback(async (
		file: File,
		metadata: Omit<Photo, 'id' | 'uploadedAt' | 'imageUrl'>
	): Promise<Photo> => {
		try {
			// Upload image to Storage
			const imageUrl = await uploadPhoto(file);
			
			// Save metadata to Firestore
			const photo = await addPhoto({ ...metadata, imageUrl });
			
			return photo;
		} catch (err: any) {
			console.error('Error uploading photo with metadata:', err);
			throw new Error(err.message || 'Failed to upload photo');
		}
	}, [uploadPhoto, addPhoto]);

	return {
		photos,
		loading,
		error,
		refetch,
		fetchPhotos,
		uploadPhoto,
		addPhoto,
		uploadPhotoWithMetadata,
	};
};
