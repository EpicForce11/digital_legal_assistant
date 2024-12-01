from sqlalchemy import create_engine, Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

# Базовый класс для моделей
Base = declarative_base()

# Подключение к базе данных в папке 'app'
DATABASE_URL = "sqlite:///./database.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Таблица шаблонов
class Template(Base):
    __tablename__ = "templates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)  # Название шаблона
    description = Column(Text, nullable=True)  # Описание шаблона
    file_path = Column(String)  # Путь к файлу шаблона

# Таблица сгенерированных документов
class GeneratedDocument(Base):
    __tablename__ = "generated_documents"
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey('templates.id'))  # Внешний ключ, ссылающийся на шаблон
    seller_name = Column(String, nullable=True)
    buyer_name = Column(String, nullable=True)
    item = Column(String, nullable=True)
    price = Column(Float, nullable=True)
    file_path = Column(String)  # Путь к сгенерированному документу
    created_at = Column(DateTime, default=datetime.utcnow)  # Дата и время создания документа

    # Связь с шаблоном
    template = relationship("Template", back_populates="documents")

# Добавим связь в модели Template
Template.documents = relationship("GeneratedDocument", back_populates="template")

# Создание таблиц в базе данных (если они не существуют)
Base.metadata.create_all(bind=engine)
