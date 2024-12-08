// Появление карточек при нажатии загрузить ещё
document.getElementById('load_more').addEventListener('click', function() {
    // Найти скрытые элементы и показать их
    const hiddenItems = document.querySelectorAll('.hidden-block');
    hiddenItems.forEach(item => item.classList.remove('hidden-block'));

    // Скрыть кнопку
    this.style.display = 'none';

    // Убрать текст из <p>
    const paragraph = document.querySelector('.download-more p');
    if (paragraph) {
        paragraph.textContent = ''; // Очищает текст
    }
});



function togglePopup() {
    const popup = document.getElementById('logout-popup');
    if (popup.style.display === 'none' || popup.style.display === '') {
        popup.style.display = 'block';
    } else {
        popup.style.display = 'none';
    }
}



// Показ кружочка с кол-вом товаров в накладной
document.addEventListener('click', function (event) {
    if (event.target.closest('.block-actions-cart')) {
        const cartButton = event.target.closest('.block-actions-cart');
        const block = cartButton.closest('.block');
        const input = block.querySelector('input[type="number"]');
        const quantityCircle = block.querySelector('.block-quantity-invoice');
        const quantityText = quantityCircle.querySelector('p');
        const availableQuantityElement = block.querySelector('.block-quantity'); // Элемент с текущим количеством на складе
        const availableQuantity = parseInt(availableQuantityElement.getAttribute('data-quantity'), 10) || 0;

        const quantity = parseInt(input.value, 10);

        if (isNaN(quantity) || quantity <= 0) {
            alert('Укажите корректное количество для добавления.');
            return;
        }

        if (quantity > availableQuantity) {
            alert('Недостаточно товара на складе для добавления в накладную.');
            return;
        }

        // Добавляем товар в накладную
        const currentQuantity = parseInt(quantityText.textContent, 10) || 0;
        quantityText.textContent = currentQuantity + quantity;
        quantityCircle.classList.remove('hidden'); // Показать кружочек
    }
});

// Удаление товара из накладной
document.addEventListener('click', function (event) {
    if (event.target.closest('.block-actions-invoice-delete')) {
        const deleteButton = event.target.closest('.block-actions-invoice-delete');
        const block = deleteButton.closest('.block');
        const input = block.querySelector('input[type="number"]');
        const quantityCircle = block.querySelector('.block-quantity-invoice');
        const quantityText = quantityCircle.querySelector('p');

        let currentQuantity = parseInt(quantityText.textContent, 10) || 0;
        const quantityToRemove = parseInt(input.value, 10) || 0;

        if (currentQuantity > 0) {
            if (quantityToRemove > 0 && quantityToRemove <= currentQuantity) {
                currentQuantity -= quantityToRemove;
                quantityText.textContent = currentQuantity;

                if (currentQuantity === 0) {
                    quantityCircle.classList.add('hidden'); // Скрыть кружочек
                }
            } else {
                alert('Невозможно удалить больше, чем есть в накладной.');
            }
        } else {
            alert('Нет товаров в накладной для удаления.');
        }
    }
});



// // Удалить товар со склада
// document.querySelectorAll('.block-actions-delete').forEach(deleteButton => {
//     deleteButton.addEventListener('click', function () {
//         // Найдем родительский блок товара
//         const block = this.closest('.block');
        
//         // Получим текущую информацию о товаре
//         const quantityText = block.querySelector('.block-quantity');
//         const input = block.querySelector('input[type="number"]');
        
//         // Текущее количество товара на складе
//         let currentStock = parseInt(quantityText.dataset.quantity, 10) || 0;

//         // Получим количество для удаления из инпута
//         const quantityToRemove = parseInt(input.value, 10) || 0;

//         if (quantityToRemove > 0 && quantityToRemove <= currentStock) {
//             // Уменьшаем количество на складе
//             currentStock -= quantityToRemove;

//             // Обновляем количество товара на складе в тексте
//             quantityText.dataset.quantity = currentStock;
//             quantityText.textContent = `В наличии: ${currentStock} шт.`;

