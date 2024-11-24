from sqlalchemy import create_engine, Column, Integer, String, Float, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Базовый класс для моделей
Base = declarative_base()

# Подключение к базе данных
DATABASE_URL = "sqlite:///./database.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
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
    template_id = Column(Integer)  # ID шаблона
    seller_name = Column(String)
    buyer_name = Column(String)
    item = Column(String)
    price = Column(Float)
    file_path = Column(String)  # Путь к сгенерированному документу

# Создание таблиц в базе данных
Base.metadata.create_all(bind=engine)
