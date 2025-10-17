import { apiClient } from './authService';

export interface TextToSpeechRequest {
  text: string;
  voice?: string;
  speed?: number;
}

export const ttsService = {
  async convertTextToSpeech(data: TextToSpeechRequest): Promise<Blob> {
    const response = await apiClient.post('/speech/convert', data, {
      responseType: 'blob',
    });
    return response.data;
  },
};
