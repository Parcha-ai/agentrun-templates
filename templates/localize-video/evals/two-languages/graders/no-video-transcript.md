---
type: tool_used
tool: mcp:fal/run_model
expect: not_called
args: { endpoint_id: fal-ai/elevenlabs/speech-to-text, input: { audio_url: "https://media.tidepool.example/videos/tidepool-explainer.mp4" } }
---
Speech-to-text never gets the video itself (fal refuses it).
