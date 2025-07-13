
export class SpeechManager {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      throw new Error('Failed to start recording: ' + error);
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('language', 'ja');

    const response = await fetch('/api/speech/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to transcribe audio');
    }

    const data = await response.json();
    return data.text;
  }

  async textToSpeech(text: string, gender: 'male' | 'female' = 'female'): Promise<ArrayBuffer> {
    const response = await fetch('/api/speech/synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, gender }),
    });

    if (!response.ok) {
      throw new Error('Failed to synthesize speech');
    }

    return await response.arrayBuffer();
  }

  async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      console.log('Empty audio buffer, skipping playback');
      return Promise.resolve();
    }

    try {
      const audioContext = new AudioContext();
      // ArrayBufferをコピーして切断を防ぐ
      const bufferCopy = audioBuffer.slice(0);
      const audioData = await audioContext.decodeAudioData(bufferCopy);
      const source = audioContext.createBufferSource();
      source.buffer = audioData;
      source.connect(audioContext.destination);
      
      return new Promise((resolve) => {
        source.onended = () => {
          audioContext.close().then(resolve).catch(resolve);
        };
        source.start();
      });
    } catch (error) {
      console.error('Failed to play audio:', error);
      return Promise.resolve(); // エラーでも処理を継続
    }
  }
}