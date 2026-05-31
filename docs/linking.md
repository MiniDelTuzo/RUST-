# 🔗 Sistema de Vinculación Discord ↔ Rust

## Flujo Rápido

### Paso 1: Vincular en Rust (en-juego)
```
!link
```
**Respuesta del bot:**
```
✅ TuNombre

📝 Tu código de vinculación: ABC123

En Discord, usa:
/link ABC123

⏱️ Válido por 10 minutos.
```

### Paso 2: Vincular en Discord
En Discord ejecuta:
```
/link ABC123
```

**Respuesta:**
```
✅ ¡Vinculación completada!

🎮 Steam ID: 76561199792604214
📛 Discord: TuNombre#1234

Ya puedes usar comandos de voz: !voz1, !voz2, etc.
```

### Paso 3: Usar comandos de voz desde Rust
Ya vinculado, en chat de Rust:
```
!voz1
!voz2
!gaming
```

---

## Comandos Disponibles

### En Rust
| Comando | Función |
|---------|---------|
| `!link` | Genera un código de vinculación (válido 10 min) |
| `!voz1` | Mueve al canal de voz "voz1" |
| `!voz2` | Mueve al canal de voz "voz2" |
| `!gaming` | Mueve al canal de voz "gaming" |

### En Discord
| Comando | Función |
|---------|---------|
| `/link <código>` | Vincula tu cuenta con el código de Rust |
| `/mylink` | Muestra tu vinculación actual |
| `/voicechannels add <id> <nombre>` | Configura un canal de voz |
| `/voicechannels list` | Muestra canales configurados |
| `/voicechannels remove <nombre>` | Elimina un canal configurado |
| `/setupvoice` | Configura múltiples canales a la vez |

---

## ¿Qué hacer si...?

### El código expiró
Ejecuta nuevamente `!link` en Rust

### No me vinculé correctamente
1. Comprueba con `/mylink` en Discord
2. Si no aparece, repite: `!link` → `/link <código>`

### El bot no me mueve de canal
1. ¿Estás vinculado? Usa `/mylink` para verificar
2. ¿Estás en Discord? Debe estar en el servidor
3. ¿El canal existe? Usa `/voicechannels list`

### No aparece el comando en Discord
- Reinicia el bot
- Sale error del servidor Discord
- Los slash commands tardan ~5 minutos en aparecer

---

## Sistema de Configuración

### Configurar canales de una vez
```
/setupvoice config:voz1:1328328679872401515 voz2:1463716133159833682
```

### O uno a uno
```
/voicechannels add 1328328679872401515 voz1
/voicechannels add 1463716133159833682 voz2
```

### Verificar configuración
```
/voicechannels list
```

---

## Seguridad

- ✅ Los códigos expiran en **10 minutos**
- ✅ Cada código es único
- ✅ No se transmite Steam ID directamente
- ✅ Solo Discord puede vincular cuentas
- ✅ Los códigos se limpian automáticamente

---

## Troubleshooting

**Problema:** `❌ Código inválido o expirado`
- **Solución:** Ejecuta `!link` nuevamente en Rust

**Problema:** `❌ El canal para !voz1 ya no existe`
- **Solución:** 
  1. Verifica que el canal exista en Discord
  2. Ejecuta `/voicechannels list`
  3. Reconfigura con `/voicechannels add <id> voz1`

**Problema:** No se mueve al canal
- **Solución:**
  1. ¿Estás vinculado? `/mylink`
  2. ¿Estás online en Discord?
  3. ¿El bot tiene permisos de mover usuarios?

