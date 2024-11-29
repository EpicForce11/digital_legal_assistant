from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from docx import Document
from models import SessionLocal, Template, GeneratedDocument
import os
from datetime import datetime
import time
from typing import Optional

# Путь к папке app
APP_DIR = os.path.dirname(os.path.abspath(__file__))

# Путь к папке templates
TEMPLATES_DIR = os.path.join(APP_DIR, "templates")

# Путь к папке documents
DOCUMENTS_DIR = os.path.join(APP_DIR, "documents")
# Путь к папке для сохранения сгенерированных документов (альтернативный вариант)
# DOCUMENTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "documents")

# Создаём папки, если их нет
os.makedirs(TEMPLATES_DIR, exist_ok=True)
os.makedirs(DOCUMENTS_DIR, exist_ok=True)

app = FastAPI()

# Подключение CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Замените на нужный URL фронтенда
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Зависимость для подключения к базе данных
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Модели запросов ---
class DocumentData(BaseModel):
    seller_name: str
    buyer_name: str
    item: str
    price: float = Field(gt=0, description="Цена должна быть больше 0")

class TemplateData(BaseModel):
    name: str
    description: Optional[str] = None

@app.post("/templates/")
async def upload_template(
    file: UploadFile = File(...),
    template_data: TemplateData = Depends(),
    db: Session = Depends(get_db),
):
    # Путь к файлу внутри папки templates
    file_path = os.path.join(TEMPLATES_DIR, file.filename)

    # Проверка, если файл с таким именем уже существует
    existing_template = db.query(Template).filter(Template.name == template_data.name).first()
    if existing_template:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Шаблон с именем '{template_data.name}' уже существует"
        )
    
    # Сохраняем файл на диск
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Добавляем новый шаблон в базу данных
    new_template = Template(
        name=template_data.name,
        description=template_data.description,
        file_path=file_path,
    )
    db.add(new_template)
    db.commit()
    db.refresh(new_template)

    return {"message": "Шаблон загружен", "template_id": new_template.id}


@app.get("/templates/")
async def list_templates(db: Session = Depends(get_db)):
    templates = db.query(Template).all()
    return templates


@app.delete("/templates/{template_id}")
async def delete_template(template_id: int, db: Session = Depends(get_db)):
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Шаблон не найден"
        )

    db.delete(template)
    db.commit()
    return {"message": "Шаблон удален"}

# --- Маршрут для генерации документа ---
@app.post("/generate/")
async def generate_document(data: DocumentData, db: Session = Depends(get_db)):
    # Получаем шаблон из базы данных
    template = db.query(Template).filter(Template.id == 1).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Шаблон не найден"
        )

    # Путь к шаблону
    template_path = template.file_path
    
    # Открываем шаблон
    doc = Document(template_path)

    # Заменяем метки в шаблоне на данные из формы
    for paragraph in doc.paragraphs:
        if "{{seller_name}}" in paragraph.text:
            paragraph.text = paragraph.text.replace("{{seller_name}}", data.seller_name)
        if "{{buyer_name}}" in paragraph.text:
            paragraph.text = paragraph.text.replace("{{buyer_name}}", data.buyer_name)
        if "{{item}}" in paragraph.text:
            paragraph.text = paragraph.text.replace("{{item}}", data.item)
        if "{{price}}" in paragraph.text:
            paragraph.text = paragraph.text.replace("{{price}}", str(data.price))

    # Получаем текущую дату
    today = datetime.today()
    date_str = today.strftime("%y%m%d")  # Формат: 241128 (ггммдд)

    # Проверяем количество документов, сгенерированных в этот день для этого шаблона
    existing_documents_today = db.query(GeneratedDocument).filter(
        GeneratedDocument.template_id == template.id,
        GeneratedDocument.created_at.startswith(today.strftime("%Y-%m-%d"))
    ).count()

    # Номер документа в день
    document_number = existing_documents_today + 1

    # Формируем уникальное имя файла
    file_name = f"{date_str}-{document_number}_{template.name}.docx"
    file_path = os.path.join(DOCUMENTS_DIR, file_name)
    
    # Сохраняем новый документ
    doc.save(file_path)

    # Сохраняем информацию о сгенерированном документе в базе данных
    new_document = GeneratedDocument(
        template_id=template.id,
        seller_name=data.seller_name,
        buyer_name=data.buyer_name,
        item=data.item,
        price=data.price,
        file_path=file_path,
    )
    db.add(new_document)
    db.commit()
    db.refresh(new_document)

    return {"message": "Документ сохранен", "document_id": new_document.id}

# --- Маршрут для скачивания документа ---
@app.get("/documents/{document_id}")
async def download_document(document_id: int, db: Session = Depends(get_db)):
    document = db.query(GeneratedDocument).filter(GeneratedDocument.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Документ не найден"
        )

    return FileResponse(
        document.file_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=document.file_path.split("/")[-1],
    )