//             // Очистим поле ввода
//             input.value = '';

//             // Если товара не осталось, покажем 0
//             if (currentStock === 0) {
//                 quantityText.textContent = 'В наличии: 0 шт.';
//             }
//         } else {
//             // Если введено некорректное количество
//             alert('Невозможно удалить больше, чем есть на складе.');
//         }
//     });
// });

document.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('.block-actions-delete');
    if (deleteButton) {
        const block = deleteButton.closest('.block');
        const itemId = block.getAttribute('data-id');
        const quantityInput = block.querySelector('input[type="number"]');
        const quantity = parseInt(quantityInput?.value || 0);

        if (isNaN(quantity) || quantity <= 0) {
            alert('Укажите корректное количество для удаления.');
            return;
        }

        const availableQuantityElement = block.querySelector('.block-quantity');
        const availableQuantity = parseInt(availableQuantityElement.getAttribute('data-quantity') || 0);

        if (quantity > availableQuantity) {
            alert('На складе недостаточно товара.');
            return;
        }

        // Подтверждение удаления
        const confirmation = confirm(`Вы точно хотите удалить товар со склада в количестве: ${quantity} шт.?`);
        if (!confirmation) {
            return; // Пользователь отменил действие
        }

        // Отправка запроса на сервер
        fetch(`/api/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity: quantity }),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.message || 'Ошибка сервера');
                    });
                }
                return response.json();
            })
            .then(data => {
                availableQuantityElement.innerText = `В наличии: ${data.quantity} шт.`;
                availableQuantityElement.setAttribute('data-quantity', data.quantity);

                // if (data.quantity <= 0) {
                //     block.classList.add('hidden-block');
                // }
            })
            .catch(error => {
                alert(`Ошибка: ${error.message}`);
            });
    }
});






// // Обработка popup для добавления товаров
// // Открытие попапа
// document.querySelector('.new-item button').addEventListener('click', function () {
//     document.querySelector('.new-item-popup').style.display = 'flex';
//     document.querySelector('.overlay').style.display = 'block';
// });

// // Закрытие попапа при клике на затемнение (фоновый слой)
// document.querySelector('.cross-popup').addEventListener('click', function () {
//     document.querySelector('.new-item-popup').style.display = 'none';
//     document.querySelector('.overlay').style.display = 'none';
// });

// // Добавление карточки товара
// document.querySelector('.popup-button').addEventListener('click', function () {
//     const name = document.querySelector('input[name="name"]').value;
//     const articol = document.querySelector('input[name="articol"]').value;
//     const quantity = document.querySelector('input[name="quantity"]').value;
//     const photo = document.querySelector('input[name="photo"]').files[0];
    
//     // Проверка на обязательные поля и формат артикула
//     if (name && articol && quantity && photo) {
//         // Проверка артикула (должен быть 8 цифр и начинаться с 4)
//         const articolRegex = /^4\d{7}$/;
//         if (!articolRegex.test(articol)) {
//             alert('Артикул должен состоять из 8 цифр и начинаться с 4');
//             return;
//         }

//         // Проверка, существует ли уже товар с таким артикулом
//         const existingItem = Array.from(document.querySelectorAll('.block')).find(item => {
//             return item.querySelector('.block-aricool').textContent.includes(articol);
//         });

//         if (existingItem) {
//             // Если товар с таким артикулом уже существует, обновляем количество
//             const currentQuantity = existingItem.querySelector('.block-quantity');
//             const newQuantity = parseInt(currentQuantity.dataset.quantity) + parseInt(quantity);
//             currentQuantity.dataset.quantity = newQuantity;
//             currentQuantity.textContent = `В наличии: ${newQuantity} шт.`;
            
//             // Закрываем попап
//             document.querySelector('.new-item-popup').style.display = 'none';
//             document.querySelector('.overlay').style.display = 'none';
//             return; // Не добавляем новую карточку, просто обновляем количество
//         }

//         // Если товар не найден, создаем новый элемент
//         const reader = new FileReader();
//         reader.onload = function (e) {
//             const newItem = document.createElement('div');
//             newItem.classList.add('block');

//             newItem.innerHTML = `
//                 <div class="block-image">
//                     <img src="${e.target.result}" alt="${name}">
//                 </div>
//                 <div class="block-title">${name}</div>
//                 <div class="block-aricool">Артикул: ${articol}</div>
//                 <div class="block-quantity" data-quantity="${quantity}">В наличии: ${quantity} шт.</div>
//                 <div class="block-actions">
//                     <div class="block-actions-input">
//                         <input type="number" placeholder="Количество" min="1">
//                     </div>
//                     <div class="block-actions-cart" title="Добавить товар в накладную">
//                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M51.5 97.4c-5.4 0-9.7 4.4-9.7 9.7 0 5.4 4.4 9.7 9.7 9.7s9.7-4.4 9.7-9.7c0-5.3-4.3-9.7-9.7-9.7zm0 13.9c-2.3 0-4.2-1.9-4.2-4.2s1.9-4.2 4.2-4.2c2.3 0 4.2 1.9 4.2 4.2s-1.9 4.2-4.2 4.2zM19.7 13.4c-.3-1.3-1.4-2.2-2.7-2.2H2.8C1.3 11.2 0 12.4 0 14c0 1.5 1.2 2.8 2.8 2.8h11.9L41 92.4c.3 1.3 1.4 2.2 2.7 2.2h73.1V89H46L19.7 13.4zm84.6 84c-5.4 0-9.7 4.4-9.7 9.7 0 5.4 4.4 9.7 9.7 9.7 5.4 0 9.7-4.4 9.7-9.7.1-5.3-4.3-9.7-9.7-9.7zm0 13.9c-2.3 0-4.2-1.9-4.2-4.2s1.9-4.2 4.2-4.2 4.2 1.9 4.2 4.2-1.8 4.2-4.2 4.2zM33.4 33.4l2.8 5.6h85s-.5 3.4-2.5 8.3H38.3l.7 2.8h78.5c-.9 2-2.1 4.2-3.5 6.5-.4.6-.9 1.2-1.4 1.8H41.1l.7 2.8h67.8c-7 5.6-18.5 8.3-25.6 8.3H44.5h.2-.2l2.8 5.6h33.4c16 0 29.1-4.9 36.2-13.9C126.4 49 128 33.4 128 33.4H33.4zm76.3 27.8 2.7-2.6c-.8.9-1.7 1.8-2.7 2.6z" id="icon_12_"/></g></svg>
//                     </div>
//                     <div class="block-actions-invoice-delete" title="Удалить товар из накладной">
//                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 137 137"><g id="row1_1_"><g id="_x34__2_"><path class="st2" d="M64 .3C28.7.3 0 28.8 0 64s28.7 63.7 64 63.7 64-28.5 64-63.7S99.3.3 64 .3zm0 121C32.2 121.3 6.4 95.7 6.4 64 6.4 32.3 32.2 6.7 64 6.7s57.6 25.7 57.6 57.3c0 31.7-25.8 57.3-57.6 57.3zm21.9-73.2L81 43.3c-.9-.9-2.3-.9-3.2 0L64 57 50.2 43.3c-.9-.9-2.3-.9-3.2 0l-4.9 4.8c-.9.9-.9 2.3 0 3.2L55.9 65 42.1 78.8c-.9.9-.9 2.3 0 3.2l4.9 4.8c.9.9 2.3.9 3.2 0L64 73.1l13.8 13.7c.9.9 2.3.9 3.2 0l4.9-4.8c.9-.9.9-2.3 0-3.2L72.1 65l13.8-13.7c.9-.9.9-2.3 0-3.2z" id="error_transparent"/></g></g></svg>
//                     </div>
//                     <div class="block-actions-delete" title="Удалить товар со склада">
//                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g data-name="70-Trash"><path d="m29.89 6.55-1-2A1 1 0 0 0 28 4h-7V2a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v2H4a1 1 0 0 0-.89.55l-1 2A1 1 0 0 0 3 8h2v22a2 2 0 0 0 .47 1.41A2 2 0 0 0 7 32h18a2 2 0 0 0 2-2V8h2a1 1 0 0 0 .89-1.45zM13 2h6v2h-6zm12 28H7V8h18z"/><path d="M17 26V10a2 2 0 0 0-2 2l.06 14H15v2a2 2 0 0 0 2-2zM22 26V10a2 2 0 0 0-2 2l.06 14H20v2a2 2 0 0 0 2-2zM12 26V10a2 2 0 0 0-2 2l.06 14H10v2a2 2 0 0 0 2-2z"/></g></svg>
//                     </div>
//                 </div>
//             `;

//             // Добавляем новый элемент в конец списка
//             document.querySelector('.main-items').appendChild(newItem);

//             // Закрываем попап
//             document.querySelector('.new-item-popup').style.display = 'none';
//             document.querySelector('.overlay').style.display = 'none';
//         };

//         reader.readAsDataURL(photo);
//     } else {
//         alert('Пожалуйста, заполните все поля.');
//     }
// });

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.new-item-popup');
    const overlay = document.querySelector('.overlay');
    const cross_popup = document.querySelector('.cross-popup');

    // Делегирование событий на контейнер
    document.body.addEventListener('click', (event) => {
        // Открытие модального окна
        if (event.target.closest('.new-item button')) {
            form.classList.add('visible'); // Показываем модальное окно
            overlay.classList.add('visible'); // Показываем оверлей

            // Очищаем поля формы
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => input.value = '');
        }

        // Закрытие модального окна;
        if (
            event.target.closest('.cross-popup') || // Клик по крестику
            event.target === overlay // Клик по оверлею
        ) {
            form.classList.remove('visible'); // Скрываем модальное окно
            overlay.classList.remove('visible'); // Скрываем оверлей
        }
    });
});





