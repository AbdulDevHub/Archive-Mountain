@echo off
REM windows_runme.bat
REM
REM Windows equivalent of runme.sh. Run from PowerShell or Command Prompt.
REM
REM Usage:
REM   .\windows_runme.bat -c          set up Python environment
REM   .\windows_runme.bat -u          start UserService
REM   .\windows_runme.bat -p          start ProductService
REM   .\windows_runme.bat -i          start ISCS
REM   .\windows_runme.bat -o          start 4 OrderService workers
REM   .\windows_runme.bat -w <file>   run workload parser

REM %~dp0 = the directory this .bat file lives in (with trailing backslash).
REM We cd into it so the script works regardless of where you run it from.
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

set CONFIG=%SCRIPT_DIR%config.json

REM Detect uv vs plain python
where uv >nul 2>&1
if %errorlevel% == 0 (
    set PYTHON=uv run python
) else (
    set PYTHON=python
)

REM Parse the flag argument
set FLAG=%1

if "%FLAG%"=="-c" goto compile
if "%FLAG%"=="-u" goto user
if "%FLAG%"=="-p" goto product
if "%FLAG%"=="-i" goto iscs
if "%FLAG%"=="-o" goto order
if "%FLAG%"=="-w" goto workload
goto usage

REM ── -c : set up environment ────────────────────────────────────────────────
:compile
echo Setting up Python environment...
where uv >nul 2>&1
if %errorlevel% == 0 (
    uv sync
    echo Environment ready (uv).
) else (
    python -m venv .venv
    call .venv\Scripts\activate.bat
    pip install --quiet fastapi uvicorn asyncpg redis aiohttp httpx
    echo Environment ready (pip venv).
)
echo No compilation step required (Python source = compiled).
goto end

REM ── -u : UserService ───────────────────────────────────────────────────────
:user
echo Starting UserService on port 8001...
%PYTHON% src\UserService\user_service.py "%CONFIG%"
goto end

REM ── -p : ProductService ────────────────────────────────────────────────────
:product
echo Starting ProductService on port 8002...
%PYTHON% src\ProductService\product_service.py "%CONFIG%"
goto end

REM ── -i : ISCS ──────────────────────────────────────────────────────────────
:iscs
echo Starting ISCS on port 8080...
%PYTHON% src\ISCS\iscs.py "%CONFIG%"
goto end

REM ── -o : OrderService (4 workers) ─────────────────────────────────────────
:order
echo Starting 4 OrderService workers on ports 8010-8013...
echo (nginx on port 8000 load balances across them)
echo.

REM Write a temporary config for each worker with its own port,
REM then launch each in a new terminal window with `start`.
REM
REM `start "title" cmd /k command` opens a new Command Prompt window
REM and keeps it open after the command finishes (/k = keep open).
REM The title is what appears in the window's title bar.

for %%P in (8010 8011 8012 8013) do (
    set WORKER_CONFIG=%TEMP%\order_worker_%%P.json
    %PYTHON% -c "import json; cfg=json.load(open('%CONFIG%')); cfg['OrderService']['port']=%%P; json.dump(cfg, open(r'%TEMP%\order_worker_%%P.json','w'))"
    start "OrderService :%%P" cmd /k "%PYTHON% src\OrderService\order_service.py %TEMP%\order_worker_%%P.json"
)

echo.
echo All 4 workers launched in separate windows.
echo nginx on port 8000 distributes requests across them.
echo Close those windows to stop the workers.
goto end

REM ── -w : workload parser ───────────────────────────────────────────────────
:workload
if "%2"=="" (
    echo Usage: windows_runme.bat -w ^<workload_file^>
    exit /b 1
)
echo Running workload: %2
%PYTHON% workloadparser.py "%CONFIG%" "%2"
goto end

REM ── usage ──────────────────────────────────────────────────────────────────
:usage
echo Usage:
echo   windows_runme.bat -c              Set up Python environment
echo   windows_runme.bat -u              Start UserService
echo   windows_runme.bat -p              Start ProductService
echo   windows_runme.bat -i              Start ISCS
echo   windows_runme.bat -o              Start 4 OrderService workers
echo   windows_runme.bat -w ^<file^>       Run workload parser
exit /b 1

:end