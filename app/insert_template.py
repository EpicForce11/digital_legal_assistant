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

# Пример скрипта для удаления шаблона
def delete_template(template_id=None, name=None):
    if not template_id and not name:
        raise ValueError("Необходимо указать либо template_id, либо name")
    
    db = SessionLocal()
    try:
        # Находим шаблон по ID или имени
        query = db.query(Template)
        if template_id:
            template = query.filter(Template.id == template_id).first()
        elif name:
            template = query.filter(Template.name == name).first()
        
        if not template:
            print(f"Шаблон с {'ID ' + str(template_id) if template_id else 'именем ' + name} не найден")
            return
        
        # Удаляем файл шаблона с диска
        if os.path.exists(template.file_path):
            os.remove(template.file_path)
            print(f"Файл шаблона '{template.file_path}' успешно удален")
        
        # Удаляем запись из базы данных
        db.delete(template)
        db.commit()
        print(f"Шаблон с ID {template.id} успешно удален")
    except Exception as e:
        db.rollback()
        print(f"Ошибка при удалении шаблона: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # Добавление шаблона
    insert_template(
        name="Договор купли-продажи-1",
        description="Шаблон для договора купли-продажи",
        file_name="BuySellContract.docx"  # Файл должен быть в папке templates
    )
    
    # Удаление шаблона по ID
    delete_template(template_id=2)
    
    # Удаление шаблона по имени
    delete_template(name="Договор купли-продажи-1")