// Загрузка карточек из API
// function loadItems() {
//     fetch('/api/items')
//         .then(response => response.json())
//         .then(items => {
//             // Сортируем товары в порядке убывания
//             items.sort((a, b) => b.id - a.id);

//             // Очищаем контейнер
//             container.innerHTML = '';

//             // Перерисовываем карточки
//             items.forEach((item, index) => {
//                 const additionalClass = index > 24 ? 'hidden-block' : '';
//                 const blockImageClass = ['kuh_plita', 'britva', 'wafelnica'].includes(item.imageitem)
//                     ? 'block-image block-image-kuh'
//                     : 'block-image';

//                 const itemHTML = `
//                     <div class="block ${additionalClass}" data-id="${item.id}">
//                         <div class="${blockImageClass}">
//                             <img src="../static/images/${item.imageitem}.png" alt="${item.nameitem}">
//                         </div>
//                         <div class="block-title">${item.nameitem}</div>
//                         <div class="block-aricool">Артикул: ${item.articoolitem}</div>
//                         <div class="block-quantity" data-quantity="${item.quantityitem}">
//                             В наличии: ${item.quantityitem} шт.
//                         </div>
//                         <div class="block-actions">
//                             <div class="block-actions-input">
//                                 <input type="number" placeholder="Количество" min="1">
//                             </div>
//                             <div class="block-actions-cart" title="Добавить товар в накладную">
//                                 <!-- SVG-код для корзины -->
//                             </div>
//                             <div class="block-actions-invoice-delete" title="Удалить товар из накладной">
//                                 <!-- SVG-код для удаления из накладной -->
//                             </div>
//                             <div class="block-actions-delete" title="Удалить товар со склада">
//                                 <!-- SVG-код для удаления со склада -->
//                             </div>
//                         </div>
//                         <div class="block-quantity-invoice hidden" title="Кол-во товаров в накладной">
//                             <p></p>
//                         </div>
//                     </div>
//                 `;
//                 container.insertAdjacentHTML('beforeend', itemHTML);
//             });
//         })
//         .catch(error => console.error('Ошибка при загрузке товаров:', error));
// }

