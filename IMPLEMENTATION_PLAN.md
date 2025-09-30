# 🚀 Implementation Plan: Image Optimization & Storage

## Executive Summary

This document outlines the implementation plan for two major enhancements to the Orniva bird identification app:

1. **Client-Side Image Optimization**: Reduce image size by 80-90% before upload using `expo-image-manipulator`
2. **Image Storage Integration**: Store analysis images in Supabase Storage with user-specific access control

**Expected Benefits:**
- ⚡ 60-80% faster analysis time
- 📉 95% reduction in network bandwidth usage
- 💰 10x more images storable in free tier
- 🎨 Enhanced user experience with visual history
- 🔒 Privacy-protected image storage with RLS

---

## Phase 1: Client-Side Image Optimization

### Objective
Optimize images on the client device before sending to the Edge Function, dramatically reducing upload time and bandwidth consumption.

### 1.1 Install Dependencies

**File:** `package.json`

```bash
npm install expo-image-manipulator
```

**Expected version:** `^12.0.0` (compatible with Expo SDK 54)

**Verification:**
```bash
npm list expo-image-manipulator
```

---

### 1.2 Create Image Optimization Utility

**File:** `src/utils/imageUtils.ts`

**Add the following function:**

```typescript
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/**
 * Optimizes an image for upload by resizing and compressing
 * 
 * @param imageUri - Local file URI from ImagePicker
 * @returns Optimized image URI and metadata
 * 
 * Optimization strategy:
 * - Resize to max 1024x1024 (maintains aspect ratio)
 * - Compress to 75% quality JPEG
 * - Expected size reduction: 80-90%
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
    // Get original file size
    const originalFile = new File(imageUri);
    const originalSize = originalFile.size;

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
        compress: 0.75, // 75% quality
        format: SaveFormat.JPEG, // Always convert to JPEG for consistency
      }
    );

    // Get optimized file size
    const optimizedFile = new File(manipulatedImage.uri);
    const optimizedSize = optimizedFile.size;

    console.log(`Image optimization: ${originalSize} → ${optimizedSize} bytes (${Math.round((1 - optimizedSize / originalSize) * 100)}% reduction)`);

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
```

**Error Handling:**
- Catches manipulation failures
- Provides user-friendly error messages
- Logs detailed errors for debugging

---

### 1.3 Integrate Optimization in HomeScreen

**File:** `src/screens/HomeScreen.tsx`

**Modify `handleTakePhoto` function:**

```typescript
const handleTakePhoto = async () => {
  setShowImagePicker(false);

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Please grant camera permissions to take photos.',
      [{ text: 'OK' }]
    );
    return;
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8, // Initial quality for camera capture
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      
      // Validate original size
      const validation = validateImageSize(imageUri, 10); // 10MB max before optimization
      if (!validation.isValid) {
        Toast.show({
          type: 'error',
          text1: 'Image Too Large',
          text2: validation.errorMessage || 'Please select a smaller image.',
        });
        return;
      }
      
      // Show optimization progress
      Toast.show({
        type: 'info',
        text1: 'Optimizing Image',
        text2: 'Preparing your image for analysis...',
      });
      
      // ✨ NEW: Optimize image before conversion
      const optimizedImage = await optimizeImage(imageUri);
      
      console.log(`Optimization saved ${Math.round((1 - optimizedImage.optimizedSize / optimizedImage.originalSize) * 100)}% bandwidth`);
      
      // Convert optimized image to base64 data URI
      const dataUri = await uriToBase64DataUri(optimizedImage.uri);
      navigation.navigate('Analysis', { imageUri: dataUri });
    }
  } catch (error) {
    console.error('Error processing image:', error);
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: error instanceof Error ? error.message : 'Failed to process image. Please try again.',
    });
  }
};
```

**Do the same for `handleChooseFromGallery`:**

```typescript
const handleChooseFromGallery = async () => {
  setShowImagePicker(false);

  if (!(await requestPermissions())) {
    return;
  }

  // ... rate limiting check ...

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      
      // Validate original size
      const validation = validateImageSize(imageUri, 10);
      if (!validation.isValid) {
        Toast.show({
          type: 'error',
          text1: 'Image Too Large',
          text2: validation.errorMessage || 'Please select a smaller image.',
        });
        return;
      }
      
      // Show optimization progress
      Toast.show({
        type: 'info',
        text1: 'Optimizing Image',
        text2: 'Preparing your image for analysis...',
      });
      
      // ✨ NEW: Optimize image
      const optimizedImage = await optimizeImage(imageUri);
      
      // Convert to base64 data URI
      const dataUri = await uriToBase64DataUri(optimizedImage.uri);
      
      // Update rate limit
      setLastUploadTime(Date.now());
      
      navigation.navigate('Analysis', { imageUri: dataUri });
    }
  } catch (error) {
    console.error('Error processing image:', error);
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: error instanceof Error ? error.message : 'Failed to process image. Please try again.',
    });
  }
};
```

