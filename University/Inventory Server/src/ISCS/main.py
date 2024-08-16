from fastapi import FastAPI, Request
from starlette.responses import Response, JSONResponse

import sys
import httpx
import uvicorn
import json
import os

app = FastAPI()

# Middleware to handle requests
@app.middleware("http")
async def middleware(request: Request, _):
    # Load config settings for user and product services
    with open(sys.argv[1], 'r') as f:
        config = json.load(f)
        if (UserService := config.get('UserService')) is None:
            raise ValueError('No UserService configuration found')
        if (uip := UserService.get('ip')) is None or (uport := UserService.get('port')) is None:
            raise ValueError('IP or port not found in UserService configuration')
        if (ProductService := config.get('ProductService')) is None:
            raise ValueError('No ProductService configuration found')
        if (pip := ProductService.get('ip')) is None or (pport := ProductService.get('port')) is None:
            raise ValueError('IP or port not found in ProductService configuration')
        
    async with httpx.AsyncClient() as client:
        try:
            # Shutdown the server
            if request.url.path.startswith("/shutdown"):
                print("Shutting Down ISCS...")
                os._exit(0)
                
            # Forward and return requests for user services
            if request.url.path.startswith("/user"):

                if request.method == "GET":
                    r = await client.get(f"http://{uip}:{uport}{request.url.path}")
                    return JSONResponse(r.json(), status_code=r.status_code)
                
                elif request.method == "POST":
                    data = await request.body()
                    r = await client.post(f"http://{uip}:{uport}{request.url.path}", data=data)
                    return JSONResponse(r.json(), status_code=r.status_code)
            
            # Forward and return requests for product services
            if request.url.path.startswith("/product"):

                if request.method == "GET":
                    r = await client.get(f"http://{pip}:{pport}{request.url.path}")
                    return JSONResponse(r.json(), status_code=r.status_code)
                
                elif request.method == "POST":
                    data = await request.body()
                    r = await client.post(f"http://{pip}:{pport}{request.url.path}", data=data)
                    return JSONResponse(r.json(), status_code=r.status_code)
                
        except httpx.ConnectError:
            return JSONResponse({"error": "Unable to connect to the server"}, status_code=503)

        return Response("There's nothing here")
    
if __name__ == "__main__":
    # Check if config path is provided
    if len(sys.argv) < 2:
        raise ValueError('No config path provided: python3 main.py <config_path>')
    
    # Load config settings
    with open(sys.argv[1], 'r') as f:
        config = json.load(f)

        if (ISCS := config.get('InterServiceCommunication')) is None:
            raise ValueError('No ISCS configuration found')
        
        if (ip := ISCS.get('ip')) is None or (port := ISCS.get('port')) is None:
            raise ValueError('IP or port not found in ISCS configuration')

    # Run the server
    config = uvicorn.Config("main:app", host=ip, port=port)
    server = uvicorn.Server(config)
    server.run()
