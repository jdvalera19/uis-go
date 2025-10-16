# Guía de Instalación - ChatBot Estudiantil

## 📋 Requisitos Previos

### Para el desarrollo móvil:
- Node.js (versión 16 o superior)
- npm o yarn
- Expo CLI: `npm install -g @expo/cli`
- Cuenta de Expo (gratuita)
- Android Studio (para Android) o Xcode (para iOS)

### Para el backend:
- Node.js (versión 16 o superior)
- MongoDB (opcional, se puede usar base de datos en memoria)
- Cuenta de OpenAI para la API de GPT

## 🚀 Instalación Paso a Paso

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/estudiantil-chatbot.git
cd estudiantil-chatbot
```

### 2. Configurar el Backend

```bash
# Navegar al directorio del backend
cd backend

# Instalar dependencias
npm install

# Crear archivo de configuración
cp env.example .env

# Editar el archivo .env con tus configuraciones
nano .env
```

**Configuración del archivo .env:**
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=tu-clave-secreta-super-segura
OPENAI_API_KEY=tu-clave-de-openai
```

### 3. Iniciar el Backend

```bash
# En el directorio backend/
npm start

# O para desarrollo con auto-reload
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

### 4. Configurar la Aplicación Móvil

```bash
# Volver al directorio raíz
cd ..

# Instalar dependencias de la app móvil
npm install

# Iniciar el servidor de desarrollo
npm start
```

### 5. Configurar Variables de Entorno de la App

Crear un archivo `.env` en la raíz del proyecto:

```env
API_BASE_URL=http://localhost:3000/api
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### 6. Ejecutar en Dispositivo/Emulador

#### Para Android:
```bash
npm run android
```

#### Para iOS:
```bash
npm run ios
```

#### Para Web (desarrollo):
```bash
npm run web
```

## 🔧 Configuración Adicional

### Configurar OpenAI
1. Crear cuenta en [OpenAI](https://openai.com)
2. Generar una API key
3. Agregar la clave al archivo `.env` del backend

### Configurar Base de Datos (Opcional)
Si quieres usar MongoDB en lugar de la base de datos en memoria:

1. Instalar MongoDB
2. Configurar la URI en el archivo `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/estudiantil-chatbot
```

### Configurar Notificaciones Push (Opcional)
1. Crear proyecto en Firebase
2. Descargar `google-services.json` (Android) y `GoogleService-Info.plist` (iOS)
3. Configurar en el proyecto

## 📱 Pruebas en Dispositivo Real

### Android
1. Instalar Expo Go desde Google Play Store
2. Escanear el código QR que aparece en la terminal
3. La app se abrirá automáticamente

### iOS
1. Instalar Expo Go desde App Store
2. Escanear el código QR que aparece en la terminal
3. La app se abrirá automáticamente

## 🛠️ Desarrollo

### Estructura del Proyecto
```
estudiantil-chatbot/
├── src/                    # Código fuente de la app móvil
│   ├── components/         # Componentes reutilizables
│   ├── contexts/          # Contextos de React
│   ├── screens/           # Pantallas de la app
│   ├── services/          # Servicios y APIs
│   └── store/             # Redux store
├── backend/               # Servidor backend
├── admin-dashboard/        # Dashboard de administración
└── assets/                # Recursos estáticos
```

### Comandos Útiles

```bash
# Limpiar caché de Expo
expo start --clear

# Construir para producción
expo build:android
expo build:ios

# Publicar actualización
expo publish
```

## 🐛 Solución de Problemas

### Error de permisos en Android
```bash
# Ejecutar con permisos de administrador
sudo npm start
```

### Error de conexión con el backend
1. Verificar que el backend esté ejecutándose
2. Verificar la URL en el archivo `.env`
3. Verificar que no haya firewall bloqueando el puerto 3000

### Error de dependencias
```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules
npm install
```

## 📚 Recursos Adicionales

- [Documentación de Expo](https://docs.expo.dev/)
- [Documentación de React Native](https://reactnative.dev/)
- [Documentación de OpenAI](https://platform.openai.com/docs)
- [Documentación de Redux Toolkit](https://redux-toolkit.js.org/)

## 🤝 Soporte

Si encuentras algún problema:

1. Revisar los logs en la consola
2. Verificar que todas las dependencias estén instaladas
3. Verificar la configuración de las variables de entorno
4. Crear un issue en el repositorio de GitHub

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