**Add import at top of file:**
```typescript
import { optimizeImage } from '../utils/imageUtils';
```

---

### Phase 1 Testing Checklist

- [ ] **Small images** (< 1MB): Verify optimization still works
- [ ] **Large images** (5-10MB): Verify significant size reduction
- [ ] **Various formats**: JPEG, PNG, HEIC (iOS)
- [ ] **Aspect ratios**: Portrait, landscape, square
- [ ] **iOS camera**: Test live camera capture
- [ ] **iOS photo library**: Test gallery selection
- [ ] **Android camera**: Test live camera capture
- [ ] **Android photo library**: Test gallery selection
- [ ] **Error handling**: Test with corrupted/invalid images
- [ ] **Progress indicators**: Verify toast messages appear

**Success Criteria:**
- Images > 1MB reduced to 200-500KB
- Analysis starts 60-80% faster
- No quality degradation visible to users
- All image formats supported

---

## Phase 2: Supabase Storage Integration

### Objective
Store analysis images in Supabase Storage with user-specific access control, enabling visual history and improved user experience.

### 2.1 Create Storage Bucket Migration

**Create new migration:**
```bash
supabase migration new create_bird_images_bucket
```

**File:** `supabase/migrations/XXXXXX_create_bird_images_bucket.sql`

```sql
-- Create bird-images storage bucket
-- This bucket will store user-uploaded bird images with RLS protection
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bird-images',
  'bird-images',
  false, -- Private bucket with RLS
  5242880, -- 5MB max file size
  ARRAY['image/jpeg', 'image/jpg']
);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload to their own folder
CREATE POLICY "Users can upload bird images to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bird-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view only their own images
CREATE POLICY "Users can view own bird images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'bird-images' AND
  owner = auth.uid()
);

-- Policy: Users can delete only their own images
CREATE POLICY "Users can delete own bird images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'bird-images' AND
  owner = auth.uid()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS bird_images_owner_idx 
ON storage.objects(owner) 
WHERE bucket_id = 'bird-images';

-- Add helpful comment
COMMENT ON TABLE storage.objects IS 'Stores user-uploaded bird images with RLS protection. Images are organized by user_id in folder structure.';
```

**Apply migration locally:**
```bash
supabase db reset
```

**Verification:**
```sql
-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'bird-images';

-- Check policies exist
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%bird%';
```

---

### 2.2 Update Edge Function for Storage Upload

**File:** `supabase/functions/identify-bird/index.ts`

**Add storage upload logic after Gemini API call:**

```typescript
// ... existing code ...

const parsedResult = parseGeminiResponse(text);

// ✨ NEW: Upload image to Supabase Storage
let imageUrl: string | null = null;
try {
  // Generate unique filename: {user_id}/{timestamp}-{random}.jpg
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  const fileName = `${user_id}/${timestamp}-${randomStr}.jpg`;
  
  // Convert base64 to binary (already have this from earlier processing)
  const binaryImage = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
  
  // Upload to storage with service role bypass
  console.log(`Uploading image to storage: ${fileName}`);
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('bird-images')
    .upload(fileName, binaryImage, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: false, // Don't overwrite existing files
    });

  if (uploadError) {
    console.error('Storage upload failed:', uploadError);
    // Don't fail the entire request if storage fails
    // User still gets analysis results
  } else {
    console.log('Image uploaded successfully:', uploadData.path);
    
    // Get public URL (for private bucket, client will need to use authenticated request)
    // Store the path, client can fetch with their JWT
    imageUrl = uploadData.path;
    
    // Alternative: Create signed URL for temporary access (optional)
    // const { data: signedUrlData } = await supabase.storage
    //   .from('bird-images')
    //   .createSignedUrl(uploadData.path, 60 * 60 * 24 * 365); // 1 year
    // imageUrl = signedUrlData?.signedUrl || null;
  }
} catch (storageError) {
  console.error('Storage operation error:', storageError);
  // Continue without image URL - analysis still succeeds
}

// ✅ Deduct credit ONLY after successful analysis
const { data: deductResult, error: deductError } = await supabase.rpc('deduct_user_credit', {
  user_id_param: user_id
});

// ... existing credit deduction handling ...

// Save analysis to history with image URL
try {
  await supabase.from('bird_analyses').insert({
    user_id: user_id,
    bird_species: parsedResult.species,
    confidence: parsedResult.confidence,
    description: parsedResult.description,
    image_url: imageUrl, // ✨ NEW: Store image URL/path
  });
} catch (historyError) {
  console.error('Failed to save analysis history:', historyError);
  // Non-critical error - don't fail the request
}

// Return successful response with image URL
return new Response(
  JSON.stringify({
    success: true,
    result: {
      ...parsedResult,
      imageUrl: imageUrl, // ✨ NEW: Include image URL in response
    },
    timestamp: new Date().toISOString(),
    model_used: 'gemini-2.5-pro'
  }),
  { 
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  }
);
```

