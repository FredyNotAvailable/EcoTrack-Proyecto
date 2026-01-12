import sharp from 'sharp';
sharp.cache(false); // Prevent file locking on Windows
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { supabase } from '../../config/supabaseClient';
import { ApiError } from '../../utils/ApiError';

export class MediaService {
    private bucketName = 'posts';

    async processAndUpload(file: Express.Multer.File, userId: string): Promise<string> {
        try {
            let processedBuffer: Buffer;
            let mimeType: string;
            let extension: string;
            let finalPath = file.path; // Default to original path if no conversion (fallback)

            if (file.mimetype.startsWith('image/')) {
                // Convert Image to WebP
                processedBuffer = await sharp(file.path)
                    .webp({ quality: 80 })
                    .toBuffer();
                mimeType = 'image/webp';
                extension = 'webp';

                // We don't need the temp file for upload if we have buffer, 
                // but if we used diskStorage, we have file.path.
            } else if (file.mimetype.startsWith('video/')) {
                // Convert Video to WebM
                // processVideoToWebM returns a path to the new file
                const outputPath = file.path + '.webm';
                await this.convertVideoToWebM(file.path, outputPath);

                // Read the converted file
                processedBuffer = await fs.promises.readFile(outputPath);
                mimeType = 'video/webm';
                extension = 'webm';
                finalPath = outputPath;
            } else {
                throw new ApiError(400, 'Unsupported media type');
            }

            // Upload to Supabase
            const timestamp = Date.now();
            const fileName = `${userId}/${timestamp}.${extension}`;

            console.log(`[MediaService] Uploading ${fileName} to bucket ${this.bucketName}`);
            const { data, error } = await supabase.storage
                .from(this.bucketName)
                .upload(fileName, processedBuffer, {
                    contentType: mimeType,
                    upsert: false
                });

            if (error) {
                console.error('[MediaService] Supabase upload error:', error);
                throw new ApiError(500, 'Error uploading file to storage');
            }
            console.log('[MediaService] Upload success, getting public URL...');

            // Clean up temp files
            this.cleanupTempFile(file.path);
            if (finalPath !== file.path) {
                this.cleanupTempFile(finalPath);
            }

            // Get Public URL
            const { data: publicUrlData } = supabase.storage
                .from(this.bucketName)
                .getPublicUrl(fileName);

            return publicUrlData.publicUrl;

        } catch (error) {
            // Ensure cleanup on error
            this.cleanupTempFile(file.path);
            throw error;
        }
    }

    private convertVideoToWebM(inputPath: string, outputPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .output(outputPath)
                // .videoCodec('libvpx-vp9') // Optional: specify codec. standard webm uses vp8/vp9. 
                // Simplest conversion:
                .toFormat('webm')
                .on('end', () => resolve())
                .on('error', (err) => {
                    console.error('FFmpeg error:', err);
                    reject(err);
                })
                .run();
        });
    }

    private cleanupTempFile(path: string) {
        // Add a small delay to allow file handles to be released (Windows fix)
        setTimeout(() => {
            fs.unlink(path, (err) => {
                if (err) {
                    console.warn(`[MediaService] Warning: Failed to cleanup temp file ${path}:`, err.message);
                }
            });
        }, 1000);
    }
}

export const mediaService = new MediaService();
