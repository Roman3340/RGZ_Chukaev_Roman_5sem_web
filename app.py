from flask import Flask, Blueprint, render_template, request, redirect, session, current_app, abort, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
import sqlite3
import os
from os import path
import random
app = Flask(__name__)


app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'секретно-секретный секрет')
app.config['DB_TYPE'] = os.getenv('DB_TYPE', 'postgres')
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'static', 'images')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def db_connect():
    if current_app.config['DB_TYPE'] == 'postgres':
        conn = psycopg2.connect(
        host = '127.0.0.1',
        database = 'roman_chukaev_rgz_web',
        user = 'postgres',
        password = '123'
        )
        cur = conn.cursor(cursor_factory = RealDictCursor)
    else:
        dir_path = path.dirname(path.realpath(__file__))
        db_path = path.join(dir_path, "database.db")
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

    return conn, cur


def db_close(conn, cur):
    conn.commit()
    cur.close()
    conn.close()

@app.route("/")
def start():
    return redirect('/storage')



@app.route('/storage')
def storage_page():
    login = session.get('login')
    if not login:
        return redirect('/login')

    conn, cur = db_connect()

    # Запрашиваем все товары
    if current_app.config['DB_TYPE'] == 'postgres':
        cur.execute("SELECT * FROM storageItems ORDER BY id ASC;")
    else:
        cur.execute("SELECT * FROM storageItems ORDER BY id ASC;")

    items = cur.fetchall()
    db_close(conn, cur)

    return render_template('storage.html', login=login, items=items)



@app.route('/login', methods=['GET', 'POST'])
def login_page():
    if request.method == 'GET':
        return render_template('login.html')
    
    login = request.form.get('login', '')
    password = request.form.get('password', '')
    
    errors = {}
    if not login or not password:
        errors['notExist'] = 'Логин и/или пароль неверны'
        return render_template('login.html', errors=errors, login=login)
    
    conn, cur = db_connect()

    if current_app.config['DB_TYPE'] == 'postgres':
        cur.execute("SELECT * FROM users WHERE login_user=%s;", (login,))
    else:
        cur.execute("SELECT * FROM users WHERE login_user=?;", (login,))
    
    user = cur.fetchone()
    if not user or not check_password_hash(user['password_user'], password):
        db_close(conn, cur)
        errors['notExist'] = 'Логин и/или пароль неверны'
        return render_template('login.html', errors=errors, login=login)
    
    session['login'] = login
    db_close(conn, cur)
    return redirect('/storage')

@app.route('/register', methods=['GET', 'POST'])
def register_page():
    if request.method == 'GET':
        return render_template('register.html')
    
    login = request.form.get('login', '')
    password = request.form.get('password', '')
    
    errors = {}
    if not login:
        errors['login'] = 'Поле "Логин" обязательно'
    if not password:
        errors['password'] = 'Поле "Пароль" обязательно'
    
    if errors:
        return render_template('register.html', errors=errors, login=login)
    
    conn, cur = db_connect()

    if current_app.config['DB_TYPE'] == 'postgres':
        cur.execute("SELECT login_user FROM users WHERE login_user=%s;", (login, ))
    else:
        cur.execute("SELECT login_user FROM users WHERE login_user=?;", (login, ))
    if cur.fetchone():
        errors['anyExist'] = 'Такой пользователь уже существует'
        return render_template('register.html', errors=errors, login=login)

    password_hash = generate_password_hash(password)

    if current_app.config['DB_TYPE'] == 'postgres':
        cur.execute("INSERT INTO users (login_user, password_user) VALUES (%s, %s);", (login, password_hash))
    else:
        cur.execute("INSERT INTO users (login_user, password_user) VALUES (?, ?);", (login, password_hash))
    db_close(conn, cur)
    return render_template('login.html', login=login, error=None)

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('login', None)
    session.pop('password', None)  # Удаляем имя из сессии при выходе
    return redirect('/login')



@app.route('/api/items_html', methods=['GET'])
def get_items_html():
    conn, cur = db_connect()
    try:
        cur.execute("SELECT * FROM storageitems ORDER BY id ASC;")
        items = cur.fetchall()
        # Рендерим часть HTML с товарами
        return render_template('items-fragment.html', items=items)
    except Exception as e:
        return jsonify({'error': True, 'message': str(e)})
    finally:
        db_close(conn, cur)


