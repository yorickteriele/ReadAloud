from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import torch, torchaudio as ta, io, os, sys, logging, traceback
from chatterbox.tts import ChatterboxTTS
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

# --- Setup ---
app = FastAPI(title="Chatterbox TTS API (CPU Only)")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s", stream=sys.stdout)
log = logging.getLogger(__name__)

device = "cpu"
REFERENCE_FOLDER = "/app/audio_prompts"
_single, _multi = None, None

# --- Model loading ---
def load_single():
    global _single
    if not _single:
        _single = ChatterboxTTS.from_pretrained(device=device)
    return _single

def load_multi():
    global _multi
    if not _multi:
        orig_load = torch.load
        def safe_load(f, *a, **kw):
            if 'map_location' not in kw:
                kw['map_location'] = 'cpu'
            return orig_load(f, *a, **kw)
        torch.load = safe_load
        _multi = ChatterboxMultilingualTTS.from_pretrained(device=device)
        torch.load = orig_load
    return _multi

# --- Models ---
class TTSRequest(BaseModel):
    text: str
    language_id: str = "en"
    audio_prompt_filename: str | None = None
    exaggeration: float = 0.5
    cfg: float = 0.7
    temperature: float = 0.6

@app.on_event("startup")
async def startup():
    os.makedirs(os.path.expanduser("~/.cache/chatterbox"), exist_ok=True)
    log.info("Using CPU mode only")

@app.get("/health")
async def health(): 
    return {"status": "ok", "device": "cpu"}

@app.post("/speech")
async def speech(req: TTSRequest):
    log.info(f"Received TTS request: {req.json()}")
    if not req.text:
        raise HTTPException(400, "Text cannot be empty")

    model = load_multi() if req.language_id != "en" else load_single()
    prompt = os.path.join(REFERENCE_FOLDER, req.audio_prompt_filename) if req.audio_prompt_filename else None
    if prompt and not os.path.isfile(prompt):
        raise HTTPException(404, "Audio prompt file not found")

    try:
        args = dict(text=req.text, audio_prompt_path=prompt, exaggeration=req.exaggeration, temperature=req.temperature)
        if req.language_id != "en":
            args["language_id"] = req.language_id
        wav = model.generate(**args)

        buf = io.BytesIO()
        ta.save(buf, wav, model.sr, format="wav")
        buf.seek(0)
        return StreamingResponse(buf, media_type="audio/wav")

    except Exception as e:
        log.error(traceback.format_exc())
        raise HTTPException(500, f"Error generating speech: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
