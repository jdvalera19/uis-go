const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OpenAI } = require('openai');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

// Modelos de MongoDB (reemplazando la base de datos en memoria)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  credits: { type: Number, default: 100 },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', UserSchema);

const MessageSchema = new mongoose.Schema({
  text: String,
  user: {
    _id: { type: String, required: true },
    name: String,
  },
  createdAt: { type: Date, default: Date.now },
  image: String,
  audio: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Referencia al usuario real
});
const Message = mongoose.model('Message', MessageSchema);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por IP
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
});
app.use('/api/', limiter);

// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, userPayload) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = userPayload; // El payload del token contiene userId y email
    next();
  });
};

// Rutas de autenticación
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validaciones
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el usuario ya existe en la BD
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario en la BD
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      // Los valores por defecto se definen en el Schema
    });
    
    await newUser.save();

    // Generar token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        credits: newUser.credits,
        level: newUser.level,
        experience: newUser.experience,
        points: newUser.points,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        credits: user.credits,
        level: user.level,
        experience: user.experience,
        points: user.points,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas del chat
app.post('/api/chat/send', authenticateToken, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    const { text } = req.body;
    const imageFile = req.files?.image?.[0];
    const audioFile = req.files?.audio?.[0];

    if (!text && !imageFile && !audioFile) {
      return res.status(400).json({ error: 'Mensaje vacío' });
    }

    // Guardar mensaje del usuario en la BD
    const userMessage = new Message({
      text: text || '',
      user: {
        _id: req.user.userId,
        name: req.user.email,
      },
      createdAt: new Date(),
      image: imageFile ? imageFile.path : undefined,
      audio: audioFile ? audioFile.path : undefined,
      userId: req.user.userId
    });

    await userMessage.save();

    // Procesar con OpenAI
    let prompt = text || 'El usuario ha enviado una imagen o audio.';
    
    if (imageFile) {
      prompt += ' Analiza la imagen adjunta.';
    }
    
    if (audioFile) {
      prompt += ' Procesa el audio adjunto.';
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Eres un asistente educativo especializado en ayudar a estudiantes. Responde de manera clara, educativa y motivadora. Si el usuario envía una imagen, analízala y explica lo que ves. Si envía audio, transcribe y responde apropiadamente."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const botResponse = completion.choices[0].message.content;

    // Guardar respuesta del bot en la BD
    const botMessage = new Message({
      text: botResponse,
      user: {
        _id: 'bot',
        name: 'ChatBot Estudiantil',
      },
      createdAt: new Date(),
      userId: req.user.userId, // Asociar al usuario para filtrar historial
    });

    await botMessage.save();

    // Otorgar créditos por usar el chat
    const user = await User.findById(req.user.userId);
    if (user) {
      user.credits += 5;
      user.experience += 10;
      user.points += 5;
      await user.save();
    }

    res.json({
      text: botResponse,
      credits: user ? user.credits : 0,
    });
  } catch (error) {
    console.error('Error en chat:', error);
    res.status(500).json({ error: 'Error al procesar el mensaje' });
  }
});

app.get('/api/chat/history', authenticateToken, async (req, res) => {
  try {
    const userMessages = await Message.find({
        $or: [
            { 'user._id': req.user.userId },
            { 'user._id': 'bot', userId: req.user.userId }
        ]
    }).sort({ createdAt: 'asc' });
    res.json(userMessages);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial' });
  }
});

