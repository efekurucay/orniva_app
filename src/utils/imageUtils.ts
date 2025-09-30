import { File } from 'expo-file-system';

/**
 * Converts a local image URI to a base64 data URI using modern Expo File API
 * Compatible with Expo SDK 54+
 * 
 * @param imageUri - Local file URI (e.g., file:///path/to/image.jpg)
 * @returns Base64 data URI (e.g., data:image/jpeg;base64,/9j/4AAQ...)
 * 
 * @throws Error if file cannot be read or doesn't exist
 */
export async function uriToBase64DataUri(imageUri: string): Promise<string> {
  try {
    // Create File instance from URI
    const file = new File(imageUri);
    
    // Check if file exists
    if (!file.exists) {
      throw new Error('File does not exist or is not accessible');
    }
    
    // Get base64 content using modern API
    const base64 = await file.base64();
    
    // Get MIME type from file (defaults to image/jpeg if unknown)
    const mimeType = file.type || 'image/jpeg';
    
    // Return properly formatted data URI
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error converting URI to base64:', error);
    throw new Error(`Failed to convert image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Synchronous version for when you need blocking behavior
 * Use with caution - may block UI for large files
 */
export function uriToBase64DataUriSync(imageUri: string): string {
  try {
    const file = new File(imageUri);
    
    if (!file.exists) {
      throw new Error('File does not exist or is not accessible');
    }
    
    const base64 = file.base64Sync();
    const mimeType = file.type || 'image/jpeg';
    
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error converting URI to base64 (sync):', error);
    throw new Error(`Failed to convert image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets file size in a human-readable format
 */
export function getFileSize(imageUri: string): string {
  try {
    const file = new File(imageUri);
    const bytes = file.size;
    
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  } catch (error) {
    return 'Unknown size';
  }
}