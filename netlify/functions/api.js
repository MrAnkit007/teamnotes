const express = require('express');
const serverless = require('serverless-http');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require('path');
const session = require('express-session');
const { Low, JSONFile } = require('lowdb');

const adapter = new JSONFile(path.join(__dirname, '../database/db.json'));
const db = new Low(adapter);

(async () => {
  await db.read();
  db.data = db.data || { users: [], notes: [] };
  await db.write();
})();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
}));

app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/register', async (req, res) => {
  const { username, password, accessCode } = req.body;
  if (accessCode !== '2020') {
    return res.status(400).send('Invalid access code');
  }
  const userExists = db.data.users.find(user => user.username === username);
  if (userExists) {
    return res.status(400).send('User already exists');
  }
  db.data.users.push({ username, password });
  await db.write();
  res.status(201).send('User created');
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.data.users.find(user => user.username === username && user.password === password);
  if (user) {
    req.session.user = user;
    res.send('Logged in');
  } else {
    res.status(401).send('Invalid credentials');
  }
});

app.get('/api/logout', (req, res) => {
  req.session.destroy();
  res.send('Logged out');
});

app.get('/', (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, '../public/app.html'));
  } else {
    res.sendFile(path.join(__dirname, '../public/login.html'));
  }
});

app.get('/api/notes', (req, res) => {
  const notes = db.data.notes.filter(note => note.type === 'team' || note.createdBy === req.session.user.username);
  res.json(notes);
});

app.post('/api/notes', async (req, res) => {
  const { title, content, urgency, status, assignedTo } = req.body;
  const newNote = {
    id: Date.now().toString(),
    title,
    content,
    urgency,
    status,
    assignedTo,
    createdBy: req.session.user.username,
  };
  db.data.notes.push(newNote);
  await db.write();
  io.emit('note created', newNote);
  res.status(201).json(newNote);
});

app.put('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, urgency, status, assignedTo } = req.body;
  const note = db.data.notes.find(note => note.id === id);
  if (note) {
    note.title = title;
    note.content = content;
    note.urgency = urgency;
    note.status = status;
    note.assignedTo = assignedTo;
    await db.write();
    io.emit('note updated', note);
    res.json(note);
  } else {
    res.status(404).send('Note not found');
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  const index = db.data.notes.findIndex(note => note.id === id);
  if (index !== -1) {
    const deletedNote = db.data.notes.splice(index, 1);
    await db.write();
    io.emit('note deleted', id);
    res.json(deletedNote);
  } else {
    res.status(404).send('Note not found');
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('new note', (note) => {
    socket.broadcast.emit('new note', note);
  });

  socket.on('update note', (note) => {
    socket.broadcast.emit('update note', note);
  });

  socket.on('delete note', (id) => {
    socket.broadcast.emit('delete note', id);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

module.exports.handler = serverless(app);
