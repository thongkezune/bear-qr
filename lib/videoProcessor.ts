import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export class VideoOptimizer {
  private static instance: FFmpeg | null = null;
  private static isLoading = false;

  static async getInstance() {
    if (!this.instance) {
      this.instance = new FFmpeg();
    }
    return this.instance;
  }

  static async load() {
    const ffmpeg = await this.getInstance();
    
    // Kiểm tra trạng thái loaded (v0.12+)
    // @ts-ignore
    if (ffmpeg.loaded) return ffmpeg;

    if (this.isLoading) {
        while (this.isLoading) {
            await new Promise(r => setTimeout(r, 100));
        }
        return ffmpeg;
    }

    this.isLoading = true;
    try {
        // SỬ DỤNG HOSTING NỘI BỘ TẠI VERCEL (/ffmpeg/)
        const baseURL = typeof window !== 'undefined' ? window.location.origin + '/ffmpeg' : '';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
    } finally {
        this.isLoading = false;
    }
    
    return ffmpeg;
  }

  /**
   * Tối ưu hóa độ phân giải video
   */
  static async optimizeVideo(file: File, onProgress?: (p: number) => void): Promise<File> {
    // 1. Kiểm tra loại file ngay lập tức
    if (!file.type.startsWith('video/')) {
        return file;
    }

    try {
      // 2. Kiểm tra độ phân giải bằng thẻ video ẩn (KHÔNG TỐN DATA)
      const dimensions = await this.getVideoDimensions(file);
      const maxDim = Math.max(dimensions.width, dimensions.height);

      // Nếu video nhỏ hơn hoặc bằng Full HD (1080p) -> Bỏ qua, không load FFmpeg (tiết kiệm 30MB)
      if (maxDim <= 1920 || dimensions.width === 0) {
        console.log("[VideoOptimizer] Skip: Video is already <= 1080p.", dimensions);
        return file;
      }

      console.log(`[VideoOptimizer] 4K/2K Detected (${dimensions.width}x${dimensions.height}). Initializing FFmpeg...`);
      const startTime = performance.now();

      // 3. Chỉ load FFmpeg khi thực sự cần nén
      const ffmpeg = await this.load();

      const inputName = `input_${Date.now()}.mp4`;
      const outputName = `output_${Date.now()}.mp4`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      if (onProgress) {
        ffmpeg.on('progress', ({ progress }) => {
          onProgress(Math.round(progress * 100));
        });
      }

      // LẤY SỐ NHÂN CPU ĐỂ TỐI ƯU ĐA LUỒNG
      const threads = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4;
      console.log(`[VideoOptimizer] Using ${threads} threads for compression.`);

      // Nén SIÊU NHANH (ultrafast)
      // -r 30: Đưa về 30fps để giảm 50% khối lượng xử lý nếu gốc là 60fps
      // -threads: Ép sử dụng tối đa nhân CPU
      await ffmpeg.exec([
        '-i', inputName,
        '-vf', "scale='if(gt(iw,ih),1920,-2)':'if(gt(iw,ih),-2,1920)'",
        '-c:v', 'libx264',
        '-crf', '28',         // Tăng nhẹ CRF để nén nhanh hơn nữa (giảm chất lượng không đáng kể)
        '-preset', 'ultrafast', // Preset nhanh nhất của x264
        '-r', '30',            // Giới hạn 30fps
        '-threads', threads.toString(),
        '-c:a', 'copy',
        outputName
      ]);

      const data = await ffmpeg.readFile(outputName);
      const endTime = performance.now();
      console.log(`[VideoOptimizer] Compression finished in ${((endTime - startTime) / 1000).toFixed(1)}s`);
      
      const optimizedFile = new File([data as any], file.name, { type: 'video/mp4' });

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      return optimizedFile;
    } catch (error) {
      console.error("[VideoOptimizer] Error during optimization, falling back to original:", error);
      return file; // Fallback an toàn
    }
  }

  private static getVideoDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const url = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        resolve({ width: video.videoWidth, height: video.videoHeight });
        URL.revokeObjectURL(url);
      };

      video.onerror = () => {
        console.warn("[VideoOptimizer] Could not load video metadata.");
        resolve({ width: 0, height: 0 });
        URL.revokeObjectURL(url);
      };

      video.src = url;
    });
  }

  /**
   * Kiểm tra xem danh sách file có chứa video > 1080p không
   */
  static async hasLargeVideos(files: File[]): Promise<boolean> {
    const videoFiles = files.filter(f => f.type.startsWith('video/'));
    if (videoFiles.length === 0) return false;

    // Kiểm tra song song tất cả video
    const results = await Promise.all(videoFiles.map(f => this.getVideoDimensions(f)));
    return results.some(d => Math.max(d.width, d.height) > 1920);
  }

  static async estimateOptimizedSize(file: File): Promise<number> {
    try {
      const dim = await this.getVideoDimensions(file);
      const isLarge = Math.max(dim.width, dim.height) > 1920;

      // Nếu video đã nhỏ sẵn, không nén -> giữ nguyên dung lượng
      if (!isLarge) return file.size;

      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          const duration = video.duration || 0;
          // CÔNG THỨC CỐT LÕI: (Bitrate_Video + Bitrate_Audio) * Duration * Overhead
          // - Bitrate_Video: 3000 kbps (cho 1080p)
          // - Bitrate_Audio: 128 kbps
          // - Overhead: 1.02 (2% cho MP4 container)
          const TOTAL_BITRATE_BPS = (3000 + 128) * 1000;
          const estimatedBytes = Math.round((duration * TOTAL_BITRATE_BPS * 1.02) / 8);
          
          URL.revokeObjectURL(video.src);
          resolve(estimatedBytes);
        };
        video.onerror = () => {
          URL.revokeObjectURL(video.src);
          resolve(Math.round(file.size * 0.4)); // Fallback: giả định nén được 60%
        };
        video.src = URL.createObjectURL(file);
      });
    } catch (e) {
      console.error("[Estimate] Error:", e);
      return Math.round(file.size * 0.4);
    }
  }
}
