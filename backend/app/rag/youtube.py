from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs

def get_youtube_transcript(video_url: str) -> str:
    """
    Extracts transcript from a YouTube video given its URL.
    Returns the concatenated plain text transcript.
    """
    try:
        parsed_url = urlparse(video_url)
        video_id = None
        
        if parsed_url.hostname in ('youtu.be', 'www.youtu.be'):
            video_id = parsed_url.path[1:]
        elif parsed_url.hostname in ('youtube.com', 'www.youtube.com'):
            if parsed_url.path == '/watch':
                video_id = parse_qs(parsed_url.query).get('v', [None])[0]
            elif parsed_url.path.startswith('/embed/'):
                video_id = parsed_url.path.split('/')[2]
            elif parsed_url.path.startswith('/v/'):
                video_id = parsed_url.path.split('/')[2]
        
        if not video_id:
            raise ValueError("Could not parse YouTube video ID from URL")

        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        
        transcript_text = " ".join([item['text'] for item in transcript_list])
        
        return transcript_text

    except Exception as e:
        raise Exception(f"Failed to extract YouTube transcript: {str(e)}")
