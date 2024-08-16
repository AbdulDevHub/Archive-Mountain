#!/bin/bash

#1
case $1 in
  -c)
    echo "Compiling source code..."
    pip3 install fastapi httpx uvicorn starlette
    cd src
    javac -cp ../compiled/json.jar -d ../compiled UserService/*.java
    javac -cp ../compiled/json.jar -d ../compiled ProductService/*.java
    javac -cp ../compiled/json.jar:../compiled/. -d ../compiled OrderService/*.java
    mkdir -p ../compiled/ISCS
    mkdir -p ../compiled/LoadBalancer
    cp ../src/ISCS/main.py ../compiled/ISCS/
    cp ../src/loadbalancer.py ../compiled/

    mkdir -p ../docs
    javadoc -cp ../compiled/json.jar -d ../docs UserService/*.java
    javadoc -cp ../compiled/json.jar -d ../docs ProductService/*.java
    javadoc -cp ../compiled/json.jar:../compiled/. -d ../docs OrderService/*.java
    echo "...done!"
    ;;
  -u)
    echo "Starting the User service..."
    cd compiled
    java -cp .:json.jar UserService.UserService ../config.json
    ;;
  -p)
    echo "Starting the Product service..."
    cd compiled
    java -cp .:json.jar ProductService.ProductService ../config.json
    ;;
  -i)
    echo "Starting the ISC Service..."
    python3 compiled/ISCS/main.py config.json
    ;;
  -o)
    echo "Starting the Order service..."
    cd compiled
    java -cp .:json.jar OrderService.OrderService ../config.json
    ;;
  -l)
    echo "Starting the Load Balancer..."
    python3 compiled/LoadBalancer/loadbalancer.py config.json
    ;;
  -w)
    if [ $# -eq 2 ]; then
      echo "Starting the workload parser..."
      python3 workloadparser.py $2 config.json
    elif [ $# -eq 3 ]; then
      echo "Starting the workload parser..."
      python3 workloadparser.py $2 $3
    else
      echo "Invalid number of arguments. Please use -w <workloadfile> or -w <workloadfile> <configfile>"
    fi
    ;;
  *)
    echo "Invalid option. Please use -c, -u, -p, -i, -o, -l, or -w <workloadfile>, or -w <workloadfile> <configfile>"
    ;;
esac
