#!/usr/bin/env python3
"""
Gong Call Transcript Processor — AM Scorecard v1
Helper script for Claude Code to process large Gong transcripts.

Usage:
    python3 process_transcript.py <transcript_json_file> <output_file>

This script takes a raw Gong transcript JSON file and produces a condensed
summary suitable for LLM evaluation (under 4000 words per call).

Optimized for Account Manager client calls: detects retention signals,
expansion opportunities, advocacy indicators, and relationship depth.
"""

import json
import sys
from pathlib import Path


def extract_summary(transcript_data):
    """Extract a condensed summary from a Gong transcript."""

    # Handle the nested structure from Gong API
    if isinstance(transcript_data, list):
        transcript_data = transcript_data[0]

    if isinstance(transcript_data, dict) and 'text' in transcript_data:
        transcript_data = json.loads(transcript_data['text'])

    call_transcripts = transcript_data.get('callTranscripts', [])
    if not call_transcripts:
        return {"error": "No transcripts found"}

    results = []

    for ct in call_transcripts:
        call_id = ct.get('callId', 'unknown')
        segments = ct.get('transcript', [])

        # Compute speaker stats
        speakers = {}
        topics = set()
        total_words = 0

        for seg in segments:
            spk = seg.get('speakerId', 'unknown')
            topic = seg.get('topic')
            if topic:
                topics.add(topic)

            words = 0
            for s in seg.get('sentences', []):
                w = len(s.get('text', '').split())
                words += w

            speakers[spk] = speakers.get(spk, 0) + words
            total_words += words

        # Sort speakers by word count (most talkative first)
        sorted_speakers = sorted(speakers.items(), key=lambda x: x[1], reverse=True)

        # Extract opening (first 15 segments)
        opening = []
        for seg in segments[:15]:
            spk = seg.get('speakerId', '?')
            topic = seg.get('topic', '')
            text = ' '.join(s.get('text', '') for s in seg.get('sentences', []))
            opening.append(f"[Speaker {spk[-6:]}] ({topic or 'main'}) {text[:300]}")

        # Extract middle section (around the midpoint, 10 segments)
        mid = len(segments) // 2
        middle = []
        for seg in segments[max(0, mid-5):mid+5]:
            spk = seg.get('speakerId', '?')
            topic = seg.get('topic', '')
            text = ' '.join(s.get('text', '') for s in seg.get('sentences', []))
            middle.append(f"[Speaker {spk[-6:]}] ({topic or 'main'}) {text[:300]}")

        # Extract closing (last 15 segments)
        closing = []
        for seg in segments[-15:]:
            spk = seg.get('speakerId', '?')
            topic = seg.get('topic', '')
            text = ' '.join(s.get('text', '') for s in seg.get('sentences', []))
            closing.append(f"[Speaker {spk[-6:]}] ({topic or 'main'}) {text[:300]}")

        # Extract roadmap/product discussion segments
        roadmap_segments = []
        for seg in segments:
            topic = seg.get('topic', '')
            spk = seg.get('speakerId', '?')
            text = ' '.join(s.get('text', '') for s in seg.get('sentences', []))
            text_lower = text.lower()
            if (topic in ('Product', 'Roadmap', 'Features') or
                any(kw in text_lower for kw in ['roadmap', 'upcoming', 'new feature', 'release', 'beta', 'launch'])):
                if len(roadmap_segments) < 10:
                    roadmap_segments.append(f"[Speaker {spk[-6:]}] {text[:300]}")

        # Extract next steps / action items segments
        next_steps_segments = []
        for seg in segments:
            topic = seg.get('topic', '')
            spk = seg.get('speakerId', '?')
            text = ' '.join(s.get('text', '') for s in seg.get('sentences', []))
            if topic == 'Next Steps' and len(next_steps_segments) < 10:
                next_steps_segments.append(f"[Speaker {spk[-6:]}] {text[:300]}")

        # Look for key AM moments - questions asked by AM (top speaker)
        questions_by_rep = []
        rep_speaker_id = sorted_speakers[0][0] if sorted_speakers else None
        for seg in segments:
            if seg.get('speakerId') == rep_speaker_id:
                for s in seg.get('sentences', []):
                    text = s.get('text', '')
                    if '?' in text and len(text) > 20:
                        questions_by_rep.append(text[:200])

        # Look for client positive signals (AM-oriented keywords)
        positive_signals = []
        for seg in segments:
            if seg.get('speakerId') != rep_speaker_id:
                for s in seg.get('sentences', []):
                    text = s.get('text', '').lower()
                    if any(kw in text for kw in [
                        # Retention signals
                        'happy', 'satisfied', 'love', 'great', 'excellent', 'working well',
                        'helpful', 'valuable', 'appreciate', 'thank',
                        # Expansion signals
                        'more', 'additional', 'expand', 'scale', 'grow', 'volume',
                        'another team', 'other department', 'new use case', 'rollout',
                        'interested in', 'tell me more',
                        # Advocacy/evangelism signals
                        'recommend', 'refer', 'case study', 'reference', 'speaking',
                        'conference', 'introduce', 'colleague',
                        # Success signals
                        'roi', 'saving', 'faster', 'improved', 'efficiency',
                        'success', 'results', 'impact', 'outcome',
                        # Renewal signals
                        'renew', 'renewal', 'contract', 'continue', 'extend',
                        # Decision-maker signals
                        'budget', 'approve', 'decision', 'board', 'executive',
                    ]):
                        positive_signals.append(s.get('text', '')[:200])

        result = {
            "call_id": call_id,
            "total_segments": len(segments),
            "total_words": total_words,
            "speakers": {spk[-6:]: count for spk, count in sorted_speakers},
            "speaker_count": len(speakers),
            "topics_covered": list(topics),
            "top_speaker_talk_ratio": round(sorted_speakers[0][1] / total_words * 100, 1) if sorted_speakers and total_words > 0 else 0,
            "opening_transcript": opening,
            "middle_transcript": middle,
            "roadmap_discussion": roadmap_segments[:8],
            "next_steps_discussion": next_steps_segments[:8],
            "closing_transcript": closing,
            "questions_asked_by_rep": questions_by_rep[:15],
            "client_positive_signals": positive_signals[:15],
        }

        results.append(result)

    return results


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 process_transcript.py <input_json> <output_json>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    with open(input_file, 'r') as f:
        data = json.load(f)

    summary = extract_summary(data)

    with open(output_file, 'w') as f:
        json.dump(summary, f, indent=2)

    # Print quick stats
    for s in summary:
        if isinstance(s, dict) and 'call_id' in s:
            print(f"Call {s['call_id']}: {s['total_segments']} segments, {s['total_words']} words, {s['speaker_count']} speakers")
            print(f"  Topics: {s['topics_covered']}")
            print(f"  Top speaker ratio: {s['top_speaker_talk_ratio']}%")
            print(f"  Questions asked: {len(s.get('questions_asked_by_rep', []))}")
            print(f"  Client positive signals: {len(s.get('client_positive_signals', []))}")


if __name__ == '__main__':
    main()
