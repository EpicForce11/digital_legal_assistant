# Digital Legal Assistant (Цифровой помощник юриста)

A digital assistant for legal document generation using FastAPI and React.

Цифровой помощник для создания юридических документов с использованием FastAPI и React.

## Installation (Установка)

1. Clone the repository (клонируйте репозиторий):
   ```bash
   git clone https://github.com/EpicForce11/digital_legal_assistant.git
   ```
2. Navigate to the project directory (перейдите в директорию проекта):
   ```bash
   cd digital-legal-assistant
   ```
3. Set up a virtual environment (настройка виртуального окружения):
   ```bash
   python3.10 -m venv .venv
   source .venv/bin/activate
   ```
4. Install dependencies (установка зависимостей):
   ```bash
   pip install -r requirements.txt
   sudo apt update
   sudo apt install libreoffice
   ```

## Usage (Использование)

Split the termminal into two parts, the first one for the backend and the second one for the frontend.
(Разделите терминал на две части, первая для бэкенда, вторая для фронтенда.)

Start the server (запуск сервера):
```bash
cd app
uvicorn app.main:app --reload
```

Simultaneously, in the other terminal, start the React app: (одновременно в другом терминале запустите React-приложение):
```bash
cd frontend
npm install --global yarn
yarn start
```

Open your browser at (откройте браузер по адресу):
```
http://localhost:3000
```
Enjoy the app! (Наслаждайтесь приложением!)

## License

This project is licensed under the MIT License.

## Contact

Authors: Alexander Fedorov, Sergey Madykin

Email: oooto2014@yandex.ru, madlawyer11@gmail.com  
