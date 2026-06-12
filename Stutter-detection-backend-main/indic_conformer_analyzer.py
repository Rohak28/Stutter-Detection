"""
indic_conformer_analyzer.py

IndicConformer-based multilingual speech analysis module.
Supports TWO modes:
1. LOCAL MODE: Uses NeMo with local .nemo model file (preferred)
2. API MODE: Falls back to Replicate/HuggingFace API if NeMo not available

This hybrid approach allows:
- Docker deployments to use lightweight API mode
- Local development to use full offline mode with the model file
"""

import os
import logging
import tempfile
import numpy as np
import soundfile as sf
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass
import re
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@dataclass
class IndicTranscriptionResult:
    """Container for IndicConformer transcription results."""
    text: str
    language: str
    segments: List[Dict]
    word_timings: List[Dict]
    fillers: List[Dict]
    repetitions: List[Dict]
    prolongations: List[Dict]
    blocks: List[Dict]
    confidence: float
    duration: float
    speech_rate: float


class IndicConformerAnalyzer:
    """
    IndicConformer-based stutter detection supporting English, Hindi, and Marathi.
    
    Modes:
    - LOCAL: Uses NeMo with local model file (no API needed)
    - API: Falls back to Replicate Whisper API
    """
    
    # Language-specific filler words
    FILLER_PATTERNS = {
        "en": ["uh", "um", "er", "ah", "eh", "hm", "hmm", "like", "you know", "i mean", "so", "well"],
        "hi": ["अं", "उम", "हां", "अरे", "मतलब", "तो", "बस", "ऐसे", "वो", "क्या बोले", "समझे"],
        "mr": ["अं", "उम", "हां", "म्हणजे", "तर", "बस", "असे", "ते", "काय बोललं"],
    }
    
    # Language-specific repetition patterns (regex)
    REPETITION_PATTERNS = {
        "en": [
            r'\b(\w+)\s+\1\b',  # Word repetition: "the the"
            r'\b([a-z])-\1',   # Sound repetition: "t-t-the"
            r'\b(\w{1,3})-\1+\w*\b',  # Partial repetition: "st-st-stutter"
        ],
        "hi": [
            r'(\S+)\s+\1',  # Word repetition in Devanagari
            r'(.)\1{2,}',   # Character repetition: मममैं
        ],
        "mr": [
            r'(\S+)\s+\1',  # Word repetition in Devanagari
            r'(.)\1{2,}',   # Character repetition
        ],
    }
    
    # Prolongation patterns (extended sounds)
    PROLONGATION_PATTERNS = {
        "en": [
            r'([a-z])\1{2,}',  # Extended letters: "sssss"
            r'([aeiou])\1{2,}',  # Extended vowels: "aaaaah"
        ],
        "hi": [
            r'(.)\1{2,}',  # Extended character
            r'[ाीूेैोौं]{2,}',  # Extended matras
        ],
        "mr": [
            r'(.)\1{2,}',
            r'[ाीूेैोौं]{2,}',
        ],
    }

    def __init__(self):
        """Initialize the IndicConformer analyzer."""
        self.model = None
        self.use_local_model = False
        self._try_load_local_model()
        
        if not self.use_local_model:
            logger.info("IndicConformerAnalyzer initialized in API MODE (Replicate fallback)")
        else:
            logger.info("IndicConformerAnalyzer initialized in LOCAL MODE (HuggingFace transformers)")

    def _try_load_local_model(self):
        """Try to load the IndicConformer model via HuggingFace transformers."""
        try:
            from transformers import AutoModel
            import torch
            
            # Check for HuggingFace token (needed for gated model)
            hf_token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN")
            if not hf_token:
                logger.warning("No HF_TOKEN found. IndicConformer model requires authentication. Using API mode.")
                return
            
            logger.info("=" * 60)
            logger.info("🚀 LOADING INDICCONFORMER MODEL VIA HUGGINGFACE")
            logger.info("   Repo: ai4bharat/indic-conformer-600m-multilingual")
            logger.info("=" * 60)
            
            # Load model from HuggingFace (will download and cache on first run)
            self.model = AutoModel.from_pretrained(
                "ai4bharat/indic-conformer-600m-multilingual",
                trust_remote_code=True,
                token=hf_token
            )
            
            # Move to GPU if available
            if torch.cuda.is_available():
                self.model = self.model.cuda()
                logger.info("✅ Model loaded on GPU (CUDA)")
            else:
                logger.info("✅ Model loaded on CPU")
            
            self.use_local_model = True
            
        except ImportError:
            logger.warning("transformers not installed. Using API mode.")
        except Exception as e:
            logger.warning(f"Could not load IndicConformer model: {e}. Using API mode.")

    def detect_language(self, text: str) -> str:
        """
        Detect language from transcribed text.
        Returns: 'en', 'hi', or 'mr'
        """
        # Check for Devanagari script
        devanagari_pattern = re.compile(r'[\u0900-\u097F]')
        devanagari_chars = len(devanagari_pattern.findall(text))
        total_chars = len(text.replace(" ", ""))
        
        if total_chars == 0:
            return "en"
        
        devanagari_ratio = devanagari_chars / total_chars
        
        if devanagari_ratio > 0.3:
            # Check for Marathi-specific characters or patterns
            marathi_indicators = ["ळ", "ण", "आहे", "होते", "नाही", "आणि", "पण"]
            hindi_indicators = ["है", "था", "नहीं", "और", "लेकिन", "क्या"]
            
            marathi_count = sum(1 for word in marathi_indicators if word in text)
            hindi_count = sum(1 for word in hindi_indicators if word in text)
            
            # Use > (not >=) so ties (including 0==0) don't erroneously default to Marathi
            return "mr" if marathi_count > hindi_count else "hi"
        
        return "en"

    def _transcribe_with_api(self, audio_data: np.ndarray, sample_rate: int, 
                              language: Optional[str] = None) -> Dict:
        """
        Transcribe using Replicate Whisper API (fallback mode).
        Includes retry logic for rate limiting.
        """
        import replicate
        import time
        
        try:
            # Save audio to temp file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_wav:
                sf.write(tmp_wav.name, audio_data, sample_rate)
                audio_path = tmp_wav.name
            
            model_id = "openai/whisper:8099696689d249cf8b122d833c36ac3f75505c666a395ca40ef26f68e7d3d16e"
            
            logger.info("=" * 60)
            logger.info("🎯 API MODE: Using Whisper via Replicate")
            logger.info(f"   Model: {model_id}")
            logger.info(f"   Language: {language or 'auto-detect'}")
            logger.info("=" * 60)
            
            input_params = {
                "audio": open(audio_path, "rb"),
                "task": "transcribe",
                "temperature": 0.0,
            }
            
            if language:
                input_params["language"] = language
            
            # Retry logic for rate limiting
            max_retries = 5
            base_delay = 2
            output = None
            
            for attempt in range(max_retries):
                try:
                    output = replicate.run(model_id, input=input_params)
                    break
                except Exception as e:
                    error_str = str(e)
                    if "429" in error_str or "rate limit" in error_str.lower() or "throttled" in error_str.lower():
                        if attempt < max_retries - 1:
                            delay = base_delay * (2 ** attempt)
                            logger.warning(f"Rate limited. Retrying in {delay}s (attempt {attempt + 1}/{max_retries})")
                            time.sleep(delay)
                            input_params["audio"] = open(audio_path, "rb")
                            continue
                    raise
            
            os.remove(audio_path)
            
            if output is None:
                raise Exception("Failed to get transcription after all retries")
            
            return {
                "success": True,
                "text": output.get("transcription", ""),
                "segments": output.get("segments", []),
                "model": "whisper-api"
            }
            
        except Exception as e:
            logger.error(f"API transcription failed: {e}")
            return {"success": False, "error": str(e)}

    def _transcribe_with_local_model(self, audio_data: np.ndarray, sample_rate: int,
                                      language: Optional[str] = None) -> Dict:
        """
        Transcribe using local IndicConformer model via HuggingFace transformers.
        """
        try:
            import torch
            import torchaudio
            
            logger.info("=" * 60)
            logger.info("🎯 LOCAL MODE: Using IndicConformer via HuggingFace transformers")
            logger.info(f"   Model: ai4bharat/indic-conformer-600m-multilingual")
            logger.info(f"   Audio Duration: {len(audio_data) / sample_rate:.2f}s")
            logger.info(f"   Language: {language or 'auto'}")
            logger.info("=" * 60)
            
            # Convert numpy array to torch tensor
            if isinstance(audio_data, np.ndarray):
                wav = torch.from_numpy(audio_data).float()
            else:
                wav = audio_data
            
            # Ensure correct shape: (1, num_samples)
            if wav.dim() == 1:
                wav = wav.unsqueeze(0)
            elif wav.dim() == 2 and wav.shape[0] > 1:
                # Multi-channel: average to mono
                wav = torch.mean(wav, dim=0, keepdim=True)
            
            # Resample to 16000 Hz if needed
            target_sample_rate = 16000
            if sample_rate != target_sample_rate:
                resampler = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=target_sample_rate)
                wav = resampler(wav)
            
            # Determine language code for model
            lang_code = language or "en"  # Default to English if not specified
            
            # Transcribe using RNNT decoder (better accuracy)
            try:
                text = self.model(wav, lang_code, "rnnt")
            except Exception as rnnt_err:
                logger.warning(f"RNNT decoding failed, trying CTC: {rnnt_err}")
                text = self.model(wav, lang_code, "ctc")
            
            if isinstance(text, (list, tuple)):
                text = text[0] if text else ""
            
            text = str(text).strip()
            
            # Quality check: if result is empty or suspiciously short, trigger Whisper fallback
            if len(text) < 3:
                raise Exception(f"Local model returned empty/short transcription ('{text}'). Falling back to Whisper API.")
            
            duration = len(audio_data) / sample_rate
            
            # Create segments from the transcription
            segments = [{"text": text, "start": 0.0, "end": duration}]
            
            return {
                "success": True,
                "text": text,
                "segments": segments,
                "model": "indicconformer-local"
            }
            
        except Exception as e:
            logger.error(f"Local model transcription failed: {e}")
            return {"success": False, "error": str(e)}

    def _extract_segments_from_hypothesis(self, hypothesis, audio_data, sample_rate) -> List[Dict]:
        """Extract segments with timestamps from NeMo hypothesis object."""
        segments = []
        
        try:
            if hasattr(hypothesis, 'timestep') and hypothesis.timestep is not None:
                text = hypothesis.text if hasattr(hypothesis, 'text') else str(hypothesis)
                words = text.split()
                num_words = len(words)
                total_duration = len(audio_data) / sample_rate
                
                if num_words > 0:
                    word_duration = total_duration / num_words
                    for i, word in enumerate(words):
                        segments.append({
                            "text": word,
                            "start": i * word_duration,
                            "end": (i + 1) * word_duration,
                            "words": [{"word": word, "start": i * word_duration, "end": (i + 1) * word_duration}]
                        })
            else:
                text = hypothesis.text if hasattr(hypothesis, 'text') else str(hypothesis)
                segments = [{"text": text, "start": 0.0, "end": len(audio_data) / sample_rate}]
                
        except Exception as e:
            logger.warning(f"Could not extract timesteps: {e}")
            text = str(hypothesis)
            segments = [{"text": text, "start": 0.0, "end": len(audio_data) / sample_rate}]
        
        return segments

    def transcribe_audio(self, audio_data: np.ndarray, sample_rate: int, 
                         language: Optional[str] = None) -> IndicTranscriptionResult:
        """
        Transcribe audio - uses local model if available, otherwise API.
        """
        try:
            # Choose transcription method based on availability
            if self.use_local_model and self.model is not None:
                result = self._transcribe_with_local_model(audio_data, sample_rate, language)
            else:
                result = self._transcribe_with_api(audio_data, sample_rate, language)
            
            if not result.get("success"):
                raise Exception(result.get("error", "Transcription failed"))
            
            text = result["text"]
            segments = result["segments"]
            model_used = result["model"]
            
            # Detect language from transcribed text if not provided
            lang_code = language or self.detect_language(text)
            
            logger.info(f"✅ TRANSCRIPTION COMPLETE ({model_used})")
            logger.info(f"   Detected Language: {lang_code}")
            logger.info(f"   Text Length: {len(text)} characters")
            logger.info(f"   Preview: {text[:100]}..." if len(text) > 100 else f"   Text: {text}")

            # Perform stutter analysis
            word_timings = self._extract_word_timings(text, segments)
            fillers = self._detect_fillers(text, word_timings, lang_code)
            repetitions = self._detect_repetitions(text, word_timings, lang_code)
            prolongations = self._detect_prolongations(text, word_timings, lang_code)
            blocks = self._detect_blocks(audio_data, sample_rate, segments)

            # Calculate metrics
            duration = segments[-1]["end"] if segments else len(audio_data) / sample_rate
            word_count = len(text.split())
            speech_rate = (word_count / duration * 60) if duration > 0 else 0

            return IndicTranscriptionResult(
                text=text,
                language=lang_code,
                segments=segments,
                word_timings=word_timings,
                fillers=fillers,
                repetitions=repetitions,
                prolongations=prolongations,
                blocks=blocks,
                confidence=1.0,
                duration=duration,
                speech_rate=speech_rate,
            )

        except Exception as e:
            logger.error(f"Error in transcription: {e}")
            raise

    def _extract_word_timings(self, text: str, segments: List[Dict]) -> List[Dict]:
        """Extract word timings from text and segments."""
        word_timings = []
        
        for segment in segments:
            words = segment.get("words", [])
            if words:
                for word_info in words:
                    if isinstance(word_info, dict):
                        word_timings.append({
                            "word": word_info.get("word", "").strip(),
                            "start": word_info.get("start", segment.get("start", 0)),
                            "end": word_info.get("end", segment.get("end", 0)),
                            "confidence": word_info.get("confidence", 1.0),
                        })
            else:
                segment_text = segment.get("text", text)
                words_list = segment_text.split()
                if words_list:
                    start = segment.get("start", 0)
                    end = segment.get("end", len(text.split()) * 0.3)
                    segment_duration = end - start
                    word_duration = segment_duration / len(words_list)
                    for i, word in enumerate(words_list):
                        word_timings.append({
                            "word": word.strip(),
                            "start": start + i * word_duration,
                            "end": start + (i + 1) * word_duration,
                            "confidence": 1.0,
                        })
        
        return word_timings

    def _detect_fillers(self, text: str, word_timings: List[Dict], language: str) -> List[Dict]:
        """Detect filler words based on language."""
        fillers = []
        filler_words = self.FILLER_PATTERNS.get(language, self.FILLER_PATTERNS["en"])
        
        for word_info in word_timings:
            word = word_info["word"].lower().strip(".,!?")
            
            if word in filler_words:
                fillers.append({
                    "word": word,
                    "start": word_info["start"],
                    "end": word_info["end"],
                    "event_type": "filler",
                    "language": language,
                    "confidence": 0.9,
                })
        
        return fillers

    def _detect_repetitions(self, text: str, word_timings: List[Dict], language: str) -> List[Dict]:
        """Detect word and sound repetitions."""
        repetitions = []
        patterns = self.REPETITION_PATTERNS.get(language, self.REPETITION_PATTERNS["en"])
        
        words = [w["word"].lower().strip(".,!?") for w in word_timings]
        
        i = 0
        while i < len(words) - 1:
            if words[i] == words[i + 1] and len(words[i]) > 1:
                count = 1
                j = i + 1
                while j < len(words) and words[j] == words[i]:
                    count += 1
                    j += 1
                
                repetitions.append({
                    "word": words[i],
                    "count": count,
                    "start": word_timings[i]["start"],
                    "end": word_timings[j - 1]["end"],
                    "event_type": "repetition",
                    "repetition_type": "word",
                    "language": language,
                    "confidence": 0.9,
                })
                i = j
            else:
                i += 1
        
        for pattern in patterns:
            for match in re.finditer(pattern, text.lower()):
                matched_text = match.group()
                for word_info in word_timings:
                    if matched_text in word_info["word"].lower():
                        repetitions.append({
                            "word": matched_text,
                            "count": 2,
                            "start": word_info["start"],
                            "end": word_info["end"],
                            "event_type": "repetition",
                            "repetition_type": "sound",
                            "language": language,
                            "confidence": 0.8,
                        })
                        break
        
        return repetitions

    def _detect_prolongations(self, text: str, word_timings: List[Dict], language: str) -> List[Dict]:
        """Detect sound prolongations (extended sounds)."""
        prolongations = []
        patterns = self.PROLONGATION_PATTERNS.get(language, self.PROLONGATION_PATTERNS["en"])
        
        for pattern in patterns:
            for match in re.finditer(pattern, text.lower()):
                matched_text = match.group()
                
                for word_info in word_timings:
                    if matched_text in word_info["word"].lower():
                        prolongations.append({
                            "word": word_info["word"],
                            "pattern": matched_text,
                            "start": word_info["start"],
                            "end": word_info["end"],
                            "event_type": "prolongation",
                            "language": language,
                            "confidence": 0.85,
                        })
                        break
        
        return prolongations

    def _detect_blocks(self, audio_data: np.ndarray, sample_rate: int, 
                       segments: List[Dict]) -> List[Dict]:
        """Detect blocks (silent pauses mid-speech)."""
        blocks = []
        
        if len(segments) < 2:
            return blocks
        
        min_block_duration = 0.5
        
        for i in range(len(segments) - 1):
            pause_start = segments[i].get("end", 0)
            pause_end = segments[i + 1].get("start", 0)
            pause_duration = pause_end - pause_start
            
            if pause_duration > min_block_duration:
                prev_text = segments[i].get("text", "").strip()
                is_mid_sentence = not prev_text.endswith(('.', '!', '?', '।', '|'))
                
                if is_mid_sentence or pause_duration > 1.0:
                    blocks.append({
                        "start": pause_start,
                        "end": pause_end,
                        "duration": pause_duration,
                        "event_type": "block",
                        "is_block": True,
                        "confidence": min(0.9, 0.5 + (pause_duration - min_block_duration) * 0.4),
                    })
        
        return blocks

    def calculate_fluency_score(self, result: IndicTranscriptionResult) -> tuple:
        """Calculate fluency score based on stutter events."""
        total_words = len(result.text.split())
        if total_words == 0:
            return 100, "Mild"
        
        num_fillers = len(result.fillers)
        num_repetitions = len(result.repetitions)
        num_prolongations = len(result.prolongations)
        num_blocks = len(result.blocks)
        
        weighted_stutters = (
            num_fillers * 0.5 +
            num_repetitions * 1.0 +
            num_prolongations * 1.2 +
            num_blocks * 1.5
        )
        
        stutter_percentage = (weighted_stutters / total_words) * 100
        fluency_score = max(0, min(100, 100 - stutter_percentage * 5))
        
        if fluency_score >= 80:
            severity = "Mild"
        elif fluency_score >= 60:
            severity = "Moderate"
        else:
            severity = "Severe"
        
        return round(fluency_score, 1), severity

    def analyze_audio(self, audio_data: np.ndarray, sample_rate: int,
                      language: Optional[str] = None) -> Dict:
        """
        Perform complete stutter analysis on audio.
        Uses local model if available, otherwise API.
        """
        try:
            result = self.transcribe_audio(audio_data, sample_rate, language)
            fluency_score, severity = self.calculate_fluency_score(result)
            
            stutter_events = []
            
            for filler in result.fillers:
                stutter_events.append({
                    "time": f"{int(filler['start']//60)}:{int(filler['start']%60):02d}",
                    "type": "Interjection",
                    "severity": "Mild",
                    "word": filler["word"],
                    "start": filler["start"],
                    "end": filler["end"],
                })
            
            for rep in result.repetitions:
                stutter_events.append({
                    "time": f"{int(rep['start']//60)}:{int(rep['start']%60):02d}",
                    "type": "Repetition",
                    "severity": "Moderate" if rep["count"] > 2 else "Mild",
                    "word": rep["word"],
                    "count": rep["count"],
                    "start": rep["start"],
                    "end": rep["end"],
                })
            
            for pro in result.prolongations:
                stutter_events.append({
                    "time": f"{int(pro['start']//60)}:{int(pro['start']%60):02d}",
                    "type": "Prolongation",
                    "severity": "Moderate",
                    "word": pro["word"],
                    "start": pro["start"],
                    "end": pro["end"],
                })
            
            for block in result.blocks:
                stutter_events.append({
                    "time": f"{int(block['start']//60)}:{int(block['start']%60):02d}",
                    "type": "Block",
                    "severity": "Severe" if block["duration"] > 1.0 else "Moderate",
                    "word": "[pause]",
                    "duration": block["duration"],
                    "start": block["start"],
                    "end": block["end"],
                })
            
            stutter_events.sort(key=lambda x: x["start"])
            
            disfluency_types = {
                "Repetition": len(result.repetitions),
                "Prolongation": len(result.prolongations),
                "Block": len(result.blocks),
                "Interjection": len(result.fillers),
            }
            
            model_mode = "IndicConformer (LOCAL)" if self.use_local_model else "Whisper (API)"
            
            return {
                "transcription": result.text,
                "language": result.language,
                "fluency_score": fluency_score,
                "severity": severity,
                "stuttering_events": stutter_events,
                "disfluency_types": disfluency_types,
                "duration": result.duration,
                "speech_rate": round(result.speech_rate, 2),
                "num_repetitions": len(result.repetitions),
                "num_fillers": len(result.fillers),
                "num_prolongations": len(result.prolongations),
                "num_blocks": len(result.blocks),
                "analysis_details": {
                    "totalWords": len(result.text.split()),
                    "stutteredWords": len(stutter_events),
                    "speechRate": round(result.speech_rate, 2),
                    "language": result.language,
                    "model": model_mode,
                }
            }
            
        except Exception as e:
            logger.error(f"Error in audio analysis: {e}")
            return {"error": str(e)}
