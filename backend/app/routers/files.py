from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.core.dependencies import get_current_user
from app.core.config import settings
router=APIRouter(prefix="/api/v1/files",tags=["Files"])
ALLOWED={"application/pdf","image/jpeg","image/png","image/jpg"}
@router.post("/upload")
async def upload(file:UploadFile=File(...),user=Depends(get_current_user)):
    if file.content_type not in ALLOWED: raise HTTPException(400,"Only PDF, JPG and PNG files are allowed")
    content=await file.read()
    if len(content)>settings.max_upload_mb*1024*1024: raise HTTPException(400,f"Maximum file size is {settings.max_upload_mb} MB")
    root=Path(settings.upload_dir); root.mkdir(parents=True,exist_ok=True)
    ext=Path(file.filename or "").suffix.lower()
    name=f"{uuid4().hex}{ext}"; (root/name).write_bytes(content)
    return {"fileName":file.filename,"fileUrl":f"/uploads/{name}","size":len(content),"contentType":file.content_type}
