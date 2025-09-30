import { File } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

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

/**
 * Gets file size in megabytes
 */
export function getFileSizeInMB(imageUri: string): number {
  try {
    const file = new File(imageUri);
    return file.size / (1024 * 1024);
  } catch (error) {
    return 0;
  }
}

/**
 * Validates image size against a maximum limit
 * 
 * @param imageUri - Local file URI
 * @param maxSizeMB - Maximum allowed size in megabytes (default: 5MB)
 * @returns Object with validation result and error message if invalid
 */
export function validateImageSize(
  imageUri: string,
  maxSizeMB: number = 5
): { isValid: boolean; sizeInMB: number; errorMessage?: string } {
  try {
    const sizeInMB = getFileSizeInMB(imageUri);
    
    if (sizeInMB === 0) {
      return {
        isValid: false,
        sizeInMB: 0,
        errorMessage: 'Unable to determine file size',
      };
    }
    
    if (sizeInMB > maxSizeMB) {
      return {
        isValid: false,
        sizeInMB,
        errorMessage: `Image is too large (${sizeInMB.toFixed(2)} MB). Please select an image under ${maxSizeMB} MB.`,
      };
    }
    
    return {
      isValid: true,
      sizeInMB,
    };
  } catch (error) {
    return {
      isValid: false,
      sizeInMB: 0,
      errorMessage: 'Failed to validate image size',
    };
  }
}

/**
 * Optimizes an image for upload by resizing and compressing
 * 
 * @param imageUri - Local file URI from ImagePicker
 * @returns Optimized image URI and metadata
 * 
 * Optimization strategy:
 * - Skip optimization for images < 100KB (already small)
 * - Resize large images to max 1024x1024 (maintains aspect ratio)
 * - Compress to 75% quality JPEG
 * - Only use optimized version if it's smaller than original
 * - Expected size reduction: 80-90% for large images
 * - Typical output: 200-400KB per image
 */
export async function optimizeImage(imageUri: string): Promise<{
  uri: string;
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
}> {
  try {
    // Get original file info
    const originalFile = new File(imageUri);
    const originalSize = originalFile.size;

    console.log(`Starting optimization for image: ${originalSize} bytes (${(originalSize / 1024).toFixed(2)} KB)`);

    // Skip optimization for images that are already small (< 100KB)
    // These are likely already optimized or don't benefit from optimization
    const MIN_SIZE_FOR_OPTIMIZATION = 100 * 1024; // 100KB
    if (originalSize < MIN_SIZE_FOR_OPTIMIZATION) {
      console.log(`Image is already small (< 100KB), skipping optimization`);
      return {
        uri: imageUri,
        width: 0, // We don't know dimensions without processing
        height: 0,
        originalSize,
        optimizedSize: originalSize,
      };
    }

    // Optimize: resize to max 1024px and compress to 75% quality
    const manipulatedImage = await manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: 1024, // Max width, maintains aspect ratio
          },
        },
      ],
      {
        compress: 0.75, // 75% quality - optimal balance
        format: SaveFormat.JPEG, // Always convert to JPEG for consistency
      }
    );

    // Get optimized file size
    const optimizedFile = new File(manipulatedImage.uri);
    const optimizedSize = optimizedFile.size;

    // Only use optimized version if it's actually smaller
    if (optimizedSize >= originalSize) {
      console.log(`Optimization didn't reduce size (${originalSize} → ${optimizedSize}), using original`);
      return {
        uri: imageUri,
        width: manipulatedImage.width,
        height: manipulatedImage.height,
        originalSize,
        optimizedSize: originalSize,
      };
    }

    const reductionPercent = Math.round((1 - optimizedSize / originalSize) * 100);
    console.log(`Image optimization complete: ${originalSize} → ${optimizedSize} bytes (${reductionPercent}% reduction)`);

    return {
      uri: manipulatedImage.uri,
      width: manipulatedImage.width,
      height: manipulatedImage.height,
      originalSize,
      optimizedSize,
    };
  } catch (error) {
    console.error('Image optimization failed:', error);
    throw new Error('Failed to optimize image. Please try again.');
  }
}