// Функция для обновления товаров



function loadItems() {
    const loadMoreButton = document.getElementById('load_more');
    const paragraph = document.querySelector('.download-more p');

    fetch('/api/items_html')
        .then(response => response.text())
        .then(html => {
            const container = document.querySelector('.main-items');
            container.innerHTML = html; // Обновляем содержимое контейнера

            // Проверяем состояние кнопки и обновляем её видимость
            if (loadMoreButton && loadMoreButton.style.display === 'none') {
                loadMoreButton.style.display = 'block';
                paragraph.textContent = 'Загрузить ещё'; // Если кнопка была скрыта, показываем её
            }
        })
        .catch(error => console.error('Ошибка при загрузке товаров:', error));
}

const form = document.querySelector('.new-item-popup');

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const modal = document.querySelector('.new-item-popup');
    const overlay = document.querySelector('.overlay');

    fetch('/api/items', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Ошибка: ' + data.message);
                console.error('Ошибка при добавлении товара:', data.message);
            } else {
                alert('Товар добавлен!');

                // Скрыть модальное окно и оверлей
                modal.classList.remove('visible');
                overlay.classList.remove('visible');

                // Перезагрузить список товаров
                loadItems();
            }
        })
        .catch(error => console.error('Ошибка при добавлении товара:', error));
});