// Rutas de gamificación
app.get('/api/gamification/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
  
    res.json({
      credits: user.credits,
      level: user.level,
      experience: user.experience,
      points: user.points,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/gamification/activities', (req, res) => {
  // Actividades de ejemplo
  const sampleActivities = [
    {
      id: '1',
      title: 'Quiz de Matemáticas',
      description: 'Responde 10 preguntas de matemáticas básicas',
      points: 50,
      type: 'quiz',
      isActive: true,
    },
    {
      id: '2',
      title: 'Evento de Ciencia',
      description: 'Asiste al evento de ciencias en el auditorio',
      points: 100,
      type: 'event',
      isActive: true,
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      location: 'Auditorio Principal',
    },
    {
      id: '3',
      title: 'Interacción Diaria',
      description: 'Usa el chatbot por primera vez hoy',
      points: 25,
      type: 'interaction',
      isActive: true,
    },
  ];

  res.json(sampleActivities);
});

app.post('/api/gamification/complete-activity', authenticateToken, async (req, res) => {
  const { activityId } = req.body;
  
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
  
    // Simular completar actividad
    user.credits += 50;
    user.experience += 100;
    user.points += 50;
    await user.save();
  
    res.json({ success: true, credits: user.credits });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/gamification/achievements', (req, res) => {
  const sampleAchievements = [
    {
      id: '1',
      title: 'Primer Mensaje',
      description: 'Envía tu primer mensaje al chatbot',
      icon: 'chatbubble',
      points: 25,
      isUnlocked: true,
    },
    {
      id: '2',
      title: 'Estudiante Dedicado',
      description: 'Usa el chatbot por 7 días consecutivos',
      icon: 'calendar',
      points: 100,
      isUnlocked: false,
    },
    {
      id: '3',
      title: 'Experto en Chat',
      description: 'Envía 100 mensajes',
      icon: 'chatbubbles',
      points: 200,
      isUnlocked: false,
    },
  ];

  res.json(sampleAchievements);
});

app.get('/api/gamification/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find({})
      .sort({ points: -1 })
      .limit(10);
      
    const leaderboard = topUsers.map((user, index) => ({
        id: user._id,
        name: user.name,
        points: user.points,
        level: user.level,
        position: index + 1,
    }));
  
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el leaderboard' });
  }
});

// Rutas del sistema de preguntas
app.get('/api/questions', authenticateToken, (req, res) => {
  const userLevel = req.user.level || 'university';
  const userQuestions = questions.filter(q => q.level === userLevel);
  res.json(userQuestions);
});

app.post('/api/questions/answer', authenticateToken, async (req, res) => {
  try {
    const { questionId, answer } = req.body;
    
    // Guardar respuesta
    const response = {
      id: Date.now().toString(),
      userId: req.user.userId,
      questionId,
      answer,
      answeredAt: new Date().toISOString(),
      emotionalVariability: Math.random() * 10, // Simular variabilidad emocional
    };
    
    questionResponses.push(response);
    
    // Actualizar usuario con créditos
    const user = users.find(u => u.id === req.user.userId);
    if (user) {
      user.credits += 10;
      user.experience += 20;
      user.points += 10;
    }
    
    res.json({ success: true, credits: user.credits });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar respuesta' });
  }
});

app.get('/api/questions/insights', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userResponses = questionResponses.filter(r => r.userId === userId);
    
    // Detectar intereses vocacionales
    const vocationalInterests = detectVocationalInterests(userResponses);
    
    // Detectar áreas de refuerzo
    const reinforcementAreas = detectReinforcementAreas(userResponses);
    
    // Detectar agotamiento
    const isExhausted = detectExhaustion(userResponses);
    
    // Calcular variabilidad emocional
    const emotionalVariability = calculateEmotionalVariability(userResponses);
    
    res.json({
      vocationalInterests,
      reinforcementAreas,
      isExhausted,
      emotionalVariability,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular insights' });
  }
});

// Funciones auxiliares para análisis
function detectVocationalInterests(responses) {
  const interests = [];
  const vocationalResponses = responses.filter(r => 
    r.questionId.includes('vocational') || r.answer.toLowerCase().includes('carrera')
  );
  
  if (vocationalResponses.length > 0) {
    interests.push('Tecnología', 'Ciencias', 'Humanidades', 'Artes');
  }
  
  return interests;
}

function detectReinforcementAreas(responses) {
  const areas = [];
  const reinforcementResponses = responses.filter(r => 
    r.questionId.includes('reinforcement') || r.answer.toLowerCase().includes('dificultad')
  );
  
  if (reinforcementResponses.length > 0) {
    areas.push('Matemáticas', 'Ciencias', 'Lenguaje', 'Historia');
  }
  
  return areas;
}

function detectExhaustion(responses) {
  const emotionalResponses = responses.filter(r => 
    r.questionId.includes('emotional')
  );
  
  if (emotionalResponses.length === 0) return false;
  
  const avgEmotionalScore = emotionalResponses.reduce((acc, r) => 
    acc + r.emotionalVariability, 0
  ) / emotionalResponses.length;
  
  return avgEmotionalScore < 3;
}

function calculateEmotionalVariability(responses) {
  const emotionalResponses = responses.filter(r => 
    r.questionId.includes('emotional')
  );
  
  if (emotionalResponses.length === 0) return 0;
  
  return emotionalResponses.reduce((acc, r) => 
    acc + r.emotionalVariability, 0
  ) / emotionalResponses.length;
}

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});

module.exports = app;

