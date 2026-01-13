/**
 * Event-related type definitions
 */

/**
 * Event interface representing a school event
 */
export interface Event {
	/** Unique identifier (Firestore document ID) */
	id?: string;
	
	/** Event title */
	title: string;
	
	/** Event description */
	description: string;
	
	/** Event date (ISO string) */
	date: string;
	
	/** Event time */
	time: string;
	
	/** Event location */
	location: string;
	
	/** Whether the event is currently active */
	isActive: boolean;
	
	/** Timestamp when event was created */
	createdAt?: any;
}

/**
 * Partial event data for updates
 */
export type EventUpdate = Partial<Omit<Event, 'id' | 'createdAt'>>;

/**
 * Event creation data (without auto-generated fields)
 */
export type EventCreateData = Omit<Event, 'id' | 'createdAt'>;

/**
 * Photo interface representing event photos
 */
export interface Photo {
	/** Unique identifier (Firestore document ID) */
	id?: string;
	
	/** Photo title */
	title: string;
	
	/** Photo description */
	description: string;
	
	/** Photo category or event name */
	category: string;
	
	/** Image URL in Firebase Storage */
	imageUrl: string;
	
	/** Timestamp when photo was uploaded */
	uploadedAt?: any;
}

/**
 * Partial photo data for updates
 */
export type PhotoUpdate = Partial<Omit<Photo, 'id' | 'uploadedAt'>>;

/**
 * Photo upload data
 */
export interface PhotoUploadData {
	/** Photo title */
	title: string;
	
	/** Photo description */
	description: string;
	
	/** Photo category or event name */
	category: string;
	
	/** Image file to upload */
	file: File;
}
