from flask import Flask, request
import requests
import itertools

app = Flask(__name__)

# List of User, Product, and Order Service instances
user_services = [
    {"ip": "127.0.0.1", "port": 5001},
    {"ip": "127.0.0.2", "port": 5002},
    {"ip": "127.0.0.3", "port": 5003}
]

product_services = [
    {"ip": "127.0.0.4", "port": 5004},
    {"ip": "127.0.0.5", "port": 5005},
    {"ip": "127.0.0.6", "port": 5006}
]

order_services = [
    {"ip": "127.0.0.7", "port": 5007},
    {"ip": "127.0.0.8", "port": 5008},
    {"ip": "127.0.0.9", "port": 5009}
]

# Create iterators that will cycle through the services indefinitely
user_service_cycle = itertools.cycle(user_services)
product_service_cycle = itertools.cycle(product_services)
order_service_cycle = itertools.cycle(order_services)

@app.route('/user', methods=['POST', 'GET'])
@app.route('/user/<int:arg_id>', methods=['GET'])
def user(arg_id=None):
    service = next(user_service_cycle)
    url = f"http://{service['ip']}:{service['port']}/user"
    if arg_id is not None:
        url += f"/{arg_id}"
    
    if request.method == 'POST':
        # Forward the request to the selected User Service instance
        response = requests.post(url, json=request.json)
    elif request.method == 'GET':
        # Forward the request to the selected User Service instance
        response = requests.get(url)
    
    # Return the response from the service instance
    return response.json(), response.status_code

@app.route('/user/purchased/<int:arg_id>', methods=['GET'])
def user_purchased(arg_id):
    service = next(order_service_cycle)
    url = f"http://{service['ip']}:{service['port']}/user/purchased/{arg_id}"
    
    # Forward the request to the selected Order Service instance
    response = requests.get(url)
    
    # Return the response from the service instance
    return response.json(), response.status_code

@app.route('/product', methods=['POST', 'GET'])
@app.route('/product/<int:arg_id>', methods=['GET'])
def product(arg_id=None):
    service = next(product_service_cycle)
    url = f"http://{service['ip']}:{service['port']}/product"
    if arg_id is not None:
        url += f"/{arg_id}"
    
    if request.method == 'POST':
        # Forward the request to the selected Product Service instance
        response = requests.post(url, json=request.json)
    elif request.method == 'GET':
        # Forward the request to the selected Product Service instance
        response = requests.get(url)
    
    # Return the response from the service instance
    return response.json(), response.status_code

@app.route('/order', methods=['POST', 'GET'])
def order():
    service = next(order_service_cycle)
    url = f"http://{service['ip']}:{service['port']}/order"
    
    if request.method == 'POST':
        # Forward the request to the selected Order Service instance
        response = requests.post(url, json=request.json)
    elif request.method == 'GET':
        # Forward the request to the selected Order Service instance
        response = requests.get(url, params=request.args)
    
    # Return the response from the service instance
    return response.json(), response.status_code

if __name__ == '__main__':
    app.run(port=5000)
