from flask import Flask, redirect, url_for, render_template
app = Flask(__name__)


@app.route("/")
def start():
    return 'Начало положено'

@app.route('/storage')
def storage_page():
    return render_template('storage.html')


@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/invoices')
def invoices_page():
    return render_template('invoices.html')



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