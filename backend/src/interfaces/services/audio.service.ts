export interface IAudioService {
  processAudio(
    filePath: string,
    sourceLang: string,
    targetLang: string,
  ): Promise<{ original_text: string; translated_text: string }>;
}
