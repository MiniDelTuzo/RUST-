# 🎤 Configurador de Canales de Voz

Una nueva feature que te permite cambiar entre canales de voz desde el juego usando comandos simples.

## **¿Cómo funciona?**

### **Paso 1: Configurar los canales en Discord**

Usa el comando slash en Discord:
```
/voicechannels
```

Se abrirá un menú interactivo donde puedes:
- **Seleccionar qué canal asignar a VOZ 1**
- **Seleccionar qué canal asignar a VOZ 2**
- **Seleccionar qué canal asignar a VOZ 3** (opcional)

**Ejemplo de configuración:**
```
1️⃣ VOZ 1 → General
2️⃣ VOZ 2 → Farming
3️⃣ VOZ 3 → PvP
```

---

### **Paso 2: Cambiar de canal desde el juego**

Desde el **chat de equipo en Rust**, usa:

```
!voice1    → Te mueve a VOZ 1
!voice2    → Te mueve a VOZ 2
!voice3    → Te mueve a VOZ 3
```

**Ejemplo:**
```
[TEAM] Tomas: !voice1
[BOT] ✅ Tomas se movió a VOZ 1 (General)
```

---

## **Características**

✅ **Fácil configuración** - Menu interactivo en Discord  
✅ **Dinámica** - Puedes cambiar los canales cuando quieras  
✅ **Flexible** - Usa 2, 3 o más canales  
✅ **Rápida** - Cambia de canal en 1 segundo  
✅ **Notificaciones** - Todo el equipo ve quién se cambió  

---

## **Casos de Uso**

| Escenario | Canales |
|-----------|---------|
| **Pequeño clan** | General, Farming |
| **Clanes medianos** | General, Farming, PvP, Base |
| **Streams** | Stream, Privado, AFK |
| **Turnos** | Turno 1, Turno 2, Turno 3 |

---

## **Comandos Disponibles**

### **Discord (Slash Commands)**

```
/voicechannels          → Abre el configurador
```

### **En el Juego (Chat de Equipo)**

```
!voice1                 → Cambiar a VOZ 1
!voice2                 → Cambiar a VOZ 2
!voice3                 → Cambiar a VOZ 3
```

---

## **Requisitos**

- El bot debe tener **permiso para mover miembros en canales de voz**
- Tu usuario debe estar en el servidor Discord
- Los canales deben estar configurados con `/voicechannels`

---

## **Solución de Problemas**

### ❌ "VOZ 1 no está configurada"
**Solución:** Usa `/voicechannels` en Discord para configurar los canales.

### ❌ "No se pudo encontrar tu perfil en Discord"
**Solución:** Asegúrate de que tu cuenta Steam está vinculada con Discord.

### ❌ "El bot no tiene permisos"
**Solución:** Asegúrate de que el bot tiene el permiso "Move Members" en los canales de voz.

---

## **Ejemplos Prácticos**

### **Configurar 2 canales rápidos**
```
/voicechannels
→ Selecciona "General" para VOZ 1
→ Selecciona "Farming" para VOZ 2
```

Ahora desde el juego:
```
!voice1   → General (chat calmado)
!voice2   → Farming (coordinación)
```

### **Cambio rápido durante el juego**
```
En el chat de equipo:
!voice2        ← Te cambias a Farming
⏳ [1 segundo]
✅ Listo en el nuevo canal
```

---

## **Tips y Trucos**

💡 **Naming Convention** - Usa nombres cortos para los canales: "Gen", "Farm", "PvP"  
💡 **Permisos** - Solo admin puede usar `/voicechannels`  
💡 **Notificaciones** - El equipo verá en qué canal estás ahora  
💡 **Flexible** - Cambia la configuración cuando quieras sin reiniciar el bot  

---

## **¿Preguntas o Sugerencias?**

Esta feature es nueva. Si encuentras bugs o tienes ideas, comunícalo al admin del bot.
