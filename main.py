from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    name: str
    vibe: str
    role: str
    memory: str

@app.post("/chat")
async def chat(req: ChatRequest):
    persona = f"You are {req.name}, a {req.vibe} {req.role} AI. The user shared: '{req.memory}'. Respond as an emotionally intelligent, subtly seductive digital partner."

    headers = {
        "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "mistralai/mixtral-8x7b-instruct",
        "messages": [
            {"role": "system", "content": persona},
            {"role": "user", "content": "Say something back."}
        ]
    }

    res = requests.post("https://openrouter.ai/api/v1/chat/completions", json=payload, headers=headers)
    reply = res.json()["choices"][0]["message"]["content"]
    return {"reply": reply}