# 🎓 ChatBot Estudiantil - Aplicación de IA Educativa

Una aplicación móvil inteligente diseñada específicamente para el entorno estudiantil, con funcionalidades de gamificación y aprendizaje interactivo.

## 📱 Características Principales

### 💬 Chat Inteligente
- Interfaz similar a ChatGPT con diseño moderno
- Soporte para mensajes de texto, voz e imágenes
- Reconocimiento de voz (speech-to-text)
- Síntesis de voz (text-to-speech)
- Lectura de imágenes con OCR
- Historial de conversaciones

### 🎮 Sistema de Gamificación
- **Créditos:** Sistema de puntos para usar el chat
- **Niveles:** Progresión basada en experiencia
- **Actividades:** Quiz, eventos y interacciones
- **Logros:** Medallas y reconocimientos
- **Ranking:** Competencia saludable entre estudiantes

### 🧠 Análisis Inteligente
- **Detección de vocación:** Identifica intereses estudiantiles
- **Áreas de refuerzo:** Detecta materias con dificultades
- **Variabilidad emocional:** Monitorea bienestar estudiantil
- **Detección de agotamiento:** Alertas preventivas

### 📚 Recomendaciones Educativas
- Fuentes universitarias específicas
- Materiales de estudio personalizados
- Conexión con recursos institucionales

## 🛠️ Tecnologías

- **Frontend:** React Native + Expo
- **Backend:** Node.js + Express
- **IA:** OpenAI GPT-3.5/4
- **Base de datos:** MongoDB (opcional)
- **Autenticación:** JWT
- **Estado:** Redux Toolkit

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v16+)
- npm o yarn
- Expo CLI
- Xcode (para iOS)
- Android Studio (para Android)

### 1. Clonar el repositorio
```bash
git clone git@github.com:AndresCast98/APPCHATBOT-V.1.git
cd APPCHATBOT-V.1
```

### 2. Instalar dependencias
```bash
# Backend
cd backend
npm install

# Frontend
cd ..
npm install
```

### 3. Configurar variables de entorno
```bash
# Backend
cd backend
cp env.example .env
# Editar .env con tus configuraciones
```

### 4. Configurar OpenAI
1. Obtén tu API key de [OpenAI](https://openai.com)
2. Agrega tu clave al archivo `backend/.env`:
```env
OPENAI_API_KEY=tu-clave-aqui
```

### 5. Ejecutar la aplicación

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📱 Uso en Xcode

### Para desarrollo iOS:
1. Abre Xcode
2. Ejecuta `npm run ios`
3. El simulador se abrirá automáticamente
4. La app se cargará en el simulador

### Para dispositivo físico:
1. Conecta tu iPhone
2. Ejecuta `npm run ios`
3. Selecciona tu dispositivo en Xcode
4. La app se instalará en tu iPhone

## 🎯 Funcionalidades por Nivel Educativo

### Universidad (2 categorías)
- **Académico:** Preguntas sobre áreas de estudio
- **Carrera:** Orientación vocacional y desarrollo profesional

### Bachillerato (3 categorías)
- **Académico:** Materias y rendimiento escolar
- **Carrera:** Orientación vocacional
- **Emocional:** Bienestar estudiantil y manejo del estrés

## 🔧 Configuración Avanzada

### Variables de Entorno
```env
# Backend
PORT=3000
NODE_ENV=development
JWT_SECRET=tu-clave-secreta
OPENAI_API_KEY=tu-clave-openai
MONGODB_URI=mongodb://localhost:27017/estudiantil-chatbot

# Frontend
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### Base de Datos
```bash
# MongoDB (opcional)
brew install mongodb
brew services start mongodb
```

## 📊 Dashboard de Administración

Accede al panel de administración en:
```
http://localhost:3000/admin
```

Funcionalidades:
- Gestión de usuarios
- Creación de actividades
- Análisis de datos
- Configuración del sistema

## 🚀 Despliegue

### Heroku (Backend)
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Crear app
heroku create tu-app-chatbot

# Configurar variables
heroku config:set OPENAI_API_KEY=tu-clave

# Desplegar
git push heroku main
```

### Expo (Frontend)
```bash
# Build para producción
expo build:ios
expo build:android

# Publicar actualización
expo publish
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico:
- Email: soporte@estudiantil-chatbot.com
- GitHub Issues: [Crear un issue](https://github.com/AndresCast98/APPCHATBOT-V.1/issues)

## 🙏 Agradecimientos

- OpenAI por la API de GPT
- Expo por el framework de desarrollo
- React Native por la plataforma móvil
- La comunidad de desarrolladores

---

**Desarrollado con ❤️ para la educación estudiantil**