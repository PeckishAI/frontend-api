from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)



@app.route('/images/<path:filename>')
def serve_images(filename):
    root_dir = os.getcwd()
    return send_from_directory(os.path.join(root_dir, 'src', 'images'), filename)

@app.route('/restaurants')
def get_restaurants():
    data = [
        {
            "restaurant_uuid": "1234",
            "restaurant_name": "McDonalds",
            "restaurant_address": "1234 Main St",
            "restaurant_city": "San Francisco",
            "restaurant_state": "CA",
            "restaurant_picture": "mcdonalds.png",
            "employees": [
                {
                    "employee_uuid": "1234",
                    "employee_name": "John Smith",
                    "employee_picture": "profile.png",
                },
                {
                    "employee_uuid": "1235",
                    "employee_name": "Jane Doe",
                    "employee_picture": "profile.png",
                },
                {
                    "employee_uuid": "1236",
                    "employee_name": "John Doe",
                    "employee_picture": "profile.png",
                },
                {
                    "employee_uuid": "1236",
                    "employee_name": "John Doe",
                    "employee_picture": "profile.png",
                },
                 {
                    "employee_uuid": "1236",
                    "employee_name": "John Doe",
                    "employee_picture": "profile.png",
                },
                {
                    "employee_uuid": "1236",
                    "employee_name": "John Doe",
                    "employee_picture": "profile.png",
                }
            ]
        },
        {
            "restaurant_uuid": "5556",
            "restaurant_name": "Burger King",
            "restaurant_address": "4534 Main St",
            "restaurant_city": "San Francisco",
            "restaurant_state": "CA",
            "restaurant_picture": "burger-king.png",
            "employees": [
                {
                    "employee_uuid": "1234",
                    "employee_name": "John Smith",
                    "employee_picture": "profile.png",
                }
            ]
        }
    ]

    return jsonify(data)

@app.route('/onboarding', methods=['GET', 'POST'])
def onboarding():
    if request.method == 'POST':
        pos_modal = request.get_json()  # Receive POS data for onboarding
        onboarding_data = [
            {"name": "storehub", "display_name": "StoreHub", "auth_type": "modal", "state": "Request", "oauth_url": ""},
            {"name": "square", "display_name": "Square", "auth_type": "modal", "state": "Request", "oauth_url": ""},
            {"name": "papapoule", "display_name": "Papapoule", "auth_type": "modal", "state": "Request", "oauth_url": ""},
            {"name": "lightspeed", "display_name": "Lightspeed", "auth_type": "modal", "state": "Request", "oauth_url": ""},
            {"name": "ubereats", "display_name": "UberEATs", "auth_type": "modal", "state": "Request", "oauth_url": ""},
            {"name": "toast", "display_name": "Toast", "auth_type": "modal", "state": "Request", "oauth_url": ""},
            {"name": "deliveroo", "display_name": "Deliveroo", "auth_type": "modal", "state": "Request", "oauth_url": ""},
            {"name": "untill", "display_name": "Untill", "auth_type": "modal", "state": "Request", "oauth_url": ""},
            {"name": "booq", "display_name": "Booq", "auth_type": "modal", "state": "Request", "oauth_url": ""},
            {"name": "justeat", "display_name": "JustEat", "auth_type": "modal", "state": "Request", "oauth_url": ""}
        ]
        # This is where you can process POS data for onboarding
        return jsonify(onboarding_data)
    elif request.method == "GET":
        test_data = [
            {"name": "storehub", "display_name": "StoreHub", "auth_type": "modal"},
            {"name": "square", "display_name": "Square", "auth_type": "modal"},
            {"name": "papapoule", "display_name": "Papapoule", "auth_type": "modal"},
            {"name": "lightspeed", "display_name": "Lightspeed", "auth_type": "modal"},
            {"name": "ubereats", "display_name": "UberEATs", "auth_type": "modal"},
            {"name": "toast", "display_name": "Toast", "auth_type": "modal"},
            {"name": "deliveroo", "display_name": "Deliveroo", "auth_type": "modal"},
            {"name": "untill", "display_name": "Untill", "auth_type": "modal"},
            {"name": "booq", "display_name": "Booq", "auth_type": "modal"},
            {"name": "justeat", "display_name": "JustEat", "auth_type": "modal"}
        ]
        # This is where you can process POS data for onboarding
        return jsonify(test_data)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
