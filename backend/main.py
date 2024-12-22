from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import List
from supabase import create_client
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import json
from pywebpush import webpush, WebPushException
import asyncio

load_dotenv()

app = FastAPI()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# Load VAPID keys
try:
    with open('vapid_keys.json') as f:
        VAPID_KEYS = json.load(f)
except FileNotFoundError:
    raise Exception("VAPID keys not found. Run generate_vapid_keys.py first")

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

async def send_push_notification(subscription: dict, message_content: str):
    """Send push notification to a single subscription"""
    try:
        webpush(
            subscription_info={
                "endpoint": subscription["endpoint"],
                "keys": {
                    "p256dh": subscription["p256dh"],
                    "auth": subscription["auth"]
                }
            },
            data=json.dumps({
                "title": "New Message",
                "body": message_content
            }),
            vapid_private_key=VAPID_KEYS["private_key"],
            vapid_claims={
                "sub": f"mailto:{os.getenv('VAPID_CLAIM_EMAIL')}"
            }
        )
        return True
    except WebPushException as e:
        print(f"Failed to send notification: {e}")
        if e.response and e.response.status_code == 410:  # Gone - subscription expired
            # Remove expired subscription
            supabase.table("subscriptions").delete().eq("endpoint", subscription["endpoint"]).execute()
        return False

async def send_delayed_notifications(subscriptions: list, message_content: str):
    """Send notifications after a delay"""
    await asyncio.sleep(20)  # Wait for 20 seconds
    
    for subscription in subscriptions:
        try:
            await send_push_notification(
                subscription=subscription,
                message_content=message_content
            )
        except Exception as e:
            print(f"Failed to send to subscription {subscription['endpoint']}: {e}")
            continue

@app.post("/messages/", response_model=Message)
async def create_message(message: MessageCreate):
    try:
        # 1. Save message to database
        result = supabase.table("messages").insert(message.dict()).execute()
        saved_message = result.data[0]

        # 2. Get all subscriptions
        subscriptions_result = supabase.table("subscriptions").select("*").execute()
        
        # 3. Start delayed notification task
        notification_content = f"{message.author}: {message.content}"
        asyncio.create_task(send_delayed_notifications(
            subscriptions=subscriptions_result.data,
            message_content=notification_content
        ))

        return saved_message
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/messages/", response_model=List[Message])
async def get_messages():
    try:
        result = supabase.table("messages").select("*").order('created_at').execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class VapidKeys(BaseModel):
    public_key: str

@app.get("/vapid-public-key/", response_model=VapidKeys)
async def get_vapid_public_key():
    """Endpoint for frontend to get VAPID public key"""
    return {"public_key": VAPID_KEYS['public_key']}

class PushSubscription(BaseModel):
    endpoint: str
    auth: str
    p256dh: str

@app.post("/push-subscriptions/")
async def store_subscription(subscription: PushSubscription):
    """Store push subscription in Supabase"""
    try:
        result = supabase.table("subscriptions").insert({
            "endpoint": subscription.endpoint,
            "auth": subscription.auth,
            "p256dh": subscription.p256dh
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))