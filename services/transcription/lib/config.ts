// services/transcription/config/index.ts

export class Config {
    static getAssemblyAIApiKey(): string {
      const apiKey = process.env.ASSEMBLYAI_API_KEY;
      if (!apiKey) {
        throw new Error('ASSEMBLYAI_API_KEY environment variable is required');
      }
      return apiKey;
    }
  
    static getMaxFileSizeMB(): number {
      const maxSize = process.env.MAX_FILE_SIZE_MB;
      return maxSize ? parseInt(maxSize, 10) : 50; // Default 50MB
    }
  
    static getMaxFileSizeBytes(): number {
      return this.getMaxFileSizeMB() * 1024 * 1024;
    }
  
    static getAssemblyAIHeaders(): Record<string, string> {
      return {
        'Authorization': this.getAssemblyAIApiKey(),
        'Content-Type': 'application/json',
      };
    }
  }
  
  export default Config;
