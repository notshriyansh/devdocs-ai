from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
)
from urllib.parse import urlparse, parse_qs
import re


def extract_video_id(video_url: str) -> str:
    """
    Robustly extract YouTube video ID from various URL formats.
    Handles: youtube.com/watch, youtu.be, embed links, /v/ paths
    """
    patterns = [
        r'(?:youtube\.com\/watch\?.*v=|youtube\.com\/v\/|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})',
        r'(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]{11})',
        r'([a-zA-Z0-9_-]{11})',  
    ]
    
    for pattern in patterns:
        match = re.search(pattern, video_url)
        if match:
            return match.group(1)
    
    parsed_url = urlparse(video_url)
    
    if parsed_url.hostname in ('youtu.be', 'www.youtu.be'):
        video_id = parsed_url.path[1:].split('?')[0]
    elif parsed_url.hostname in ('youtube.com', 'www.youtube.com'):
        if parsed_url.path == '/watch':
            video_id = parse_qs(parsed_url.query).get('v', [None])[0]
        elif parsed_url.path.startswith('/embed/'):
            video_id = parsed_url.path.split('/')[2]
        elif parsed_url.path.startswith('/v/'):
            video_id = parsed_url.path.split('/')[2]
        else:
            video_id = None
    else:
        video_id = None
    
    return video_id if video_id and len(video_id) == 11 else None


def get_youtube_transcript(video_url: str) -> str:
    """
    Extracts transcript from a YouTube video given its URL.
    
    Handles:
    - youtube.com/watch?v=...
    - youtu.be/...
    - youtube.com/embed/...
    - youtube.com/v/...
    
    Returns the concatenated plain text transcript.
    Raises exception if transcript unavailable.
    """
    video_id = extract_video_id(video_url)
    
    if not video_id:
        raise ValueError(f"Could not extract valid YouTube video ID from URL: {video_url}")
    
    try:
        if hasattr(YouTubeTranscriptApi, "get_transcript"):
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        else:
            transcript_list = YouTubeTranscriptApi().fetch(video_id).to_raw_data()
        
        if not transcript_list:
            raise ValueError("Transcript is empty")
        
        transcript_text = " ".join([item['text'] for item in transcript_list])
        
        return transcript_text
    
    except TranscriptsDisabled as e:
        raise ValueError(f"Transcripts disabled for video {video_id}: {str(e)}")
    except NoTranscriptFound:
        raise ValueError(f"No transcript available for video {video_id}")
    except VideoUnavailable:
        raise ValueError(f"Video is unavailable: {video_id}")
    except Exception as e:
        raise Exception(f"Failed to extract YouTube transcript: {str(e)}")
