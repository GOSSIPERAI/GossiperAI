// public/audio-processor.js
// AudioWorklet processor for converting audio to PCM format
class PCMProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const inputData = input[0]; // Get mono channel
      
      // Convert Float32 to Int16 PCM
      const int16Array = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      
      // Send PCM data to main thread
      this.port.postMessage(int16Array.buffer);
    }
    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);

