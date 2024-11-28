# --- Регистрация шаблона в базе данных ---
from models import SessionLocal, Template

# Подключаемся к базе данных
db = SessionLocal()

# Добавляем шаблон в базу
new_template = Template(
    name="Договор купли-продажи",
    description="Шаблон договора купли-продажи",
    file_path="templates/BuySellContract.docx"
)
db.add(new_template)
db.commit()
db.refresh(new_template)

print(f"Шаблон добавлен в базу с ID: {new_template.id}")
db.close()
