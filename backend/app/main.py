from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.incidents import router as incidents_router
from backend.app.api.detections import router as detections_router


app = FastAPI(title="SAGARDRISHTI API") 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://sagardrishti-uxji.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "SAGARDRISHTI backend is running"}


app.include_router(incidents_router)
app.include_router(detections_router)