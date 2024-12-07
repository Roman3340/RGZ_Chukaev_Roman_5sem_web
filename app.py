from flask import Flask, Blueprint, render_template, request, redirect, session, current_app
import psycopg2
from psycopg2.extras import RealDictCursor
from werkzeug.security import check_password_hash, generate_password_hash
import sqlite3
import os
from os import path
app = Flask(__name__)


app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'секретно-секретный секрет')
app.config['DB_TYPE'] = os.getenv('DB_TYPE', 'postgres')

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
    return 'Начало положено'

# @app.route('/storage')
# def storage_page():
#     login = session.get('login')
#     return render_template('storage.html', login=login)

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
    # conn, cur = db_connect()

    # # Запрашиваем все товары
    # if current_app.config['DB_TYPE'] == 'postgres':
    #     cur.execute("SELECT * FROM storageItems ORDER BY id ASC;")
    # else:
    #     cur.execute("SELECT * FROM storageItems ORDER BY id ASC;")

    # items = cur.fetchall()
    # db_close(conn, cur)

    # return render_template('storage.html', login=login, items=items)
    # return render_template('storage.html', login=login)
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

@app.route('/invoices')
def invoices_page():
    login = session.get('login')
    return render_template('invoices.html', login=login)



# @app.errorhandler(404)
# def not_found_404(err):
#     return '''
# <!doctype html>
# <html>
#     <head>
#         <title>НГТУ, ФБ, Лабораторные работы</title>
#         <link rel="stylesheet" href="''' + url_for('static', filename='styles.css') + '''">
#     </head>
#     <body>
#         <header>
#             НГТУ, ФБ, WEB-программирование, часть 2. Список лабораторных
#         </header>

#         <h2>Ошибка 404 - такой страницы не существует</h2>

#         <footer>
#             &copy; Чукаев Роман, ФБИ-24, 3 курс, 2024
#         </footer>
#     </body>
# </html>
# '''


# @app.errorhandler(500)
# def not_found_500(err):
#     return '''
# <!doctype html>
# <html>
#     <head>
#         <title>НГТУ, ФБ, Лабораторные работы</title>
#         <link rel="stylesheet" href="''' + url_for('static', filename='styles.css') + '''">
#     </head>
#     <body>
#         <header>
#             НГТУ, ФБ, WEB-программирование, часть 2. Список лабораторных
#         </header>

#         <h2>Ошибка 500 - сервер не смог обработать запрос</h2>
#         <p>Подробности ошибки: ''' + str(err) + '''</p> 

#         <footer>
#             &copy; Чукаев Роман, ФБИ-24, 3 курс, 2024
#         </footer>
#     </body>
# </html>
# ''', 500