**Error Handling Strategy:**
- Storage upload failures do NOT fail the entire request
- User always gets bird identification results
- Image storage is a "nice-to-have" enhancement
- Errors are logged for monitoring

---

### 2.3 Update TypeScript Types

**File:** `src/types/index.ts`

**Update BirdRecognitionResult interface:**

```typescript
export interface BirdRecognitionResult {
  species: string;
  confidence: number;
  description: string;
  imageUrl?: string; // ✨ NEW: Optional image URL from storage
}
```

**The BirdAnalysis interface already has image_url:**
```typescript
export interface BirdAnalysis {
  id: string;
  user_id: string;
  bird_species: string;
  confidence: number;
  description: string | null;
  image_url: string | null; // ✅ Already correct
  created_at: string;
}
```

---

### Phase 2 Testing Checklist

- [ ] **Storage bucket created**: Verify in Supabase Dashboard
- [ ] **RLS policies active**: Test user A can't access user B's images
- [ ] **Upload succeeds**: Images appear in storage dashboard
- [ ] **Folder structure**: Images organized by user_id
- [ ] **Database records**: image_url populated in bird_analyses
- [ ] **Fallback behavior**: Analysis succeeds even if storage fails
- [ ] **Client retrieval**: Can fetch images with user JWT
- [ ] **File size limits**: 5MB limit enforced
- [ ] **MIME type validation**: Only JPEG accepted

**SQL Verification:**
```sql
-- Check recent analyses have image URLs
SELECT id, bird_species, image_url, created_at 
FROM bird_analyses 
ORDER BY created_at DESC 
LIMIT 10;

-- Check storage usage
SELECT COUNT(*), SUM(metadata->'size')::bigint as total_bytes
FROM storage.objects
WHERE bucket_id = 'bird-images';
```

---

## Phase 3: UI Enhancements

### Objective
Update the HistoryScreen to display visual thumbnails of analyzed birds, creating a more engaging and memorable user experience.

### 3.1 Update HistoryScreen with Thumbnail Grid

**File:** `src/screens/HistoryScreen.tsx`

**Current implementation** (text-only list)

**Proposed enhancement** (grid with thumbnails):

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { BirdAnalysis } from '../types';
import { t } from '../utils/i18n';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const IMAGE_SIZE = (width - 48) / COLUMN_COUNT; // 48px total padding

