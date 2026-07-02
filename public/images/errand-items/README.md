# Errand Item Images - Setup Guide

## Folder Structure

Images for errand items are stored in:
```
public/images/errand-items/
```

## How It Works

### 1. **Upload Flow**
- User uploads image via `ImageUploader` component
- Image is sent to `/api/upload` endpoint (POST request)
- Server validates and saves to `public/images/errand-items/`
- Returns public URL like `/images/errand-items/item-1719860450123.jpg`

### 2. **Storage Location**
```
public/
└── images/
    ├── icons/              (SVG app icons)
    ├── images/             (general UI images)
    └── errand-items/       ← Your errand item photos go here
        └── item-*.jpg
        └── item-*.png
        └── ... (uploaded files)
```

### 3. **File Naming**
Uploaded files are automatically named with timestamp:
- Format: `item-{timestamp}.{ext}`
- Example: `item-1719860450123.jpg`
- Prevents filename conflicts

### 4. **File Constraints**
- **Max size:** 5MB per image
- **Formats:** jpg, png, gif, webp, etc.
- **Count:** 3 images max per errand item (configurable)

## Usage

### In Components
```tsx
import ImageUploader from '@/components/ImageUploader';

<ImageUploader
  images={itemImages}
  onChange={setItemImages}
  label="Item photos"
  maxImages={3}
/>
```

### In API Routes / Utilities
```tsx
import { uploadImage, validateImageFile, getImageUrl } from '@/lib/imageUtils';

// Validate before upload
const validation = validateImageFile(file);
if (!validation.isValid) {
  console.error(validation.error);
}

// Upload single image
const result = await uploadImage(file);
console.log(result.url); // "/images/errand-items/item-123456.jpg"

// Upload multiple
const results = await uploadImages([file1, file2, file3]);
const urls = results.map(r => r.url);
```

## API Endpoint

### `POST /api/upload`
Handles image uploads and saves to public folder.

**Request:**
```
Content-Type: multipart/form-data
Body: {
  file: File
}
```

**Response (Success):**
```json
{
  "url": "/images/errand-items/item-1719860450123.jpg",
  "filename": "item-1719860450123.jpg"
}
```

**Response (Error):**
```json
{
  "error": "File must be an image" | "File size must be less than 5MB"
}
```

## Database / Persistence

Currently, images are stored as:
1. **Public URLs** - in errand orders/items
2. **localStorage** - for demo orders (client-side)

To persist images with orders in a database, add `imageUrls` field:
```ts
interface ShoppingItem {
  id: string;
  name: string;
  imageUrls: string[]; // e.g., ["/images/errand-items/item-123.jpg"]
  // ... other fields
}
```

## Adding Images Manually

You can also manually place images in the folder:
1. Save images to `public/images/errand-items/`
2. Reference as `/images/errand-items/your-image.jpg`
3. Load in components:
   ```tsx
   <img src="/images/errand-items/sample-tomato.jpg" alt="Tomato" />
   ```

## Cleanup

To remove old/unused images:
1. Check database/localStorage for active image URLs
2. Delete unused files from `public/images/errand-items/`
3. Consider implementing cleanup script if needed

## Next Steps

- [ ] Test upload with different image formats
- [ ] Add image optimization (resize, compress)
- [ ] Implement image deletion endpoint
- [ ] Add progress bar for multi-image uploads
- [ ] Consider CDN/cloud storage (Cloudinary, AWS S3) for production
