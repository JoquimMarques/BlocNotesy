const express = require('express');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');
const bcrypt = require('bcrypt');
const app = express();
const users = {};  // Simples armazenamento em memória

app.use(express.json());

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users[username];

    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ username }, 'secret_key', { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).send('Login falhou');
    }
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        return res.status(409).send('Usuário já existe');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    users[username] = { username, password: hashedPassword };
    res.status(201).send('Usuário registrado');
});

const server = app.listen(3000, () => console.log('Servidor rodando na porta 3000'));

const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
    ws.on('message', message => {
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});