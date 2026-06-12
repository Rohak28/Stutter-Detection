"""
multilingual_analyzer.py

Multilingual speech analysis module with support for English, Hindi, and Marathi.
Uses Whisper for transcription and language-specific stutter detection patterns.
"""

import os
import logging
import tempfile
import numpy as np
import soundfile as sf
import replicate
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
class MultilingualTranscriptionResult:
    """Container for multilingual transcription results."""
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


class MultilingualStutterAnalyzer:
    """
    Multilingual stutter detection supporting English, Hindi, and Marathi.
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
        """Initialize the multilingual analyzer."""
        self.replicate_token = os.getenv("REPLICATE_API_TOKEN")
        if not self.replicate_token:
            logger.warning("REPLICATE_API_TOKEN not set. Using default model.")
        logger.info("MultilingualStutterAnalyzer initialized")

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

    def transcribe_audio(self, audio_data: np.ndarray, sample_rate: int, 
                         language: Optional[str] = None) -> MultilingualTranscriptionResult:
        """
        Transcribe audio with multilingual support.
        
        Args:
            audio_data: Audio signal as numpy array
            sample_rate: Sample rate of audio
            language: Optional language code ('en', 'hi', 'mr'). Auto-detected if None.
            
        Returns:
            MultilingualTranscriptionResult with analysis
        """
        try:
            # Save audio to temp file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_wav:
                sf.write(tmp_wav.name, audio_data, sample_rate)
                audio_path = tmp_wav.name

            # Determine language setting for Whisper
            whisper_language = None
            if language:
                whisper_language_map = {"en": "en", "hi": "hi", "mr": "mr"}
                whisper_language = whisper_language_map.get(language)

            # Call Replicate Whisper API
            model_id = "openai/whisper:8099696689d249cf8b122d833c36ac3f75505c666a395ca40ef26f68e7d3d16e"
            logger.info(f"=" * 60)
            logger.info(f"🎯 TRANSCRIPTION MODEL INFO")
            logger.info(f"   Model: Whisper (via Replicate API)")
            logger.info(f"   Model ID: {model_id}")
            logger.info(f"   Language: {whisper_language or 'auto-detect'}")
            logger.info(f"=" * 60)
            
            input_params = {
                "audio": open(audio_path, "rb"),
                "task": "transcribe",
                "temperature": 0.0,
                "initial_prompt": "Transcribe exactly as spoken including all hesitations, repetitions, and stutters.",
            }
            
            if whisper_language:
                input_params["language"] = whisper_language

            # Retry logic for rate limiting (429 errors)
            import time
            max_retries = 5
            base_delay = 2
            output = None
            
            for attempt in range(max_retries):
                try:
                    output = replicate.run(model_id, input=input_params)
                    break  # Success, exit retry loop
                except Exception as e:
                    error_str = str(e)
                    if "429" in error_str or "rate limit" in error_str.lower() or "throttled" in error_str.lower():
                        if attempt < max_retries - 1:
                            delay = base_delay * (2 ** attempt)
                            logger.warning(f"Rate limited by Replicate. Retrying in {delay}s (attempt {attempt + 1}/{max_retries})")
                            time.sleep(delay)
                            # Reopen the file for retry
                            input_params["audio"] = open(audio_path, "rb")
                            continue
                    raise
            
            if output is None:
                raise Exception("Failed to get transcription after all retries")

            text = output.get("transcription", "")
            segments = output.get("segments", [])
            detected_language = output.get("detected_language", language or "en")
            
            # Log transcription results
            logger.info(f"✅ TRANSCRIPTION COMPLETE")
            logger.info(f"   Detected Language: {detected_language}")
            logger.info(f"   Text Length: {len(text)} characters")
            logger.info(f"   Segments: {len(segments)}")
            logger.info(f"   Transcription Preview: {text[:100]}..." if len(text) > 100 else f"   Transcription: {text}")
            
            # Map detected language
            lang_code = self._map_language_code(detected_language)
            
            # If no segments, create basic one
            if not segments:
                segments = [{"text": text, "start": 0.0, "end": len(audio_data) / sample_rate}]

            # Cleanup temp file
            os.remove(audio_path)

            # Perform language-specific analysis
            word_timings = self._extract_word_timings(segments)
            fillers = self._detect_fillers(text, word_timings, lang_code)
            repetitions = self._detect_repetitions(text, word_timings, lang_code)
            prolongations = self._detect_prolongations(text, word_timings, lang_code)
            blocks = self._detect_blocks(audio_data, sample_rate, segments)

            # Calculate metrics
            duration = segments[-1]["end"] if segments else 0
            word_count = len(text.split())
            speech_rate = (word_count / duration * 60) if duration > 0 else 0

            return MultilingualTranscriptionResult(
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
            logger.error(f"Error in multilingual transcription: {e}")
            raise

    def _map_language_code(self, detected: str) -> str:
        """Map detected language to our supported codes."""
        lang_map = {
            "english": "en", "en": "en",
            "hindi": "hi", "hi": "hi",
            "marathi": "mr", "mr": "mr",
        }
        return lang_map.get(detected.lower(), "en")

    def _extract_word_timings(self, segments: List[Dict]) -> List[Dict]:
        """Extract word timings from segments."""
        word_timings = []
        
        for segment in segments:
            words = segment.get("words", [])
            if words:
                for word_info in words:
                    if isinstance(word_info, dict):
                        word_timings.append({
                            "word": word_info.get("word", "").strip(),
                            "start": word_info.get("start", segment["start"]),
                            "end": word_info.get("end", segment["end"]),
                            "confidence": word_info.get("confidence", 1.0),
                        })
            else:
                # If no word-level timing, split by spaces
                text = segment.get("text", "")
                words_list = text.split()
                if words_list:
                    segment_duration = segment["end"] - segment["start"]
                    word_duration = segment_duration / len(words_list)
                    for i, word in enumerate(words_list):
                        word_timings.append({
                            "word": word.strip(),
                            "start": segment["start"] + i * word_duration,
                            "end": segment["start"] + (i + 1) * word_duration,
                            "confidence": 1.0,
                        })
        
        return word_timings

    def _detect_fillers(self, text: str, word_timings: List[Dict], language: str) -> List[Dict]:
        """Detect filler words based on language."""
        fillers = []
        filler_words = self.FILLER_PATTERNS.get(language, self.FILLER_PATTERNS["en"])
        
        text_lower = text.lower()
        
        for i, word_info in enumerate(word_timings):
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
        
        # Check for word repetitions in transcription
        words = [w["word"].lower().strip(".,!?") for w in word_timings]
        
        i = 0
        while i < len(words) - 1:
            if words[i] == words[i + 1] and len(words[i]) > 1:
                # Found repetition
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
        
        # Check for sound repetitions using regex
        for pattern in patterns:
            for match in re.finditer(pattern, text.lower()):
                # Find corresponding timing
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
                
                # Find corresponding word timing
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
        
        min_block_duration = 0.5  # Minimum 500ms for a block
        max_natural_pause = 0.3   # Natural pauses are shorter
        
        for i in range(len(segments) - 1):
            pause_start = segments[i]["end"]
            pause_end = segments[i + 1]["start"]
            pause_duration = pause_end - pause_start
            
            if pause_duration > min_block_duration:
                # Check if it's mid-sentence (likely a block)
                prev_text = segments[i].get("text", "").strip()
                next_text = segments[i + 1].get("text", "").strip()
                
                # If previous segment doesn't end with sentence-ending punctuation
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

    def calculate_fluency_score(self, result: MultilingualTranscriptionResult) -> tuple:
        """
        Calculate fluency score based on stutter events.
        
        Returns:
            tuple: (fluency_score, severity)
        """
        total_words = len(result.text.split())
        if total_words == 0:
            return 100, "Mild"
        
        # Count stutter events
        num_fillers = len(result.fillers)
        num_repetitions = len(result.repetitions)
        num_prolongations = len(result.prolongations)
        num_blocks = len(result.blocks)
        
        # Weight different stutter types
        weighted_stutters = (
            num_fillers * 0.5 +
            num_repetitions * 1.0 +
            num_prolongations * 1.2 +
            num_blocks * 1.5
        )
        
        # Calculate stutter percentage
        stutter_percentage = (weighted_stutters / total_words) * 100
        
        # Convert to fluency score (100 = no stutters)
        fluency_score = max(0, min(100, 100 - stutter_percentage * 5))
        
        # Determine severity
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
        
        Args:
            audio_data: Audio signal
            sample_rate: Sample rate
            language: Optional language code ('en', 'hi', 'mr')
            
        Returns:
            Dictionary with complete analysis results
        """
        try:
            # Transcribe and analyze
            result = self.transcribe_audio(audio_data, sample_rate, language)
            
            # Calculate fluency score
            fluency_score, severity = self.calculate_fluency_score(result)
            
            # Format stutter events for frontend
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
            
            # Sort by time
            stutter_events.sort(key=lambda x: x["start"])
            
            # Calculate disfluency type counts
            disfluency_types = {
                "Repetition": len(result.repetitions),
                "Prolongation": len(result.prolongations),
                "Block": len(result.blocks),
                "Interjection": len(result.fillers),
            }
            
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
                }
            }
            
        except Exception as e:
            logger.error(f"Error in audio analysis: {e}")
            return {"error": str(e)}
