from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from docx import Document
from models import SessionLocal, Template, GeneratedDocument
import os

# Путь к папке app
APP_DIR = os.path.dirname(os.path.abspath(__file__))

# Путь к папке templates
TEMPLATES_DIR = os.path.join(APP_DIR, "templates")

# Путь к папке documents
DOCUMENTS_DIR = os.path.join(APP_DIR, "documents")

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
    description: str | None = None


# --- Маршруты для управления шаблонами ---
@app.post("/templates/")
async def upload_template(
    file: UploadFile = File(...),
    template_data: TemplateData = Depends(),
    db: Session = Depends(get_db),
):
    file_path = os.path.join(TEMPLATES_DIR, file.filename)  # Путь к файлу внутри templates
    with open(file_path, "wb") as f:
        f.write(await file.read())

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
    # Абсолютный путь к документу
    file_name = os.path.join(DOCUMENTS_DIR, "generated_document.docx")
    
    # Генерация документа
    doc = Document()
    doc.add_heading("Договор купли-продажи", level=1)
    doc.add_paragraph(f"Продавец: {data.seller_name}")
    doc.add_paragraph(f"Покупатель: {data.buyer_name}")
    doc.add_paragraph(f"Предмет: {data.item}")
    doc.add_paragraph(f"Цена: {data.price} руб.")
    doc.save(file_name)

    # Сохранение документа в базе данных
    new_document = GeneratedDocument(
        template_id=1,  # Используем ID шаблона по умолчанию
        seller_name=data.seller_name,
        buyer_name=data.buyer_name,
        item=data.item,
        price=data.price,
        file_path=file_name,
    )
    db.add(new_document)
    db.commit()
    db.refresh(new_document)

    return {"message": "Документ сохранен", "document_id": new_document.id}


# --- Маршрут для скачивания документа ---
@app.get("documents/{document_id}")
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
