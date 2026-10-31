import sharp from 'sharp';

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  format?: 'png' | 'jpeg' | 'webp';
  mimeType?: string;
  width?: number;
  height?: number;
  fileSizeBytes?: number;
}

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB limit
const MIN_DIMENSION_PX = 40;
const MAX_DIMENSION_PX = 8192;

/**
 * Validates file buffer magic bytes (file signature), MIME type, extension and image integrity
 */
export async function validateUploadedImage(
  buffer: Buffer,
  originalFilename: string,
  _declaredMimeType?: string
): Promise<ImageValidationResult> {
  const fileSizeBytes = buffer.length;

  // 1. File size checks
  if (fileSizeBytes === 0) {
    return { isValid: false, error: 'Uploaded file is completely empty (0 bytes).' };
  }
  if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    return { isValid: false, error: `File exceeds maximum allowed size of 25MB (received ${(fileSizeBytes / 1024 / 1024).toFixed(1)}MB).` };
  }

  // 2. Extension validation
  const extMatch = originalFilename.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : '';
  const validExtensions = ['png', 'jpg', 'jpeg', 'webp'];
  if (!validExtensions.includes(ext)) {
    return { isValid: false, error: `Unsupported file extension (.${ext || 'unknown'}). Allowed: PNG, JPG, JPEG, WEBP.` };
  }

  // 3. File Signature / Magic Bytes validation
  if (buffer.length < 12) {
    return { isValid: false, error: 'File header is too small to be a valid image.' };
  }

  let detectedFormat: 'png' | 'jpeg' | 'webp' | null = null;
  let canonicalMime = '';

  // PNG magic: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A
  ) {
    detectedFormat = 'png';
    canonicalMime = 'image/png';
  }
  // JPEG magic: FF D8 FF
  else if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    detectedFormat = 'jpeg';
    canonicalMime = 'image/jpeg';
  }
  // WEBP magic: 52 49 46 46 (RIFF) ... 57 45 42 50 (WEBP)
  else if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    detectedFormat = 'webp';
    canonicalMime = 'image/webp';
  }

  if (!detectedFormat) {
    return { 
      isValid: false, 
      error: 'File signature mismatch: the binary content does not match a valid PNG, JPEG, or WEBP image header.' 
    };
  }

  // 4. Sharp decoding & dimension validation (corrupted image check)
  try {
    const sharpInstance = sharp(buffer, { failOn: 'error' });
    const metadata = await sharpInstance.metadata();

    const width = metadata.width || 0;
    const height = metadata.height || 0;

    if (width < MIN_DIMENSION_PX || height < MIN_DIMENSION_PX) {
      return { 
        isValid: false, 
        error: `Image dimensions (${width}x${height}px) are too small. Minimum required: ${MIN_DIMENSION_PX}x${MIN_DIMENSION_PX}px.` 
      };
    }

    if (width > MAX_DIMENSION_PX || height > MAX_DIMENSION_PX) {
      return { 
        isValid: false, 
        error: `Image dimensions (${width}x${height}px) exceed maximum allowed of ${MAX_DIMENSION_PX}x${MAX_DIMENSION_PX}px.` 
      };
    }

    return {
      isValid: true,
      format: detectedFormat,
      mimeType: canonicalMime,
      width,
      height,
      fileSizeBytes
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: `Corrupted or unreadable image file: ${err?.message || 'Failed to decode pixel buffer'}`
    };
  }
}
