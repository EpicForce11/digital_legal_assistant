import React, { useState, useEffect } from 'react';

function App() {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState(null);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [documentUrl, setDocumentUrl] = useState('');
    const [documentId, setDocumentId] = useState(null); // Новый state для ID документа
    const [editedFormData, setEditedFormData] = useState({}); // Для редактирования документа

    // Загружаем шаблоны с сервера
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/templates/');
                if (!response.ok) throw new Error('Не удалось загрузить шаблоны');
                const data = await response.json();
                setTemplates(data);
            } catch (error) {
                setError(error.message);
            }
        };
        fetchTemplates();
    }, []);

    // Обработчик изменения шаблона
    const handleTemplateChange = (e) => {
        const templateId = e.target.value;
        setSelectedTemplate(templateId);
        setFormData({});  // Сбрасываем данные формы при смене шаблона
        setEditedFormData({}); // Сброс данных редактирования при смене шаблона
    };

    // Обработчик изменения данных формы
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Обработчик отправки формы для генерации документа
    const handleSubmit = async (e) => {
        console.log('Отправляемые данные для генерации документа:', formData); // Логируем данные перед отправкой
        e.preventDefault();
        try {
            const response = await fetch(`http://127.0.0.1:8000/generate/${selectedTemplate}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                alert(`Документ создан: ${data.document_id}`);
                setDocumentId(data.document_id); // Сохраняем ID документа
                setDocumentUrl(data.file_path); // Сохраняем путь для скачивания
            } else {
                throw new Error(data.error || 'Ошибка при создании документа');
            }
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
        }
    };

    // Обработчик для добавления нового шаблона
    const handleAddTemplate = async () => {
        if (!newTemplateName) {
            alert('Пожалуйста, введите название шаблона');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/templates/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newTemplateName }),
            });
            if (!response.ok) throw new Error('Не удалось добавить шаблон');
            const newTemplate = await response.json();
            setTemplates([...templates, newTemplate]);
            setNewTemplateName('');
            alert('Шаблон добавлен успешно');
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Функция рендеринга полей формы в зависимости от выбранного шаблона
    const renderFormFields = () => {
        switch (parseInt(selectedTemplate)) {
            case 1: // Шаблон для договора купли-продажи
                return (
                    <>
                        <h3>Договор купли-продажи</h3>
                        <label>
                            Продавец:
                            <input
                                type="text"
                                name="seller_name"
                                value={formData.seller_name || ''}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Покупатель:
                            <input
                                type="text"
                                name="buyer_name"
                                value={formData.buyer_name || ''}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Товар:
                            <input
                                type="text"
                                name="item"
                                value={formData.item || ''}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Цена:
                            <input
                                type="number"
                                name="price"
                                value={formData.price || ''}
                                onChange={handleChange}
                            />
                        </label>
                    </>
                );
            case 2: // Шаблон для договора юридических услуг
                return (
                    <>
                        <h3>Договор юридических услуг</h3>
                        <label>
                            Дата контракта:
                            <input
                                type="text"
                                name="contract_date"
                                value={formData.contract_date || ''}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Юрист:
                            <input
                                type="text"
                                name="lawyer_name"
                                value={formData.lawyer_name || ''}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Клиент:
                            <input
                                type="text"
                                name="client_name"
                                value={formData.client_name || ''}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Серия паспорта клиента:
                            <input
                                type="text"
                                name="client_passport_series"
                                value={formData.client_passport_series || ''}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Номер паспорта клиента:
                            <input
                                type="text"
                                name="client_passport_number"
                                value={formData.client_passport_number || ''}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Кем выдан паспорт:
                            <input
                                type="text"
                                name="client_passport_issued_by"
                                value={formData.client_passport_issued_by || ''}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Дата выдачи паспорта:
                            <input
                                type="text"
                                name="client_passport_issued_date"
                                value={formData.client_passport_issued_date || ''}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Адрес клиента:
                            <input
                                type="text"
                                name="client_address"
                                value={formData.client_address || ''}
                                onChange={handleChange}
                            />
                        </label>
                    </>
                );
            default:
                return null;
        }
    };

    // Функция для скачивания документа
    const handleDownload = async () => {
        if (!documentId) return alert('Документ еще не создан!');
        try {
            const response = await fetch(`http://127.0.0.1:8000/documents/${documentId}`);
            if (!response.ok) throw new Error('Не удалось скачать документ');
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `document_${documentId}.docx`;
            link.click();
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
        }
    };

    // Функция для редактирования документа
    const handleEdit = async () => {
        if (!documentId) return alert('Документ не найден!');
        console.log('Отправляемые данные для редактирования документа:', editedFormData); // Логируем данные перед отправкой
        try {
            const response = await fetch(`http://127.0.0.1:8000/edit-document/${documentId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedFormData),
            });
            const data = await response.json();
            if (response.ok) {
                alert('Документ успешно отредактирован');
                setDocumentUrl(data.file_path); // Обновление пути к документу
            } else {
                throw new Error(data.error || 'Ошибка при редактировании документа');
            }
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

            {/* Выбор шаблона */}
            <label>
                Выберите шаблон:
                <select onChange={handleTemplateChange} value={selectedTemplate || ''}>
                    <option value="">--Выберите--</option>
                    {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                            {template.name}
                        </option>
                    ))}
                </select>
            </label>

            {selectedTemplate && (
                <form onSubmit={handleSubmit}>
                    {renderFormFields()}
                    <button type="submit">Генерировать документ</button>
                </form>
            )}

            {documentUrl && (
                <div style={{ marginTop: '20px' }}>
                    <button onClick={handleDownload}>Скачать документ</button>
                </div>
            )}

            {documentId && (
                <div style={{ marginTop: '20px' }}>
                    <button onClick={handleEdit}>Редактировать документ</button>
                </div>
            )}

            {/* Форма для добавления нового шаблона */}
            <div style={{ marginTop: '20px' }}>
                <h3>Добавить новый шаблон</h3>
                <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="Название нового шаблона"
                />
                <button onClick={handleAddTemplate} disabled={isLoading}>
                    {isLoading ? 'Загрузка...' : 'Добавить шаблон'}
                </button>
            </div>
        </div>
    );
}

export default App;
