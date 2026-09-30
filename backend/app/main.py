# from pathlib import Path
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# from app.core.config import settings
# from app.core.database import Base, engine, SessionLocal
# from app.services.seed import seed
# from app.routers import auth, users, resources, payments, files

# Base.metadata.create_all(bind=engine)
# with SessionLocal() as db:
#     seed(db)

# app=FastAPI(title=settings.app_name,version="1.0.0",docs_url="/docs",redoc_url="/redoc")
# # app.add_middleware(CORSMiddleware,allow_origins=settings.cors_list or ["*"],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.cors_list or ["*"],
#     allow_origin_regex=(
#         r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"
#     ),
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
# Path(settings.upload_dir).mkdir(parents=True,exist_ok=True)
# if settings.scheduler_enabled:
#     from app.tasks.scheduler import start_scheduler
#     scheduler = start_scheduler()

# app.mount("/uploads",StaticFiles(directory=settings.upload_dir),name="uploads")
# app.include_router(auth.router)
# app.include_router(users.router)
# app.include_router(resources.router)
# app.include_router(payments.router)
# app.include_router(files.router)

# @app.get("/health")
# def health():
#     return {"status":"ok","service":"FleetDoc API"}

# @app.get("/")
# def root():
#     return {"name":"FleetDoc API","docs":"/docs"}





from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.services.seed import seed
from app.routers import auth, users, resources, payments, files, backup

Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    seed(db)

app=FastAPI(title=settings.app_name,version="1.0.0",docs_url="/docs",redoc_url="/redoc")
# app.add_middleware(CORSMiddleware,allow_origins=settings.cors_list or ["*"],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list or ["*"],
    allow_origin_regex=(
        r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Path(settings.upload_dir).mkdir(parents=True,exist_ok=True)
if settings.scheduler_enabled:
    from app.tasks.scheduler import start_scheduler
    scheduler = start_scheduler()

app.mount("/uploads",StaticFiles(directory=settings.upload_dir),name="uploads")
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(resources.router)
app.include_router(payments.router)
app.include_router(files.router)
app.include_router(backup.router)

@app.get("/health")
def health():
    return {"status":"ok","service":"FleetDoc API"}

@app.get("/")
def root():
    return {"name":"FleetDoc API","docs":"/docs"}
