import React, { useState } from 'react';

function App() {
    const [formData, setFormData] = useState({
        seller_name: '',
        buyer_name: '',
        item: '',
        price: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:8000/generate/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            alert(`Документ создан: ${data.file_path}`);
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
        }
    };

    return (
        <div>
            <h1>Генерация документа</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="seller_name"
                    placeholder="Продавец"
                    value={formData.seller_name}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="buyer_name"
                    placeholder="Покупатель"
                    value={formData.buyer_name}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="item"
                    placeholder="Предмет"
                    value={formData.item}
                    onChange={handleChange}
                />
                <input
                    type="number"
                    name="price"
                    placeholder="Цена"
                    value={formData.price}
                    onChange={handleChange}
                />
                <button type="submit">Создать документ</button>
            </form>
        </div>
    );
}

export default App;
