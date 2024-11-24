from fastapi import FastAPI
from pydantic import BaseModel
from docx import Document
from pydantic import Field
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Простая форма
class DocumentData(BaseModel):
    seller_name: str
    buyer_name: str
    item: str
    price: float = Field(gt=0, description="Цена должна быть больше 0")

@app.post("/generate/")
async def generate_document(data: DocumentData):
    file_name = "generated_document.docx"
    doc = Document()
    doc.add_heading("Договор купли-продажи", level=1)
    doc.add_paragraph(f"Продавец: {data.seller_name}")
    doc.add_paragraph(f"Покупатель: {data.buyer_name}")
    doc.add_paragraph(f"Предмет: {data.item}")
    doc.add_paragraph(f"Цена: {data.price} руб.")
    doc.save(file_name)
    return FileResponse(file_name, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", filename=file_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Разрешить доступ для React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)