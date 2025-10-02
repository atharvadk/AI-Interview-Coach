from fastapi import FastAPI
from app.routes import feedback

app = FastAPI(title="Interview Coach Backend")

# Register routers
app.include_router(feedback.router)

@app.get("/")
def root():
    return {"message": "Interview Coach Backend is running"}
