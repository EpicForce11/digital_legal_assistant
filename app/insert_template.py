# --- Регистрация шаблона в базе данных ---
import os
from models import SessionLocal, Template

# Определяем путь к папке app
APP_DIR = os.path.dirname(os.path.abspath(__file__))

# Путь к папке templates
TEMPLATES_DIR = os.path.join(APP_DIR, "templates")

# Убедимся, что папка существует
os.makedirs(TEMPLATES_DIR, exist_ok=True)

# Пример скрипта для добавления шаблона
def insert_template(name, description, file_name):
    # Путь к файлу шаблона
    file_path = os.path.join(TEMPLATES_DIR, file_name)
    
    # Убедимся, что файл существует
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Шаблон {file_name} не найден в {TEMPLATES_DIR}")
    
    # Добавляем шаблон в базу данных
    db = SessionLocal()
    try:
        new_template = Template(name=name, description=description, file_path=file_path)
        db.add(new_template)
        db.commit()
        db.refresh(new_template)
        print(f"Шаблон '{name}' успешно добавлен с ID {new_template.id}")
    except Exception as e:
        db.rollback()  # На случай, если добавление завершилось сбоем
        print(f"Ошибка при добавлении шаблона: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # Укажите имя шаблона, описание и имя файла
    insert_template(
        name="Договор купли-продажи-1",
        description="Шаблон для договора купли-продажи",
        file_name="BuySellContract.docx"  # Файл должен быть в папке templates
    )