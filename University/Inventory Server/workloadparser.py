import json
import requests
import sys

verbose = False

def make_post_request(url, data):
    try:
        headers = {'Content-Type' : 'application/json'}
        response = requests.post(url, headers=headers, data=data)
        response.raise_for_status()
        print(response.status_code, response.json())
    except requests.exceptions.HTTPError as http_err:
        print(http_err)
    except Exception as err:
        print(f'Other Error: {err}')

def make_get_request(url):
    try:
        headers = {'Content-Type' : 'application/json'}
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        print(response.status_code, response.json())
    except requests.exceptions.HTTPError as http_err:
        print(http_err)
    except Exception as err:
        print(f'Other Error: {err}')

if __name__ == "__main__":
    if len(sys.argv) < 3:
        raise ValueError('Invalid Arguments: python3 workloadparser.py <workloadfile> <config_path>')
    
with open(sys.argv[2], 'r') as f:
    config = json.load(f)

    if (LoadBalancer := config.get('LoadBalancer')) is None:
        raise ValueError('No LoadBalancer configuration found')
    
    if (ip := LoadBalancer.get('ip')) is None or (port := LoadBalancer.get('port')) is None:
        raise ValueError('IP or port not found in LoadBalancer configuration')

    base_url = f"http://{ip}:{port}"

    # Parse the workload file into a list of commands
    with open(sys.argv[1], 'r') as f:
        commands = [line.strip().split() for line in f.readlines() if line.strip() != ""]

    for workload_command in commands:
        arguments = iter(workload_command)
        if (service := next(arguments, None)) is None:
            continue
        service = service.lower()
        command = next(arguments, "").lower()
        arg_id = int(next(arguments, 0))

        # Parse the remaining arguments into a dictionary if possible
        args_dict = {}
        has_keys = True
        for arg in arguments:
            if ':' in arg:
                key, value = arg.split(':')
                args_dict[key] = value
            else:
                has_keys = False

        # User Command: user <command> <id> <username?> <email?> <password?>
        if service == "user":
            if command in ("create", "update", "delete"):

                if has_keys:
                    args_dict['command'] = command
                    args_dict['id'] = arg_id
                    data = json.dumps(args_dict)
                else:
                    args_copy = iter(workload_command[3:])
                    username = next(args_copy, "")
                    email = next(args_copy, "")
                    password = next(args_copy, "")
                    data = json.dumps({
                        'command': command,
                        'id': arg_id,
                        'username': username,
                        'email': email,
                        'password': password
                    })
                
                print(f"\nUSER {command.upper()}: {base_url}/user", data)
                make_post_request(f"{base_url}/user", data)

            elif command == "get":
                print(f"\nUSER GET: {base_url}/user/{arg_id}")
                make_get_request(f"{base_url}/user/{arg_id}")

        # Product Command: product <command> <id> <name?> <description?> <price?> <quantity?>
        elif service == "product":
            if command in ("create", "update", "delete"):

                if has_keys:
                    args_dict['command'] = command
                    args_dict['id'] = arg_id
                    args_dict['quantity'] = int(args_dict.get('quantity', 0))
                    args_dict['price'] = float(args_dict.get('price', 0))
                    data = json.dumps(args_dict)
                else:
                    # Instructions / Piazza / API Docs are conflicting on the requirement!!!
                    args_copy = iter(workload_command[3:])
                    name = next(args_copy, "")
                    description = next(args_copy, "")
                    price = float(next(args_copy, 0))
                    quantity = int(next(args_copy, 0))
                    data = json.dumps({
                        'command': command,
                        'id': arg_id,
                        'name': name,
                        'description': description,
                        'price': price,
                        'quantity': quantity
                    })
                
                print(f"\nPRODUCT {command.upper()}: {base_url}/product", data)
                make_post_request(f"{base_url}/product", data)

            elif command in ("get", "info"):
                print(f"\nPRODUCT GET: {base_url}/product/{arg_id}")
                make_get_request(f"{base_url}/product/{arg_id}")
        # Order Command: order place <product_id> <user_id> <quantity>
        elif service == "order" and command == "place":
            product_id = arg_id
            args_copy = iter(workload_command[3:])
            user_id = int(next(args_copy, 0))
            quantity = int(next(args_copy, 0))
            data = json.dumps({
                "command": "place order",
                'product_id': product_id,
                'user_id': user_id,
                'quantity': quantity
            })
            print(f"\nORDER PLACE: {base_url}/order", data)
            make_post_request(f"{base_url}/order", data)
        