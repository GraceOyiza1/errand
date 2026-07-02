/**
 * Image management utilities for errand items
 * 
 * Images are stored in: public/images/errand-items/
 * Upload endpoint: POST /api/upload
 * 
 * Image folder structure:
 * public/
 *   └── images/
 *       ├── icons/        (app icons)
 *       ├── images/       (general images)
 *       └── errand-items/ (uploaded errand item photos)
 */

export interface ImageUploadResult {
    url: string;
    filename: string;
}

/**
 * Upload a single image file to the errand-items folder
 * @param file Image file to upload
 * @returns Promise with upload result containing URL and filename
 */
export async function uploadImage(file: File): Promise<ImageUploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
    }

    return response.json();
}

/**
 * Upload multiple images in parallel
 * @param files Array of image files
 * @returns Promise with array of upload results
 */
export async function uploadImages(files: File[]): Promise<ImageUploadResult[]> {
    return Promise.all(files.map(uploadImage));
}

/**
 * Get the public URL for an errand item image
 * @param filename Filename returned from upload
 * @returns Full public URL
 */
export function getImageUrl(filename: string): string {
    return `/images/errand-items/${filename}`;
}

/**
 * Validate image file before upload
 * @param file File to validate
 * @param maxSize Maximum file size in bytes (default 5MB)
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateImageFile(
    file: File,
    maxSize: number = 5 * 1024 * 1024
): { isValid: boolean; error?: string } {
    if (!file.type.startsWith('image/')) {
        return { isValid: false, error: 'File must be an image' };
    }

    if (file.size > maxSize) {
        return {
            isValid: false,
            error: `File size must be less than ${maxSize / (1024 * 1024)}MB`,
        };
    }

    return { isValid: true };
}