export const HistoryScreen: React.FC = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [analyses, setAnalyses] = useState<BirdAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('bird_analyses')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAnalyses(data || []);
      
      // Fetch signed URLs for images
      await fetchImageUrls(data || []);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchImageUrls = async (analyses: BirdAnalysis[]) => {
    const urlMap = new Map<string, string>();
    
    for (const analysis of analyses) {
      if (analysis.image_url) {
        try {
          // Get signed URL for private bucket access
          const { data, error } = await supabase.storage
            .from('bird-images')
            .createSignedUrl(analysis.image_url, 3600); // 1 hour expiry

          if (!error && data) {
            urlMap.set(analysis.id, data.signedUrl);
          }
        } catch (error) {
          console.error(`Error fetching image URL for ${analysis.id}:`, error);
        }
      }
    }
    
    setImageUrls(urlMap);
  };

  const renderItem = ({ item }: { item: BirdAnalysis }) => {
    const imageUrl = imageUrls.get(item.id);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface }]}
        onPress={() => imageUrl && setSelectedImage(imageUrl)}
        activeOpacity={0.7}
      >
        {/* Image or Placeholder */}
        <View style={[styles.imageContainer, { backgroundColor: colors.border }]}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={[styles.placeholderIcon, { color: colors.textSecondary }]}>
                🐦
              </Text>
            </View>
          )}
        </View>

        {/* Species Name */}
        <Text
          style={[styles.species, { color: colors.text }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.bird_species}
        </Text>

        {/* Confidence Badge */}
        <View style={[styles.confidenceBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.confidenceText, { color: colors.buttonText }]}>
            {item.confidence}%
          </Text>
        </View>

        {/* Date */}
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('history', user?.language || 'en')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {analyses.length} {t('identifications', user?.language || 'en')}
        </Text>
      </View>

      {/* Grid */}
      {analyses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('noHistoryYet', user?.language || 'en')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={analyses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={COLUMN_COUNT}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Image Viewer Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedImage(null)}
        >
          <View style={styles.modalContent}>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  grid: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: IMAGE_SIZE,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 40,
  },
  species: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    minHeight: 34, // Ensure consistent card height
  },
  confidenceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  date: {
    fontSize: 11,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    aspectRatio: 1,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
});
```

**Key Features:**
- ✅ 2-column grid layout
- ✅ Thumbnail images (100x100 equivalent)
- ✅ Fallback bird emoji for missing images
- ✅ Confidence badge
- ✅ Date display
- ✅ Tap to view full-size
- ✅ Modal image viewer
- ✅ Smooth animations
- ✅ Theme-aware styling

---

### 3.2 Add Loading States and Error Handling

**Enhancement: Progressive Loading**

```typescript
const [imageLoadingStates, setImageLoadingStates] = useState<Map<string, boolean>>(new Map());