# Обновление количества товара
@app.route('/api/items/<int:item_id>', methods=['PUT'])
def update_item_quantity(item_id):
    data = request.get_json()
    if not data or 'quantity' not in data:
        return jsonify({'error': 'Bad Request', 'message': 'Не указано количество для обновления'}), 400

    quantity_to_remove = data['quantity']
    if quantity_to_remove <= 0:
        return jsonify({'error': 'Bad Request', 'message': 'Некорректное количество для обновления'}), 400

    conn, cur = db_connect()
    try:
        # Получить текущее количество товара
        if current_app.config['DB_TYPE'] == 'postgres':
            cur.execute("SELECT quantityitem FROM storageitems WHERE id=%s;", (item_id,))
        else:
            cur.execute("SELECT quantityitem FROM storageitems WHERE id=?;", (item_id,))
        
        item = cur.fetchone()
        if not item:
            return jsonify({'error': 'Not Found', 'message': 'Товар не найден'}), 404

        current_quantity = item['quantityitem']
        if quantity_to_remove > current_quantity:
            return jsonify({'error': 'Bad Request', 'message': 'На складе недостаточно товаров'}), 400

        # Обновляем количество
        new_quantity = current_quantity - quantity_to_remove
        if current_app.config['DB_TYPE'] == 'postgres':
            cur.execute("UPDATE storageitems SET quantityitem=%s WHERE id=%s;", (new_quantity, item_id))
        else:
            cur.execute("UPDATE storageitems SET quantityitem=? WHERE id=?;", (new_quantity, item_id))
        
        conn.commit()
        return jsonify({'id': item_id, 'quantity': new_quantity})
    finally:
        db_close(conn, cur)




@app.route('/api/items', methods=['POST'])
def add_item():
    conn, cur = db_connect()
    try:
        name = request.form['name']
        articool = request.form['articol']  # Получаем артикул как строку

        # Проверяем и преобразуем артикул
        try:
            articool = int(articool.strip())  # Убираем лишние пробелы и преобразуем
        except ValueError:
            return jsonify({'error': True, 'message': 'Артикул должен быть числом!'})

        quantity = request.form['quantity']  # Получаем количество
        try:
            quantity = int(quantity.strip())  # Убираем лишние пробелы и преобразуем
        except ValueError:
            return jsonify({'error': True, 'message': 'Количество должно быть числом!'})

        image_file = request.files.get('photo')  # Получаем файл фотографии

        # Определяем путь для сохранения изображений
        base_dir = os.path.abspath(os.path.dirname(__file__))
        if 'pythonanywhere' in base_dir:
            images_folder = os.path.join(base_dir, 'RGZ_Chukaev_Roman_5sem_web', 'static', 'images')
        else:
            images_folder = os.path.join(base_dir, 'static', 'images')

        os.makedirs(images_folder, exist_ok=True)

        # Сохраняем изображение, если оно передано
        image_name = None
        if image_file and image_file.filename:
            image_name = os.path.splitext(image_file.filename)[0]
            image_path = os.path.join(images_folder, f"{image_name}.png")
            image_file.save(image_path)

        # Определяем тип базы данных
        db_type = current_app.config.get('DB_TYPE', 'sqlite')

        # Проверяем, существует ли товар с таким артикулом
        if db_type == 'postgres':
            query_check = "SELECT * FROM storageitems WHERE articoolitem = %s"
            query_update = "UPDATE storageitems SET quantityitem = %s WHERE articoolitem = %s"
            query_insert = "INSERT INTO storageitems (nameitem, articoolitem, quantityitem, imageitem) VALUES (%s, %s, %s, %s)"
            params_check = (articool,)
            params_update = (quantity, articool)
            params_insert = (name, articool, quantity, image_name)
        else:  # SQLite
            query_check = "SELECT * FROM storageitems WHERE articoolitem = ?"
            query_update = "UPDATE storageitems SET quantityitem = ? WHERE articoolitem = ?"
            query_insert = "INSERT INTO storageitems (nameitem, articoolitem, quantityitem, imageitem) VALUES (?, ?, ?, ?)"
            params_check = (articool,)
            params_update = (quantity, articool)
            params_insert = (name, articool, quantity, image_name)

        cur.execute(query_check, params_check)
        existing_item = cur.fetchone()

        if existing_item:
            # Если товар уже есть, обновляем его количество
            new_quantity = existing_item['quantityitem'] + quantity
            cur.execute(query_update, (new_quantity, articool))
        else:
            # Добавляем новый товар
            cur.execute(query_insert, params_insert)

        conn.commit()
        return jsonify({'success': True})

    except Exception as e:
        import traceback
        traceback.print_exc()  # Вывод полной трассировки для отладки
        return jsonify({'error': True, 'message': str(e)})

    finally:
        db_close(conn, cur)





def get_all_invoices():
    conn, cur = db_connect()
    try:
        query = "SELECT id, numberinvoice, statusinvoice FROM invoices"
        cur.execute(query)
        invoices = cur.fetchall()  # Сразу возвращает список словарей
        return invoices
    except Exception as e:
        print(f"Error fetching invoices: {e}")
        return []
    finally:
        db_close(conn, cur)



@app.route('/invoices')
def invoices_page():
    login = session.get('login')
    invoices = get_all_invoices()  # Загружаем все накладные
    return render_template('invoices.html', login=login, invoices=invoices)

