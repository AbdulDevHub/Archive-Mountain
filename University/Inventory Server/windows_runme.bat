@echo off

set CLASSPATH=.;compiled\json.jar
set CONFIG_PATH=config.json
set SRC_PATH=src
set COMPILED_PATH=compiled
set DOCS_PATH=docs
set ISCS_PATH=ISCS\main.py
set LOADBALANCER_PATH=LoadBalancer\loadbalancer.py

if "%1" == "-c" (
    echo Compiling source code...
    pip install fastapi httpx uvicorn starlette
    cd %SRC_PATH%
    javac -cp ..\compiled\json.jar -d ..\%COMPILED_PATH% UserService\*.java
    javac -cp ..\compiled\json.jar -d ..\%COMPILED_PATH% ProductService\*.java
    javac -cp ..\compiled\json.jar;..\%COMPILED_PATH% -d ..\%COMPILED_PATH% OrderService\*.java
    mkdir ..\%COMPILED_PATH%\ISCS
    mkdir ..\%COMPILED_PATH%\LoadBalancer
    xcopy /E /I /Y ..\src\ISCS\main.py ..\%COMPILED_PATH%\ISCS\
    xcopy /E /I /Y ..\src\%LOADBALANCER_PATH% ..\%COMPILED_PATH%\LoadBalancer\
    mkdir %DOCS_PATH%
    javadoc -cp ..\compiled\json.jar -d ..\%DOCS_PATH% UserService\*.java
    javadoc -cp ..\compiled\json.jar -d ..\%DOCS_PATH% ProductService\*.java
    javadoc -cp ..\compiled\json.jar;..\%COMPILED_PATH% -d ..\%DOCS_PATH% OrderService\*.java
    echo ...done!
    cd ..
)

if "%1" == "-u" (
    echo Starting the User service...
    cd %COMPILED_PATH%
    java -cp .;json.jar UserService.UserService ..\%CONFIG_PATH%
    cd ..
)

if "%1" == "-p" (
    echo Starting the Product service...
    cd %COMPILED_PATH%
    java -cp .;json.jar ProductService.ProductService ..\%CONFIG_PATH%
    cd ..
)

if "%1" == "-i" (
    echo Starting the ISC Service...
    python %COMPILED_PATH%\%ISCS_PATH% %CONFIG_PATH%
)

if "%1" == "-o" (
    echo Starting the Order service...
    cd %COMPILED_PATH%
    java -cp .;json.jar OrderService.OrderService ..\%CONFIG_PATH%
    cd ..
)

if "%1" == "-l" (
    echo Starting the Load Balancer...
    python %COMPILED_PATH%\%LOADBALANCER_PATH% %CONFIG_PATH%
)

if "%1" == "-w" (
    if "%~2" NEQ "" (
        echo Starting the workload parser...
        python workloadparser.py %~2 %CONFIG_PATH%
    ) else (
        echo Invalid number of arguments. Please use -w <workloadfile>
    )
)

if "%1" == "" (
    echo Invalid option. Please use -c, -u, -p, -i, -o, or -w <workloadfile>
)