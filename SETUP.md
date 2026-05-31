# 🚀 GUÍA DE INSTALACIÓN - rustplusplus Bot

## **REQUISITOS**
- Node.js v18+ ([Descargar aquí](https://nodejs.org/))
- Git ([Descargar aquí](https://git-scm.com/))
- Un servidor Discord (con permisos de admin)
- Credenciales de Rust+ Bot de Discord

---

## **1️⃣ CLONAR EL BOT**

```bash
git clone https://github.com/TU_USUARIO/rustplusplus.git
cd rustplusplus
```

---

## **2️⃣ INSTALAR DEPENDENCIAS**

```bash
npm install
```

---

## **3️⃣ CONFIGURAR CREDENCIALES**

1. **Copiar archivo de ejemplo**:
```bash
cp .env.example .env
```

2. **Editar `.env`** con tus credenciales:
```bash
# En Windows
notepad .env

# En Mac/Linux
nano .env
```

3. **Llenar los valores**:
```env
# Discord Bot Credentials
RPP_DISCORD_CLIENT_ID=tu_client_id_aqui
RPP_DISCORD_TOKEN=tu_bot_token_aqui

# Configuración General (Opcional)
RPP_LANGUAGE=es
RPP_POLLING_INTERVAL=10000
RPP_RECONNECT_INTERVAL=15000
```

⚠️ **IMPORTANTE**: **NUNCA** compartas el contenido de `.env`. Cada persona debe tener el suyo.

---

## **4️⃣ VERIFICAR CONFIGURACIÓN**

```bash
npm test
```

Si ves ✅ sin errores, está listo.

---

## **5️⃣ EJECUTAR EL BOT**

```bash
npm start
```

Deberías ver en consola:
```
✅ Bot conectado como: rustplusplus#1234
✅ Esperando credenciales de Rust+...
```

---

## **📁 ESTRUCTURA IMPORTANTE**

```
rustplusplus/
├── .env                 ← TUS CREDENCIALES (NO SUBIR A GIT)
├── .gitignore           ← Archivos ignorados
├── config/              ← Configuración
├── credentials/         ← Datos de Rust+ (NO SUBIR)
├── src/                 ← Código fuente
├── docs/                ← Documentación
└── package.json         ← Dependencias
```

---

## **⚠️ SEGURIDAD - IMPORTANTE**

- ✅ `.env` está en `.gitignore` (no se sube a GitHub)
- ✅ Nunca compartas tu token de Discord
- ✅ Nunca pushes la carpeta `credentials/`
- ✅ Cada persona necesita sus propias credenciales

---

## **🐛 TROUBLESHOOTING**

### Error: "Cannot find module 'discord.js'"
```bash
npm install
```

### Error: "DISCORD_TOKEN is not defined"
- Verifica que `.env` existe
- Revisa que las credenciales estén bien

### Bot conecta pero no responde
- Verifica permisos del bot en Discord
- Comprueba que tiene permisos de "Send Messages"

---

## **📞 SOPORTE**

Si hay problemas:
1. Revisa los logs en carpeta `logs/`
2. Verifica que Node.js esté instalado: `node --version`
3. Comprueba conexión a Discord

---

**¡Listo!** El bot debería estar funcionando 🎉
