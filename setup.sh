#!/bin/bash
# Setup automático para rustplusplus Bot
# Uso: bash setup.sh o ./setup.sh

echo "🚀 SETUP AUTOMÁTICO - rustplusplus Bot"
echo "========================================"
echo ""

# Paso 1: Instalar dependencias
echo "📦 Instalando dependencias..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi
echo "✅ Dependencias instaladas"
echo ""

# Paso 2: Crear .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo "✅ Archivo .env creado (copia desde .env.example)"
    echo ""
    echo "⚠️  SIGUIENTE PASO:"
    echo "   Edita el archivo .env y agrega tus credenciales:"
    echo ""
    echo "   RPP_DISCORD_CLIENT_ID=tu_id_aqui"
    echo "   RPP_DISCORD_TOKEN=tu_token_aqui"
    echo ""
else
    echo "✅ Archivo .env ya existe"
fi

# Paso 3: Verificar credenciales
echo ""
echo "🔍 Verificando configuración..."
if grep -q "your_" .env; then
    echo "⚠️  IMPORTANTE: Actualiza los valores en .env"
    echo "   Los valores default aún están presentes"
else
    echo "✅ Credenciales configuradas"
fi

# Paso 4: Crear directorios necesarios
echo ""
echo "📁 Creando directorios..."
mkdir -p credentials
mkdir -p instances
mkdir -p logs
mkdir -p maps
echo "✅ Directorios creados"

# Paso 5: Mensaje final
echo ""
echo "========================================"
echo "✅ SETUP COMPLETADO"
echo "========================================"
echo ""
echo "🎯 Para ejecutar el bot:"
echo "   npm start"
echo ""
echo "📖 Para más info:"
echo "   Revisa SETUP.md"
echo ""
