import requests
import time
from threading import Thread
import random

# Function to send POST requests
def send_post_request(url, data):
    try:
        response = requests.post(url, data=data)
        print("POST Request Status Code:", response.status_code)
    except Exception as e:
        print("Error sending POST request:", e)

# Function to send GET requests
def send_get_request(url):
    try:
        response = requests.get(url)
        if response.status_code != 200:
            print("GET Request Status Code:", response.status_code)
            import sys
            sys.exit(32)
    except Exception as e:
        print("Error sending GET request:", e)

# Function to send requests at a specified rate
def send_requests(url, requests_per_second, num_threads):
    def send_request():
        while True:
            start_time = time.time()

            # Randomly choose between 'user', 'product', and 'order' for the request
            request_type = random.choice(['user', 'product', 'order'])

            # Send POST request with specific data for each request type
            if request_type == 'user':
                post_data = {
                    "command": "create",
                    "id": random.randint(1000, 2000),
                    "username": "tester" + str(random.randint(1000, 2000)),
                    "email": "test" + str(random.randint(1000, 2000)) + "@test.com",
                    "password": "password" + str(random.randint(1000, 2000))
                }
            elif request_type == 'product':
                post_data = {
                    "command": "create",
                    "id": random.randint(2000, 3000),
                    "name": "product" + str(random.randint(2000, 3000)),
                    "description": "This is product " + str(random.randint(2000, 3000)),
                    "price": random.uniform(100, 200),
                    "quantity": random.randint(50, 100)
                }
            elif request_type == 'order':
                post_data = {
                    "command": "place order",
                    "product_id": random.randint(2000, 3000),
                    "user_id": random.randint(1000, 2000),
                    "quantity": random.randint(10, 20)
                }

            send_post_request(url + request_type, post_data)

            # Send GET request
            send_get_request(url + request_type)

            # Calculate time taken for this iteration
            iteration_time = time.time() - start_time

            # Calculate time to sleep before next iteration
            time_to_sleep = max(1 / requests_per_second, 1 / requests_per_second - iteration_time)
            time.sleep(time_to_sleep)

    # Create a pool of threads
    threads = []
    for _ in range(num_threads):
        t = Thread(target=send_request)
        threads.append(t)
        t.start()

    # Wait for all threads to finish
    for t in threads:
        t.join()

if __name__ == "__main__":
    url = "http://127.0.0.1:5000/"  # Replace with your target URL
    requests_per_second = 100  # Replace with desired requests per second
    num_threads = 10  # Specify the number of threads (workers)

    # Start a pool of threads to send requests repeatedly
    send_requests(url, requests_per_second, num_threads)