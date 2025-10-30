const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Base de datos en memoria
let users = [];
let messages = [];

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, 'secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rutas de autenticación
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      credits: 100,
      level: 1,
      experience: 0,
      points: 0,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: newUser.id,
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

    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'secret',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
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
app.post('/api/chat/send', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Mensaje vacío' });
    }

    // Simular respuesta del bot
    const botResponse = `Hola! Soy tu asistente educativo. Has preguntado: "${text}". Esta es una respuesta simulada. En producción, aquí se integraría con OpenAI GPT.`;

    res.json({
      text: botResponse,
      credits: 95 // Simular gasto de créditos
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar el mensaje' });
  }
});

app.get('/api/chat/history', authenticateToken, (req, res) => {
  const userMessages = messages.filter(msg => 
    msg.userId === req.user.userId
  );
  res.json(userMessages);
});

// Rutas de gamificación
app.get('/api/gamification/stats', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  res.json({
    credits: user.credits,
    level: user.level,
    experience: user.experience,
    points: user.points,
  });
});

app.get('/api/gamification/activities', (req, res) => {
  const activities = [
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
    }
  ];

  res.json(activities);
});

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log(`API disponible en: http://localhost:${PORT}/api`);
});
