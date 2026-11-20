---
name: fal-audio
description: Make speech, music and transcripts with fal.ai through its MCP server (the `fal` server, tools named mcp:fal/<tool>). Covers picking a voice, music or speech-to-text model, writing a script ElevenLabs v3 reads well (audio tags, pacing, voice settings), running a job without paying twice, saving the audio into the run's files, and the errors fal returns. Use whenever a task asks for narration, a voiceover, a spoken summary, background music, or a transcript of a recording.
---

# Making audio with fal

fal serves text-to-speech, music and speech-to-text models behind the same queue as its image models. You reach it
through the `fal` MCP server, which holds the owner's fal key: you never see it and never ask for it. Every generation
bills the owner's fal account.

The calls are the same as for images: `get_pricing` and `get_model_schema` cost nothing; `run_model` and
`submit_job` bill; `wait_for_jobs` (a job's outcome and result, by its handles) and `get_submission` (a lost reply,
by its key) follow a job without billing again.

**A second `run_model` or `submit_job` is a second bill**, unless it carries the same `submission_key` and the exact
same request, which recovers the first job. Make one random `submission_key` per generation (a UUID works), send it
with the paid call and keep it for every retry. When `run_model` answers `processing`, never call it again: read the
job with `wait_for_jobs` `{"jobs": [{"index": 0, "endpoint_id", "request_id", "status_url", "response_url"}]}`,
waiting the `poll_after_seconds` it gives between reads; the completed result comes in its answer. After a timeout or a
lost reply, call `get_submission` with the same key before anything else. `not_found` or `submission_unknown` never
authorizes a new paid generation: say so and stop.

## The steps

1. **Pick the endpoint** (the template's pin, when there is one; else the catalog below) and call `get_pricing`.
   Speech bills by characters, music by seconds, transcription by audio minutes.
2. **Read its schema** with `get_model_schema`. Voice fields differ between models (`voice`, `voice_id`,
   `language_code`). Never guess a field or a voice name: take one the schema lists.
3. **Write the script** (speech) or the brief (music), as below. Check its length before you send it: price grows
   with it.
4. **Run it** with `run_model`. Speech under a minute usually completes inside the wait; music often answers
   `processing`.
5. **Save the audio** with `web_save` (`url`, `path`) under `media/`, named for what it is: `media/narration.mp3`,
   `media/bed-30s.mp3`. The extension follows the answer's `content_type` (`audio/mpeg` → mp3, `audio/wav` → wav).
   fal's URLs expire, so a link alone is not a deliverable.
6. **Answer** with the saved path, the endpoint, the voice, the price and the exact text you sent.

The result comes back as `{"audio": {"url", "content_type", "file_size"}}` for speech and music, and `{"text",
"chunks": [{"text", "timestamp": [start, end]}]}` for a transcript. Read the actual answer; don't assume the shape.

## Model catalog (each id checked against fal's API on 2026-11-20; confirm with `get_pricing` and `search_models`)

### Text to speech
| endpoint | use it for |
|---|---|
| `fal-ai/elevenlabs/tts/eleven-v3` | the most natural English narration; reads audio tags (below) |
| `fal-ai/elevenlabs/tts/turbo-v2.5` | fast and cheap; plain reading, no audio tags |
| `fal-ai/minimax/speech-2.6-turbo` | fast, good quality, many voices; a fallback |
| `fal-ai/minimax/speech-2.6-hd` | MiniMax's best quality, slower |
| `fal-ai/chatterbox/text-to-speech/multilingual` | non-English speech, 20+ languages |

### Music
| endpoint | use it for |
|---|---|
| `fal-ai/elevenlabs/music` | songs and instrumentals from a description |
| `fal-ai/minimax-music/v2` | full tracks, highest quality |
| `fal-ai/lyria2` | instrumentals |
| `fal-ai/ace-step` | short stingers and beds |

Keep music at 60 s or less: longer requests often time out in the queue.

### Speech to text
| endpoint | use it for |
|---|---|
| `fal-ai/whisper` | one speaker, 99 languages, segment timestamps |
| `fal-ai/elevenlabs/speech-to-text` | several speakers: who said what |

A transcript needs the audio at a public URL. An input the person gave as a file goes up with `upload_file` first.

## Writing for ElevenLabs v3

v3 reads inline `[tags]` as direction, not text. Use them where a person would actually change delivery; a few per
paragraph, never one per sentence.

- **Emotion:** `[excited]` `[calm]` `[curious]` `[serious]` `[warm]` `[sad]` `[frustrated]`
- **Reactions:** `[laughs]` `[sighs]` `[exhales]` `[clears throat]`
- **Delivery:** `[whispers]` `[softly]` `[cheerfully]` `[flatly]` `[deadpan]` `[playfully]` `[sarcastic]`
- **Pacing:** `[pauses]` `[hesitates]` `[rushed]` `[drawn out]`; an ellipsis (`...`) is a short hesitant pause, a dash
  (`—`) a shorter one.

Write for the ear:

- Short sentences. One idea each. Vary the length: short for weight, longer to explain.
- Spell out what is read aloud: "twenty twenty-six", "three point five percent", "A-P-I" or "the A P I".
- No headings, bullets, links, emoji or markdown: they are read out or dropped. Turn a list into a sentence.
- Start with the point. A listener can't skim back.
- About 150 words is a minute of speech.

On fal, `fal-ai/elevenlabs/tts/eleven-v3` takes `text`, `voice` (a voice name; the default is `Rachel`),
`stability` (default 0.5) and `language_code`, and answers mp3. `stability` 0.35 to 0.5 sounds alive (lower is more
expressive, less steady); 0.6 to 0.8 suits calm narration. Other models name more settings (`similarity_boost`,
`style`, `speed`): set them only when the schema lists them.

Example, a 20-second product note:

```
[warm] Here's what changed this week. [pauses] Exports are faster: a report that took a minute now takes about ten
seconds. [curious] And the part people asked for most... you can finally schedule them. [cheerfully] Pick a day, pick
a time, and it lands in your inbox.
```

## Errors

| fal answers | do this |
|---|---|
| 422 with a field name | the input is wrong (not billed): read the schema, fix that field, then run once with a new key |
| 422 or 400 naming content or safety | rewrite the text; don't send the same text again |
| 429 | wait 30 s, then `get_submission` with the key before you run anything new |
| a job `FAILED` | read its error in the `wait_for_jobs` answer; fix the input once (a new key), or stop and say why |
| a job still pending after 10 min | stop waiting; give its request id and say it may still finish |
| "audio format not supported" (speech to text) | the input must be mp3, wav, m4a or ogg at a public URL |

## Never

- Never send the person's private data (names, accounts, anything they marked private) in a script unless the task is
  to read exactly that text aloud.
- Never clone or imitate a real person's voice, and never pick a voice by a celebrity's name.
- Never present generated music as licensed for commercial use: say the model's license governs it.
- Never put the fal key, a request header or a signed URL in your answer.