# Роут для создания накладной
@app.route('/create-invoice', methods=['POST'])
def create_invoice():
    logs = []  # Логи для отправки в ответе
    data = request.get_json()
    logs.append(f"Received request data: {data}")

    # Проверяем данные
    items = data.get('items', [])
    if not items:
        logs.append("Нет товаров для создания накладной.")
        return jsonify({'message': 'Нет товаров для создания накладной', 'logs': logs}), 400

    conn, cur = None, None
    try:
        # Подключение к базе данных
        conn, cur = db_connect()
        db_type = current_app.config.get('DB_TYPE', 'sqlite')
        logs.append(f"Connected to database. DB_TYPE: {db_type}")

        # Генерация случайного номера накладной
        number_invoice = random.randint(10000, 99999)
        logs.append(f"Generated numberInvoice: {number_invoice}")

        # Добавляем накладную в базу данных
        if db_type == 'postgres':
            query_invoice = 'INSERT INTO invoices (numberInvoice, statusInvoice) VALUES (%s, %s) RETURNING id'
            logs.append(f"Executing query: {query_invoice} with values: {number_invoice}, {False}")
            cur.execute(query_invoice, (number_invoice, False))
            result = cur.fetchone()
            if result is None:
                raise Exception("No data returned from INSERT INTO invoices")
            invoice_id = result['id']
        else:
            query_invoice = 'INSERT INTO invoices (numberinvoice, statusinvoice) VALUES (?, ?)'
            logs.append(f"Executing query: {query_invoice} with values: {number_invoice}, {0}")
            cur.execute(query_invoice, (number_invoice, 0))
            invoice_id = cur.lastrowid

        logs.append(f"Created invoice with ID: {invoice_id}")

        # Добавляем товары в накладную
        for item in items:
            item_name = item.get('itemName')
            quantity = item.get('quantity')

            if not item_name or quantity <= 0:
                logs.append(f"Skipping invalid item: {item}")
                continue

            if db_type == 'postgres':
                query_item = 'INSERT INTO invoiceItems (idInvoice, itemInvoice, itemQuantity) VALUES (%s, %s, %s)'
                logs.append(f"Executing query: {query_item} with values: {invoice_id}, {item_name}, {quantity}")
                cur.execute(query_item, (invoice_id, item_name, quantity))
            else:
                query_item = 'INSERT INTO invoiceitems (idinvoice, iteminvoice, itemquantity) VALUES (?, ?, ?)'
                logs.append(f"Executing query: {query_item} with values: {invoice_id}, {item_name}, {quantity}")
                cur.execute(query_item, (invoice_id, item_name, quantity))

            logs.append(f"Added item to invoice: {item_name}, quantity: {quantity}")

        # Фиксируем транзакцию
        conn.commit()
        logs.append("Transaction committed successfully.")
        return jsonify({
            'message': 'Накладная успешно создана',
            'idInvoice': invoice_id,
            'numberInvoice': number_invoice,
            'logs': logs
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()
        logs.append(f"Transaction rolled back due to error: {e}")
        return jsonify({'message': 'Ошибка сервера', 'error': str(e), 'logs': logs}), 500

    finally:
        # Закрываем соединение с базой данных
        if conn and cur:
            db_close(conn, cur)
            logs.append("Database connection closed.")


# Роут для обновления статуса накладной
@app.route('/api/invoices/status/<int:invoice_id>', methods=['PUT'])
def update_invoice_status(invoice_id):
    conn, cur = db_connect()
    try:
        data = request.get_json()
        if not data or 'status' not in data:
            return jsonify({"error": "Invalid request"}), 400

        new_status = data['status']

        if current_app.config['DB_TYPE'] == 'postgres':
            query = "UPDATE invoices SET statusInvoice = %s WHERE id = %s RETURNING *"
            cur.execute(query, (new_status, invoice_id))
        else:
            query = "UPDATE invoices SET statusinvoice = ? WHERE id = ?"
            cur.execute(query, (new_status, invoice_id))
        
        updated_invoice = cur.fetchone()

        if not updated_invoice:
            return jsonify({"error": "Invoice not found"}), 404

        invoice = dict(updated_invoice) if isinstance(updated_invoice, sqlite3.Row) else updated_invoice

        return jsonify({
            "message": f"Invoice {invoice_id} updated successfully.",
            "invoice": invoice
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db_close(conn, cur)



@app.route('/get-invoice-items/<int:invoice_id>', methods=['GET'])
def get_invoice_items(invoice_id):
    conn, cur = db_connect()
    try:
        query = "SELECT * FROM invoiceitems WHERE idinvoice = ?" if current_app.config['DB_TYPE'] == 'sqlite' else "SELECT * FROM invoiceItems WHERE idinvoice = %s"
        cur.execute(query, (invoice_id,))
        items = cur.fetchall()
        items_list = [dict(item) for item in items]  # Преобразование в список словарей

        return jsonify(items_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db_close(conn, cur)





@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad Request', 'message': str(error)}), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not Found', 'message': str(error)}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal Server Error', 'message': 'Что-то пошло не так на сервере'}), 500
