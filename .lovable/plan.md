

## Plan: Fix back of postcard to show only content within the frame

**Problem**: The back of the postcard image uses `object-cover` which crops the image. The user wants the entire design (what's inside the frame) to be visible, properly contained within the card boundaries.

**Changes in `src/components/PostcardPreview.tsx`**:

1. Change the back image from `object-cover` to `object-contain` so the full postcard back design is visible without cropping
2. Add a white/light background to the back card container so the postcard back looks natural (since `object-contain` may leave empty space)
3. Optionally adjust the card aspect ratio to better match a real postcard proportion (standard postcard is roughly 3:2 or 14.8cm x 10.5cm)

This is a single-line CSS change on line 73: `object-cover` → `object-contain`, plus adding a `bg-white` class to the back card container on line 67.

