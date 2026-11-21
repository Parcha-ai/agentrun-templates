---
type: tool_used
tool: mcp:fal/submit_job
at_least: 1
args: { endpoint_id: fal-ai/elevenlabs/tts/eleven-v3, input: { voice: Aria, output_format: mp3_44100_128, timestamps: true } }
---
The voiceover in the voice asked for, at a constant 128 kbit/s and with timestamps (a second one only when the first ran longer than the cut holds; the pipeline grader checks that).
