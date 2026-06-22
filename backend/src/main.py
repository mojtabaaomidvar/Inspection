from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import clients, contracts, tariffs

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inspection Platform API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(clients.router, prefix="/api/clients", tags=["clients"])
app.include_router(contracts.router, prefix="/api/contracts", tags=["contracts"])
app.include_router(tariffs.router, prefix="/api/tariffs", tags=["tariffs"])

@app.get("/api/health")
def health_check():
    return {"status": "OK", "message": "Backend is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)