// Загрузка товаров при старте страницы
loadItems();









// // Поиск товаров или накладных
// document.getElementById('search-input').addEventListener('input', function () {
//     const query = this.value.trim().toLowerCase();
//     const resultsContainer = document.getElementById('search-results');
//     resultsContainer.innerHTML = ''; // Очистка предыдущих результатов

//     if (!query) {
//         resultsContainer.style.display = 'none';
//         return;
//     }

//     const items = [
//         // Пример данных. В реальном проекте замените на динамически получаемые данные.
//         { type: 'product', id: 'product1', name: 'Мультиварка', articol: '438500982', firm: 'Vitek' },
//         { type: 'product', id: 'product2', name: 'Соковыжималка', articol: '438500983', firm: 'Philips' },
//         { type: 'invoice', id: 'invoice1', invoiceNumber: '1111' },
//         { type: 'invoice', id: 'invoice2', invoiceNumber: '2222' },
//     ];

//     const matchedItems = items.filter(item => {
//         if (item.type === 'product') {
//             return (
//                 item.name.toLowerCase().startsWith(query) || // Начало названия
//                 item.articol.toLowerCase().startsWith(query) || // Начало артикула
//                 item.firm.toLowerCase().startsWith(query) // Начало фирмы
//             );
//         } else if (item.type === 'invoice') {
//             return `накладная №${item.invoiceNumber}`.toLowerCase().startsWith(query); // Начало текста накладной
//         }
//     });

//     if (matchedItems.length > 0) {
//         matchedItems.forEach(item => {
//             let resultText;
//             if (item.type === 'product') {
//                 resultText = `${item.name} (${item.firm}, артикул: ${item.articol})`;
//             } else if (item.type === 'invoice') {
//                 resultText = `Накладная №${item.invoiceNumber}`;
//             }

//             const resultItem = document.createElement('div');
//             resultItem.classList.add('header-search-result-item');
//             resultItem.textContent = resultText;

//             // Добавление действия по клику
//             resultItem.addEventListener('click', function () {
//                 if (item.type === 'product') {
//                     // Скролл к элементу с ID, если это товар
//                     const productElement = document.getElementById(item.id);
//                     if (productElement) {
//                         productElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
//                     }
//                 } else if (item.type === 'invoice') {
//                     // Можно добавить переход на страницу накладной
//                     alert(`Переход к накладной №${item.invoiceNumber}`);
//                 }
//                 resultsContainer.style.display = 'none';
//             });

//             resultsContainer.appendChild(resultItem);
//         });

//         resultsContainer.style.display = 'block';
//     } else {
//         resultsContainer.style.display = 'none';
//     }
// });
