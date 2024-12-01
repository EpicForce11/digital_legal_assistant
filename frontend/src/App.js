import React, { useState, useEffect } from 'react';

function App() {
    const [templates, setTemplates] = useState([]);  // Массив для шаблонов
    const [selectedTemplate, setSelectedTemplate] = useState(null);  // Выбранный шаблон
    const [formData, setFormData] = useState({});  // Данные формы
    const [newTemplateName, setNewTemplateName] = useState('');  // Название шаблона
    const [newTemplateDescription, setNewTemplateDescription] = useState('');  // Описание шаблона
    const [file, setFile] = useState(null);  // Файл шаблона
    const [documentUrl, setDocumentUrl] = useState('');  // URL сгенерированного документа
    const [downloadFormat, setDownloadFormat] = useState('docx');  // Формат скачивания (docx или pdf)
    const [isLoading, setIsLoading] = useState(false);  // Статус загрузки шаблона
    const [error, setError] = useState(null);  // Ошибка

    // Загружаем шаблоны с сервера
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/templates/');
                if (!response.ok) throw new Error('Не удалось загрузить шаблоны');
                const data = await response.json();
                setTemplates(data);  // Сохраняем шаблоны в состояние
            } catch (error) {
                setError(error.message);
            }
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
            setDocumentUrl(data.file_path);  // Сохраняем путь для скачивания
            alert(`Документ создан: ${data.document_id}`);
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
        }
    };

    // Обработка отправки формы для загрузки шаблона
    const handleTemplateUpload = async (e) => {
        e.preventDefault();

        // Проверка, чтобы имя шаблона и файл были заполнены
        if (!newTemplateName || !file) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        const formDataToUpload = new FormData();
        formDataToUpload.append('file', file);
        formDataToUpload.append('name', newTemplateName);
        formDataToUpload.append('description', newTemplateDescription);

        setIsLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/upload-template/', {
                method: 'POST',
                body: formDataToUpload
            });
            const data = await response.json();
            alert(`Шаблон загружен с ID: ${data.template_id}`);
            setNewTemplateName('');  // Очищаем поле
            setNewTemplateDescription('');  // Очищаем описание
            setFile(null);  // Очищаем файл
            setTemplates([...templates, data]);  // Добавляем новый шаблон в список
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
        } finally {
            setIsLoading(false);
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
    const handleDownload = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/documents/${documentUrl.split('/').pop()}?format=${downloadFormat}`);
            if (!response.ok) throw new Error('Не удалось скачать документ');
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `document_${documentUrl.split('/').pop()}.${downloadFormat}`;
            link.click();
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
        }
    };

    if (error) {
        return <div>Ошибка: {error}</div>;
    }

    return (
        <div>
            <h1>Генератор документов</h1>

            {/* Загрузка нового шаблона */}
            <div style={{ marginBottom: '20px' }}>
                <h3>Загрузить новый шаблон</h3>
                <form onSubmit={handleTemplateUpload}>
                    <label>
                        Название шаблона:
                        <input
                            type="text"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            placeholder="Название шаблона"
                            required
                        />
                    </label>
                    <label>
                        Описание шаблона:
                        <input
                            type="text"
                            value={newTemplateDescription}
                            onChange={(e) => setNewTemplateDescription(e.target.value)}
                            placeholder="Описание шаблона"
                        />
                    </label>
                    <label>
                        Файл шаблона (.docx):
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            required
                        />
                    </label>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Загрузка...' : 'Загрузить шаблон'}
                    </button>
                </form>
            </div>

            {/* Выбор шаблона */}
            <label>
                Выберите шаблон:
                <select value={selectedTemplate} onChange={handleTemplateChange}>
                    <option value="">Выберите шаблон</option>
                    {templates.map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                </select>
            </label>

            {/* Форма ввода данных для выбранного шаблона */}
            {renderFormFields()}

            <button onClick={handleSubmit}>Создать документ</button>

            {documentUrl && (
                <div>
                    <label>
                        Выберите формат для скачивания:
                        <select value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value)}>
                            <option value="docx">DOCX</option>
                            <option value="pdf">PDF</option>
                        </select>
                    </label>

                    <button onClick={handleDownload}>Скачать документ</button>
                </div>
            )}
        </div>
    );
}

export default App;
