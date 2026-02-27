import asyncio
import os
import uuid
import tempfile
from typing import Optional

import azure.cognitiveservices.speech as speechsdk
from loguru import logger

from backend.core.config import settings


class SpeechService:
    @staticmethod
    def _speech_config() -> speechsdk.SpeechConfig:
        config = speechsdk.SpeechConfig(
            subscription=settings.azure_speech_key,
            region=settings.azure_speech_region,
        )
        config.speech_recognition_language = "en-US"
        return config

    @staticmethod
    async def transcribe_audio_from_file(file_path: str) -> str:
        """
        Run Azure Speech-to-Text on a local file.
        file_path: relative path like 'uploads/videos/...'
        """
        def _transcribe() -> str:
            # Resolve to absolute path
            abs_path = os.path.abspath(os.path.join("backend", file_path))
            if not os.path.exists(abs_path):
                # Try relative to CWD
                abs_path = os.path.abspath(file_path)
            
            if not os.path.exists(abs_path):
                logger.error(f"Audio file not found at {abs_path}")
                return ""

            logger.info("Transcribing audio file: %s", abs_path)

            try:
                speech_config = SpeechService._speech_config()
                audio_config = speechsdk.audio.AudioConfig(filename=abs_path)
                recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
                
                done = False
                transcript = []

                def stop_cb(evt):
                    nonlocal done
                    done = True

                def recognized_cb(evt):
                    transcript.append(evt.result.text)

                recognizer.recognized.connect(recognized_cb)
                recognizer.session_stopped.connect(stop_cb)
                recognizer.canceled.connect(stop_cb)

                recognizer.start_continuous_recognition()
                while not done:
                    import time
                    time.sleep(0.5)
                
                recognizer.stop_continuous_recognition()
                
                full_text = " ".join(transcript)
                if not full_text:
                    logger.warning("No speech recognized.")
                return full_text

            except Exception as e:
                logger.error(f"Speech recognition error: {e}")
                return ""

        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, _transcribe)

    @staticmethod
    async def synthesize_speech_to_file(text: str, voice_name: str = "en-US-JennyNeural") -> str:
        """
        Convert text to speech, save to local file, return relative path.
        """

        def _synthesize() -> str:
            try:
                # Ensure directory exists
                target_dir = os.path.join("backend", "uploads", "audio")
                os.makedirs(target_dir, exist_ok=True)
                
                filename = f"{uuid.uuid4()}.mp3"
                base_path = os.path.join(target_dir, filename)
                # Absolute path for SDK
                abs_path = os.path.abspath(base_path)

                logger.info("Synthesizing speech to %s", abs_path)
                speech_config = SpeechService._speech_config()
                speech_config.speech_synthesis_voice_name = voice_name
                
                audio_config = speechsdk.audio.AudioOutputConfig(filename=abs_path)
                synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)
                
                result = synthesizer.speak_text_async(text).get()
                
                if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                    return f"uploads/audio/{filename}"
                
                logger.error("Text-to-speech failed: %s", result.reason)
                return ""
            except Exception as e:
                logger.error(f"Speech synthesis error: {e}")
                return ""

        loop = asyncio.get_running_loop()
        path = await loop.run_in_executor(None, _synthesize)
        if not path:
            raise RuntimeError("Failed to synthesize speech")
        return path

