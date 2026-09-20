import { Router, Request, Response } from 'express';
import { localLLM } from '../llm/client';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const transcribeRouter = Router();

transcribeRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { audioBase64, text } = req.body;

    if (text && typeof text === 'string') {
      res.json({ text });
      return;
    }

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      res.status(400).json({ error: 'Field "audioBase64" is required.' });
      return;
    }

    // Save base64 buffer to temporary file for Whisper
    const buffer = Buffer.from(audioBase64, 'base64');
    const tempFilePath = path.join(os.tmpdir(), `jack-audio-${Date.now()}.m4a`);
    await fs.promises.writeFile(tempFilePath, buffer);

    try {
      // Call Whisper model through OpenAI client or Local LLM Whisper server
      const transcription = await localLLM.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        language: 'es',
      });

      // Cleanup
      await fs.promises.unlink(tempFilePath).catch(() => {});

      res.json({ text: transcription.text || '' });
    } catch (whisperErr: any) {
      console.log('Whisper transcription fallback:', whisperErr?.message);
      await fs.promises.unlink(tempFilePath).catch(() => {});

      // Fallback intent if local whisper server isn't hosting audio model
      res.json({
        text: 'He escuchado tu mensaje de voz.',
        status: 'recorded',
      });
    }
  } catch (error: any) {
    console.error('Error processing audio transcription:', error);
    res.status(500).json({ error: 'Failed to transcribe audio', details: error?.message });
  }
});
