@echo off
REM Setup automático para rustplusplus Bot (Windows)
REM Uso: setup.bat o doble clic

cls
echo.
echo 🚀 SETUP AUTOMATICO - rustplusplus Bot
echo ========================================
echo.

REM Paso 1: Instalar dependencias
echo 📦 Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas
echo.

REM Paso 2: Crear .env si no existe
if not exist .env (
    echo 📝 Creando archivo .env...
    copy .env.example .env
    echo ✅ Archivo .env creado
    echo.
    echo ⚠️  SIGUIENTE PASO:
    echo    1. Abre el archivo .env
    echo    2. Agrega tus credenciales:
    echo.
    echo    RPP_DISCORD_CLIENT_ID=tu_id_aqui
    echo    RPP_DISCORD_TOKEN=tu_token_aqui
    echo.
) else (
    echo ✅ Archivo .env ya existe
)

REM Paso 3: Verificar credenciales
echo.
echo 🔍 Verificando configuración...
findstr /M "your_" .env >nul
if %errorlevel% equ 0 (
    echo ⚠️  IMPORTANTE: Actualiza los valores en .env
    echo    Los valores default aún están presentes
) else (
    echo ✅ Credenciales configuradas
)

REM Paso 4: Crear directorios
echo.
echo 📁 Creando directorios...
if not exist credentials mkdir credentials
if not exist instances mkdir instances
if not exist logs mkdir logs
if not exist maps mkdir maps
echo ✅ Directorios creados

REM Paso 5: Mensaje final
echo.
echo ========================================
echo ✅ SETUP COMPLETADO
echo ========================================
echo.
echo 🎯 Para ejecutar el bot:
echo    npm start
echo.
echo 📖 Para más info:
echo    Lee SETUP.md
echo.
pause
