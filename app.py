
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

medicines = [
    
            {
        "name": "Парацетамол",
         "category": "Обезболивающие",

        "price": 65,
        "pharmacy": "Аптека №2",
        "address": "Бишкек, улица Киевская"
    },
    {
        "name": "Парацетамол",
                 "category": "Обезболивающие",

        "price": 45,
        "pharmacy": "Аптека №3",
        "address": "Бишкек, улица Манаса"
    },
    {
        "name": "Ибупрофен",
        "price": 70,
        "pharmacy": "Аптека №1",
        "address": "Бишкек, проспект Чуй"
    },
    {
        "name": "Ибупрофен",
        "price": 90,
        "pharmacy": "Аптека №3",
        "address": "Бишкек, улица Манаса"
    },{
        "name": "Парацетамол",
                 "category": "Обезболивающие",

        "price": 50,
        "pharmacy": "Аптека №1",
        "address": "Бишкек, проспект Чуй"
    },
    {
        "name": "Ибупрофен",
        "price": 80,
        "pharmacy": "Аптека №2",
        "address": "Бишкек, улица Киевская"
    },
    {
        "name": "Цитрамон",
        "price": 40,
        "pharmacy": "Аптека №3",
        "address": "Бишкек, улица Манаса"
    }
]

@app.route("/")
def home():
    return "MediFind KG сервер работает!"

@app.route("/medicines")
def get_medicines():
    return jsonify(medicines)

if __name__ == "__main__":
    app.run(debug=True)
