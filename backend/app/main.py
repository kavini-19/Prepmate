from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import auth, coding, aptitude, ai, notes, companies, analytics, notifications, resources, admin

# Create all tables & auto-seed
import app.models  # noqa: ensure models are imported
try:
    Base.metadata.create_all(bind=engine)
    try:
        from seed import seed_database
    except ModuleNotFoundError:
        from backend.seed import seed_database
    seed_database()
except Exception as e:
    print(f"Auto-seed warning: {e}")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Placement Preparation Platform API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
API_PREFIX = "/api"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(coding.router, prefix=API_PREFIX)
app.include_router(aptitude.router, prefix=API_PREFIX)
app.include_router(ai.router, prefix=API_PREFIX)
app.include_router(notes.router, prefix=API_PREFIX)
app.include_router(companies.router, prefix=API_PREFIX)
app.include_router(analytics.router, prefix=API_PREFIX)
app.include_router(notifications.router, prefix=API_PREFIX)
app.include_router(resources.router, prefix=API_PREFIX)
app.include_router(admin.router, prefix=API_PREFIX)


@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {"status": "healthy", "version": settings.APP_VERSION, "app": settings.APP_NAME}


@app.api_route("/health", methods=["GET", "HEAD"])
def health_check_root():
    return {"status": "healthy", "version": settings.APP_VERSION, "app": settings.APP_NAME}


@app.api_route("/api/health", methods=["GET", "HEAD"])
def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION, "app": settings.APP_NAME}


@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(status_code=404, content={"detail": "Resource not found"})


# @app.exception_handler(500)
# async def server_error_handler(request, exc):
#     return JSONResponse(status_code=500, content={"detail": "Internal server error"})
