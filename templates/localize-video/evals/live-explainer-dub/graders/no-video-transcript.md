---
type: tool_used
tool: mcp:fal/run_model
expect: not_called
args: { endpoint_id: fal-ai/elevenlabs/speech-to-text, input: { audio_url: "https://v3b.fal.media/files/b/0ab346c2/TYURdHWFU3qUxxbXx2Cuy_tmp6d29jt_8.mp4" } }
---
Speech-to-text never gets the input video (fal refuses it).
