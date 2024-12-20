from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import List
from supabase import create_client
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow your frontend URL
    allow_credentials=True,  # Allow cookies to be sent with requests (if needed)
    allow_methods=["*"],  # Allow all HTTP methods (e.g., GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Allow all headers (e.g., Authorization, Content-Type)
)


class MessageCreate(BaseModel):
    content: str
    author: str

class Message(MessageCreate):
    id: str
    created_at: datetime

@app.post("/messages/", response_model=Message)
async def create_message(message: MessageCreate):
    try:
        result = supabase.table("messages").insert(message.dict()).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/messages/", response_model=List[Message])
async def get_messages():
    try:
        result = supabase.table("messages").select("*").order('created_at').execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))