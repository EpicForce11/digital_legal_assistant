import React, { useState, useEffect } from 'react';

function App() {
    const [templates, setTemplates] = useState([]);  // Массив для шаблонов
    const [selectedTemplate, setSelectedTemplate] = useState(null);  // Выбранный шаблон
    const [formData, setFormData] = useState({});  // Данные формы
    const [templateName, setTemplateName] = useState("");  // Название шаблона
    const [templateDescription, setTemplateDescription] = useState("");  // Описание шаблона
    const [file, setFile] = useState(null);  // Файл шаблона
    const [documentId, setDocumentId] = useState(null);  // ID сгенерированного документа

    // Загружаем шаблоны с сервера
    useEffect(() => {
        const fetchTemplates = async () => {
            const response = await fetch('http://127.0.0.1:8000/templates/');
            const data = await response.json();
            setTemplates(data);  // Сохраняем шаблоны в состояние
        };
        fetchTemplates();
    }, []);

    // Обработка изменения выбранного шаблона
    const handleTemplateChange = (e) => {
        const templateId = e.target.value;
        setSelectedTemplate(templateId);
        setFormData({});  // Сбрасываем данные формы при смене шаблона
    };

    // Обработка изменений в полях формы
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Обработка отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Добавляем selectedTemplate в formData перед отправкой
        const dataToSend = { 
            ...formData, 
            template_id: selectedTemplate  // Добавляем template_id из состояния
        };

        try {
            const response = await fetch(`http://127.0.0.1:8000/generate/${selectedTemplate}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),  // Отправляем данные с template_id
            });
            const data = await response.json();
            setDocumentId(data.document_id);  // Сохраняем ID документа
            alert(`Документ создан: ${data.document_id}`);
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    // Обработка отправки формы для загрузки шаблона
    const handleTemplateUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', templateName);
        formData.append('description', templateDescription);

        try {
            const response = await fetch('http://127.0.0.1:8000/upload-template/', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            alert(`Шаблон загружен с ID: ${data.template_id}`);
            setTemplateName("");  // Очищаем поле
            setTemplateDescription("");  // Очищаем описание
            setFile(null);  // Очищаем файл
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    // Динамическое создание полей формы в зависимости от выбранного шаблона
    const renderFormFields = () => {
        if (!selectedTemplate) return null;  // Если шаблон не выбран, не рендерим форму
        
        const template = templates.find(t => t.id === parseInt(selectedTemplate));  // Находим шаблон по ID
        if (!template) return null;

        switch (template.name) {
            case "BuySellContract":
                return (
                    <div>
                        <label>
                            Продавец:
                            <input type="text" name="seller_name" onChange={handleChange} />
                        </label>
                        <label>
                            Покупатель:
                            <input type="text" name="buyer_name" onChange={handleChange} />
                        </label>
                        <label>
                            Товар:
                            <input type="text" name="item" onChange={handleChange} />
                        </label>
                        <label>
                            Цена:
                            <input type="number" name="price" onChange={handleChange} />
                        </label>
                    </div>
                );
            case "LegalServicesContract":
                return (
                    <div>
                        <label>
                            Дата контракта:
                            <input type="text" name="contract_date" onChange={handleChange} />
                        </label>
                        <label>
                            Юрист:
                            <input type="text" name="lawyer_name" onChange={handleChange} />
                        </label>
                        <label>
                            Клиент:
                            <input type="text" name="client_name" onChange={handleChange} />
                        </label>
                        <label>
                            Серия паспорта клиента:
                            <input type="text" name="client_passport_series" onChange={handleChange} />
                        </label>
                        <label>
                            Номер паспорта клиента:
                            <input type="text" name="client_passport_number" onChange={handleChange} />
                        </label>
                        <label>
                            Кем выдан паспорт:
                            <input type="text" name="client_passport_issued_by" onChange={handleChange} />
                        </label>
                        <label>
                            Дата выдачи паспорта:
                            <input type="text" name="client_passport_issued_date" onChange={handleChange} />
                        </label>
                        <label>
                            Адрес клиента:
                            <input type="text" name="client_address" onChange={handleChange} />
                        </label>
                    </div>
                );
            default:
                return null;
        }
    };

    // Функция для скачивания документа
    const handleDownload = () => {
        if (documentId) {
            const downloadUrl = `http://127.0.0.1:8000/documents/${documentId}`;
            window.location.href = downloadUrl;  // Инициализация скачивания
        } else {
            alert("Документ не найден!");
        }
    };

    return (
        <div>
            <h1>Генератор документов</h1>

            <h2>Загрузить шаблон</h2>
            <form onSubmit={handleTemplateUpload}>
                <label>
                    Название шаблона:
                    <input type="text" value={templateName} onChange={e => setTemplateName(e.target.value)} required />
                </label>
                <label>
                    Описание шаблона:
                    <input type="text" value={templateDescription} onChange={e => setTemplateDescription(e.target.value)} />
                </label>
                <label>
                    Файл шаблона (.docx):
                    <input type="file" onChange={e => setFile(e.target.files[0])} required />
                </label>
                <button type="submit">Загрузить</button>
            </form>

            <h2>Выберите шаблон</h2>
            <label>
                Выберите шаблон:
                <select onChange={handleTemplateChange}>
                    <option value="">--Выберите--</option>
                    {templates.map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                </select>
            </label>

            {selectedTemplate && (
                <form onSubmit={handleSubmit}>
                    {renderFormFields()}
                    <button type="submit">Генерировать документ</button>
                </form>
            )}

            {/* Кнопка для скачивания документа */}
            {documentId && (
                <div>
                    <button onClick={handleDownload}>Скачать документ</button>
                </div>
            )}
        </div>
    );
}

export default App;