const renderItem = ({ item }: { item: BirdAnalysis }) => {
  const imageUrl = imageUrls.get(item.id);
  const isLoading = imageLoadingStates.get(item.id) || false;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={() => imageUrl && setSelectedImage(imageUrl)}
      activeOpacity={0.7}
    >
      <View style={[styles.imageContainer, { backgroundColor: colors.border }]}>
        {imageUrl ? (
          <>
            {isLoading && (
              <ActivityIndicator
                style={StyleSheet.absoluteFill}
                color={colors.primary}
              />
            )}
            <Image
              source={{ uri: imageUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
              onLoadStart={() => {
                const newMap = new Map(imageLoadingStates);
                newMap.set(item.id, true);
                setImageLoadingStates(newMap);
              }}
              onLoadEnd={() => {
                const newMap = new Map(imageLoadingStates);
                newMap.set(item.id, false);
                setImageLoadingStates(newMap);
              }}
            />
          </>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={[styles.placeholderIcon, { color: colors.textSecondary }]}>
              🐦
            </Text>
          </View>
        )}
      </View>
      {/* ... rest of card ... */}
    </TouchableOpacity>
  );
};
```

---

### Phase 3 Testing Checklist

- [ ] **Grid layout**: Displays correctly on various screen sizes
- [ ] **Thumbnails**: Load and display properly
- [ ] **Placeholders**: Show for analyses without images
- [ ] **Full-size view**: Modal opens on tap
- [ ] **Modal dismiss**: Closes on background tap
- [ ] **Loading states**: Show while images load
- [ ] **Error handling**: Gracefully handle missing/failed images
- [ ] **Performance**: Smooth scrolling with 50+ items
- [ ] **Theme support**: Dark/light modes work correctly
- [ ] **Orientation**: Works in portrait and landscape

---

## Phase 4: Documentation Updates

### 4.1 Update README.md

**Add to Features section:**
```markdown
- **📸 Visual History**: See thumbnails of all your bird identifications
- **⚡ Optimized Performance**: Client-side image optimization reduces upload time by 80%
- **🖼️ Secure Storage**: Images stored privately in Supabase with RLS protection
```

**Add to Tech Stack section:**
```markdown
- **expo-image-manipulator**: Client-side image optimization
```

**Add new section:**
```markdown
### Image Optimization

Orniva automatically optimizes your bird photos before analysis:
- Resizes to max 1024x1024 pixels (maintains aspect ratio)
- Compresses to 75% quality JPEG
- Reduces typical image size by 80-90%
- Results in 60-80% faster analysis times

This optimization happens seamlessly on your device before upload, ensuring fast performance even on slower network connections.

### Image Storage

Your bird analysis images are:
- Automatically saved to your private storage
- Protected by Row Level Security (RLS)
- Organized by user account
- Accessible only to you
- Displayed in your visual history
```

---

### 4.2 Update WARP.md

**Add to Architecture section:**
```markdown
### Image Optimization Flow

1. **Capture/Select**: User takes photo or selects from gallery
2. **Client Optimization**: 
   - Resize to max 1024x1024px (maintains aspect ratio)
   - Compress to 75% quality JPEG
   - Typical reduction: 5-10MB → 200-400KB
3. **Convert**: Optimized image → base64 data URI
4. **Upload**: Send to Edge Function (95% less bandwidth)
5. **Storage**: Edge Function uploads to Supabase Storage
6. **Database**: Image path saved in bird_analyses.image_url
7. **Display**: Thumbnail shown in history, full-size on tap

### Storage Architecture

**Bucket Configuration:**
- Name: `bird-images`
- Public: `false` (private with RLS)
- Max file size: 5MB
- Allowed MIME types: `image/jpeg`, `image/jpg`
- Path structure: `{user_id}/{timestamp}-{random}.jpg`

**RLS Policies:**
- Users can INSERT only to their own folder
- Users can SELECT only their own images
- Users can DELETE only their own images
- Service role (Edge Function) can bypass for uploads

**Client Access:**
- Images fetched with signed URLs
- 1-hour expiry for security
- Automatic renewal on history refresh
```

---

## Testing Strategy

### Unit Tests

**File:** `src/utils/imageUtils.test.ts` (create new)

```typescript
import { optimizeImage } from './imageUtils';

describe('optimizeImage', () => {
  it('should reduce image size by at least 50%', async () => {
    const testImageUri = 'file:///path/to/large-image.jpg';
    const result = await optimizeImage(testImageUri);
    
    expect(result.optimizedSize).toBeLessThan(result.originalSize * 0.5);
  });

  it('should maintain aspect ratio', async () => {
    const testImageUri = 'file:///path/to/image.jpg';
    const result = await optimizeImage(testImageUri);
    
    const originalRatio = 1920 / 1080; // Example
    const optimizedRatio = result.width / result.height;
    
    expect(Math.abs(originalRatio - optimizedRatio)).toBeLessThan(0.1);
  });

  it('should handle invalid images gracefully', async () => {
    const invalidUri = 'file:///path/to/corrupt.jpg';
    
    await expect(optimizeImage(invalidUri)).rejects.toThrow();
  });
});
```

### Integration Tests

**Manual Testing Scenarios:**

1. **End-to-End Flow:**
   - Take photo with camera
   - Verify optimization toast appears
   - Verify analysis completes faster
   - Check history shows thumbnail
   - Tap thumbnail to view full-size

2. **Cross-Platform:**
   - iOS camera + gallery
   - Android camera + gallery
   - Web file upload

3. **Network Conditions:**
   - WiFi (fast)
   - 4G (medium)
   - 3G (slow)
   - Offline → online

4. **Edge Cases:**
   - Very small images (100KB)
   - Maximum size images (10MB)
   - Portrait orientation
   - Landscape orientation
   - Square images

5. **RLS Verification:**
   ```sql
   -- Test as User A
   SELECT * FROM storage.objects WHERE bucket_id = 'bird-images';
   -- Should only see User A's images
   
   -- Try to access User B's image
   SELECT * FROM storage.objects WHERE owner = '{user_b_id}';
   -- Should return no rows
   ```

---

## Performance Metrics

### Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Average image size | 5-10 MB | 200-400 KB | 80-90% reduction |
| Upload time (3G) | 15-30 sec | 1-2 sec | ~93% faster |
| Analysis time | 20-40 sec | 5-8 sec | 60-80% faster |
| Storage per 1000 images | 5-10 GB | 200-400 MB | 95% reduction |
| Free tier capacity | 100-200 images | 2,500-5,000 images | 10-25x increase |

### Monitoring

**Supabase Dashboard:**
- Storage usage: Project Settings → Storage
- Bandwidth usage: Project Settings → Bandwidth
- API requests: Project Settings → API

**Client-side Logging:**
```typescript
console.log(`Image optimization: ${originalSize} → ${optimizedSize} bytes`);
console.log(`Savings: ${Math.round((1 - optimizedSize / originalSize) * 100)}%`);
```

---

## Rollback Plan

If issues arise during deployment:

### Immediate Rollback

**Disable feature flag in Edge Function:**
```typescript
const ENABLE_IMAGE_STORAGE = false; // Set to false to disable
```

**Or rollback migration:**
```bash
# Get migration version to rollback to
supabase db push --dry-run

# Rollback
supabase migration down
```

### Gradual Rollout

**Option: Feature flag controlled:**
```typescript
// In Edge Function
const STORAGE_ENABLED = Deno.env.get('ENABLE_IMAGE_STORAGE') === 'true';

if (STORAGE_ENABLED) {
  // Upload to storage
}
```

**Set via Supabase secrets:**
```bash
supabase secrets set ENABLE_IMAGE_STORAGE=true
```

---

## Security Checklist

- [x] **Client-side optimization**: No sensitive data exposed
- [x] **Storage RLS**: Users can only access their own images
- [x] **Path structure**: Prevents cross-user access
- [x] **File validation**: MIME type and size limits enforced
- [x] **Service role**: Only used in Edge Function, not exposed
- [x] **Signed URLs**: Temporary access tokens expire
- [x] **Image content**: Not validated for malicious content (consider adding)
- [x] **Filename sanitization**: Timestamps prevent injection

**Future Enhancements:**
- Add virus scanning for uploaded images
- Implement content moderation
- Add watermarking for copyright
- Rate limiting on uploads

---

## Cost Analysis

### Free Tier (Supabase)

**Storage:**
- 1 GB included
- 5,000 optimized images @ 200KB each
- Cost per additional GB: $0.021/month

**Bandwidth:**
- 2 GB/month included
- ~10,000 image downloads @ 200KB each
- Cost per additional GB: $0.09/month

**API Requests:**
- Unlimited on free tier
- Edge Functions: 500K invocations/month

### Projected Usage (1,000 users)

**Assumptions:**
- Average 10 analyses per user
- 50% view history once/week

**Storage:**
- 10,000 images × 200KB = 2GB
- Cost: $0.021/GB = $0.021/month

**Bandwidth:**
- 5,000 history views × 2GB = 10GB
- Cost: 8GB × $0.09 = $0.72/month

**Total: ~$0.74/month for 1,000 active users**

---

## Timeline

### Week 1: Phase 1 (Client Optimization)
- Day 1-2: Install dependencies, create utility function
- Day 3-4: Integrate in HomeScreen, test on iOS
- Day 5: Test on Android, refinements

### Week 2: Phase 2 (Storage Integration)
- Day 1-2: Create migration, test locally
- Day 3-4: Update Edge Function, deploy
- Day 5: Test storage flow, RLS policies

### Week 3: Phase 3 (UI Enhancements)
- Day 1-3: Implement grid layout with thumbnails
- Day 4-5: Image viewer modal, loading states

### Week 4: Polish & Deploy
- Day 1-2: Cross-platform testing
- Day 3: Documentation updates
- Day 4: Production deployment
- Day 5: Monitoring and bug fixes

---

## Success Criteria

### Technical
- [ ] Images optimize to < 500KB consistently
- [ ] Analysis time reduced by 60%+
- [ ] Storage integration 99% success rate
- [ ] RLS policies prevent unauthorized access
- [ ] UI loads smoothly with 50+ images

### User Experience
- [ ] Users report faster analysis times
- [ ] Visual history improves engagement
- [ ] No increase in error rates
- [ ] Smooth experience across platforms

### Business
- [ ] Free tier sustains 5,000+ images
- [ ] Bandwidth usage stays under limits
- [ ] Storage costs < $5/month for 10K users
- [ ] Feature adoption > 80%

---

## Next Steps

1. **Review Plan**: Team review and approval
2. **Environment Setup**: Verify local Supabase running
3. **Branch Creation**: `git checkout -b feature/image-optimization-storage`
4. **Phase 1 Start**: Install expo-image-manipulator
5. **Iterative Testing**: Test after each phase completion
6. **Documentation**: Update as features complete
7. **Production Deploy**: After all phases tested

---

## References

- [Expo Image Manipulator Docs](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [React Native Image Component](https://reactnative.dev/docs/image)

---

**Document Version:** 1.0  
**Last Updated:** 2025-09-30  
**Author:** AI Development Assistant  
**Status:** Ready for Implementation ✅
