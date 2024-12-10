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



// // Показ кружочка с кол-вом товаров в накладной
// document.addEventListener('click', function (event) {
//     if (event.target.closest('.block-actions-cart')) {
//         const cartButton = event.target.closest('.block-actions-cart');
//         const block = cartButton.closest('.block');
//         const input = block.querySelector('input[type="number"]');
//         const quantityCircle = block.querySelector('.block-quantity-invoice');
//         const quantityText = quantityCircle.querySelector('p');
//         const availableQuantityElement = block.querySelector('.block-quantity'); // Элемент с текущим количеством на складе
//         const availableQuantity = parseInt(availableQuantityElement.getAttribute('data-quantity'), 10) || 0;

//         const quantity = parseInt(input.value, 10);

//         if (isNaN(quantity) || quantity <= 0) {
//             alert('Укажите корректное количество для добавления.');
//             return;
//         }

//         const currentQuantity = parseInt(quantityText.textContent, 10) || 0; // Уже добавленное количество
//         const remainingQuantity = availableQuantity - currentQuantity; // Остаток на складе

//         if (quantity > remainingQuantity) {
//             alert('Недостаточно товара на складе для добавления в накладную.');
//             return;
//         }

//         // Добавляем товар в накладную
//         quantityText.textContent = currentQuantity + quantity;
//         quantityCircle.classList.remove('hidden'); // Показать кружочек
//     }
// });


// // Удаление товара из накладной
// document.addEventListener('click', function (event) {
//     if (event.target.closest('.block-actions-invoice-delete')) {
//         const deleteButton = event.target.closest('.block-actions-invoice-delete');
//         const block = deleteButton.closest('.block');
//         const input = block.querySelector('input[type="number"]');
//         const quantityCircle = block.querySelector('.block-quantity-invoice');
//         const quantityText = quantityCircle.querySelector('p');

//         let currentQuantity = parseInt(quantityText.textContent, 10) || 0;
//         const quantityToRemove = parseInt(input.value, 10) || 0;

//         if (currentQuantity > 0) {
//             if (quantityToRemove > 0 && quantityToRemove <= currentQuantity) {
//                 currentQuantity -= quantityToRemove;
//                 quantityText.textContent = currentQuantity;

//                 if (currentQuantity === 0) {
//                     quantityCircle.classList.add('hidden'); // Скрыть кружочек
//                 }
//             } else {
//                 alert('Невозможно удалить больше, чем есть в накладной.');
//             }
//         } else {
//             alert('Нет товаров в накладной для удаления.');
//         }
//     }
// });

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

        const currentQuantity = parseInt(quantityText.textContent, 10) || 0; // Уже добавленное количество
        const remainingQuantity = availableQuantity - currentQuantity; // Остаток на складе

        if (quantity > remainingQuantity) {
            alert('Недостаточно товара на складе для добавления в накладную.');
            return;
        }

        // Добавляем товар в накладную
        quantityText.textContent = currentQuantity + quantity;
        quantityCircle.classList.remove('hidden'); // Показать кружочек

        // Показать кнопку "Создать накладную"
        updateInvoiceButtonVisibility();
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

        // Проверить, нужно ли скрыть кнопку "Создать накладную"
        updateInvoiceButtonVisibility();
    }
});

// Функция для показа/скрытия кнопки "Создать накладную"
function updateInvoiceButtonVisibility() {
    const invoiceButton = document.querySelector('.make-invoice button');
    const invoiceQuantities = document.querySelectorAll('.block-quantity-invoice p');

    // Подсчитать общее количество товаров в накладной
    const totalQuantityInInvoice = Array.from(invoiceQuantities).reduce((total, element) => {
        const quantity = parseInt(element.textContent, 10) || 0;
        return total + quantity;
    }, 0);

    // Показать или скрыть кнопку в зависимости от общего количества товаров
    if (totalQuantityInInvoice > 0) {
        invoiceButton.classList.add('show'); // Показать кнопку с анимацией
    } else {
        invoiceButton.classList.remove('show'); // Скрыть кнопку с анимацией
    }
}






// Удаление товара со склада и пересчет накладной
document.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('.block-actions-delete');
    if (deleteButton) {
        const block = deleteButton.closest('.block');
        const itemId = block.getAttribute('data-id');
        const quantityInput = block.querySelector('input[type="number"]');
        const quantityToRemove = parseInt(quantityInput?.value || 0);

        if (isNaN(quantityToRemove) || quantityToRemove <= 0) {
            alert('Укажите корректное количество для удаления.');
            return;
        }

        const availableQuantityElement = block.querySelector('.block-quantity');
        const availableQuantity = parseInt(availableQuantityElement.getAttribute('data-quantity') || 0);

        if (quantityToRemove > availableQuantity) {
            alert('На складе недостаточно товара.');
            return;
        }

        // Подтверждение удаления
        const confirmation = confirm(`Вы точно хотите удалить товар со склада в количестве: ${quantityToRemove} шт.?`);
        if (!confirmation) {
            return; // Пользователь отменил действие
        }

        // Отправка запроса на сервер
        fetch(`/api/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity: quantityToRemove }),
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
                const newAvailableQuantity = data.quantity;
                availableQuantityElement.innerText = `В наличии: ${newAvailableQuantity} шт.`;
                availableQuantityElement.setAttribute('data-quantity', newAvailableQuantity);

                // Пересчет накладной
                const quantityCircle = block.querySelector('.block-quantity-invoice');
                const quantityText = quantityCircle.querySelector('p');
                let currentInvoiceQuantity = parseInt(quantityText.textContent, 10) || 0;

                // Уменьшить количество в накладной, если превышает остаток
                if (currentInvoiceQuantity > newAvailableQuantity) {
                    currentInvoiceQuantity = newAvailableQuantity;
                    quantityText.textContent = currentInvoiceQuantity;

                    if (currentInvoiceQuantity === 0) {
                        quantityCircle.classList.add('hidden'); // Скрыть кружочек, если товаров больше нет
                    }
                }
            })
            .catch(error => {
                alert(`Ошибка: ${error.message}`);
            });
    }
});




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






// Накладные
document.querySelector('.make-invoice button').addEventListener('click', function () {
    const invoiceItems = Array.from(document.querySelectorAll('.block-quantity-invoice')).map(block => {
        const parent = block.closest('.block');
        const id = parent.dataset.id;
        const name = parent.dataset.itemName;
        const quantity = parseInt(block.querySelector('p').textContent, 10);

        if (!quantity || quantity <= 0) { // Игнорируем товары с некорректным количеством
            return null;
        }

        return { id, itemName: name, quantity };
    }).filter(item => item !== null); // Удаляем все `null` элементы из массива

    if (invoiceItems.length === 0) {
        alert('Накладная пуста.');
        return;
    }

    console.log('Отправляем данные:', JSON.stringify({ items: invoiceItems }, null, 2));

    fetch('/create-invoice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: invoiceItems })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    console.error('Server logs:', data.logs);
                    throw new Error(data.message || 'Ошибка сервера');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Server logs:', data.logs);
            if (data.message) {
                alert(data.message);
                window.location.href = '/invoices'; // Перенаправляем на страницу с накладными
            } else {
                alert('Произошла ошибка при создании накладной.');
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Ошибка сервера. Попробуйте позже.');
        });
});

