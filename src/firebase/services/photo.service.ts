import {
	collection,
	doc,
	addDoc,
	deleteDoc,
	getDocs,
	query,
	where,
	orderBy,
	serverTimestamp,
	updateDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config';
import type { Photo } from '../types';
import { handleError } from '../utils/errorHandler';

/**
 * Photo Service
 * Handles photo uploads to Firebase Storage and photo metadata management
 */
export const photoService = {
	/**
	 * Upload photo to Firebase Storage
	 * Returns the download URL
	 */
	async uploadPhoto(file: File): Promise<string> {
		try {
			const storageRef = ref(
				storage,
				`photos/${Date.now()}_${file.name}`
			);
			const snapshot = await uploadBytes(storageRef, file);
			const downloadURL = await getDownloadURL(snapshot.ref);
			return downloadURL;
		} catch (error) {
			throw handleError(error, 'Error uploading photo to storage');
		}
	},

	/**
	 * Add new photo record to Firestore
	 */
	async addPhoto(
		photoData: Omit<Photo, 'id' | 'uploadedAt'>
	): Promise<Photo> {
		try {
			const docRef = await addDoc(collection(db, 'photos'), {
				...photoData,
				uploadedAt: serverTimestamp(),
			});
			return { ...photoData, id: docRef.id };
		} catch (error) {
			throw handleError(error, 'Error adding photo record');
		}
	},

	/**
	 * Get all photos
	 */
	async getAllPhotos(): Promise<Photo[]> {
		try {
			const querySnapshot = await getDocs(collection(db, 'photos'));
			return querySnapshot.docs.map((doc: any) => ({
				id: doc.id,
				...doc.data(),
			})) as Photo[];
		} catch (error) {
			throw handleError(error, 'Error fetching all photos');
		}
	},

	/**
	 * Get photos by category
	 * Returns photos sorted by upload date (newest first)
	 */
	async getPhotosByCategory(category: string): Promise<Photo[]> {
		try {
			const q = query(
				collection(db, 'photos'),
				where('category', '==', category),
				orderBy('uploadedAt', 'desc')
			);
			const querySnapshot = await getDocs(q);
			return querySnapshot.docs.map((doc: any) => ({
				id: doc.id,
				...doc.data(),
			})) as Photo[];
		} catch (error) {
			throw handleError(error, `Error fetching photos for category ${category}`);
		}
	},

	/**
	 * Delete photo record
	 * Note: This does not delete the photo from Storage
	 */
	async deletePhoto(id: string): Promise<void> {
		try {
			const photoRef = doc(db, 'photos', id);
			await deleteDoc(photoRef);
		} catch (error) {
			throw handleError(error, `Error deleting photo ${id}`);
		}
	},

	/**
	 * Get photo by ID
	 */
	async getPhotoById(id: string): Promise<Photo | null> {
		try {
			const allPhotos = await this.getAllPhotos();
			return allPhotos.find(photo => photo.id === id) || null;
		} catch (error) {
			throw handleError(error, `Error fetching photo ${id}`);
		}
	},

	/**
	 * Update photo metadata
	 */
	async updatePhoto(id: string, photoData: Partial<Photo>): Promise<void> {
		try {
			const photoRef = doc(db, 'photos', id);
			await updateDoc(photoRef, photoData);
		} catch (error) {
			throw handleError(error, `Error updating photo ${id}`);
		}
	},

	/**
	 * Upload photo and create record
	 * Convenience method that combines uploadPhoto and addPhoto
	 */
	async uploadPhotoWithMetadata(
		file: File,
		metadata: Omit<Photo, 'id' | 'uploadedAt' | 'imageUrl'>
	): Promise<Photo> {
		try {
			// First upload the photo to storage
			const imageUrl = await this.uploadPhoto(file);
			
			// Then create the photo record
			const photo = await this.addPhoto({
				...metadata,
				imageUrl,
			});
			
			return photo;
		} catch (error) {
			throw handleError(error, 'Error uploading photo with metadata');
		}
	},
};
