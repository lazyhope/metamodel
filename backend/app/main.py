import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import router as api_router

app = FastAPI()


@app.get("/health")
async def health_check():
    return {"status": "OK"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.rstrip("/")
        for origin in os.getenv("BACKEND_CORS_ORIGINS", "").split(",")
        if origin
    ],
    allow_origin_regex=os.getenv("BACKEND_CORS_ORIGINS_REGEX") or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
