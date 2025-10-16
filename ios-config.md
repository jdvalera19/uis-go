# 🍎 Configuración para Xcode

## Pasos para ejecutar en Xcode

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar Metro Bundler
```bash
npx expo start
```

### 3. Abrir en Xcode
```bash
npx expo run:ios
```

### 4. Configuración en Xcode

#### Configurar Bundle Identifier:
1. Abre el proyecto en Xcode
2. Selecciona el target principal
3. Ve a "Signing & Capabilities"
4. Cambia el Bundle Identifier a: `com.tuempresa.estudiantil-chatbot`

#### Configurar Team de Desarrollo:
1. En "Signing & Capabilities"
2. Selecciona tu Apple Developer Team
3. Asegúrate de que "Automatically manage signing" esté activado

#### Configurar Permisos:
1. Ve a Info.plist
2. Agrega los permisos necesarios:
```xml
<key>NSCameraUsageDescription</key>
<string>Esta app necesita acceso a la cámara para tomar fotos</string>
<key>NSMicrophoneUsageDescription</key>
<string>Esta app necesita acceso al micrófono para grabación de voz</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Esta app necesita acceso a la galería para seleccionar imágenes</string>
```

### 5. Ejecutar en Simulador
1. Selecciona un simulador de iOS
2. Presiona el botón "Run" (▶️)
3. La app se compilará y ejecutará

### 6. Ejecutar en Dispositivo Físico
1. Conecta tu iPhone via USB
2. Selecciona tu dispositivo en Xcode
3. Presiona "Run"
4. Acepta los permisos en tu iPhone

## Solución de Problemas

### Error de Bundle Identifier:
- Cambia el Bundle Identifier a algo único
- Ejemplo: `com.tuempresa.estudiantil-chatbot`

### Error de Signing:
- Asegúrate de tener un Apple Developer Account
- Configura tu Team en Xcode

### Error de Permisos:
- Verifica que todos los permisos estén en Info.plist
- Reinicia el simulador si es necesario

### Error de Metro:
```bash
npx expo start --clear
```

### Error de Dependencias:
```bash
rm -rf node_modules
npm install
```

## Comandos Útiles

```bash
# Limpiar caché
npx expo start --clear

# Reset completo
npx expo start --reset-cache

# Ver logs
npx expo start --verbose

# Build para producción
npx expo build:ios
```
