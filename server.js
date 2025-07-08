const express = require('express');
const fs = require('fs/promises');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const port = process.argv[2] || 5000;
const romPath = process.argv[3];

if (!romPath) {
  console.error("no rom file");
  process.exit(1);
}

// Статика
app.use('/jsnes/source', express.static(path.join(__dirname, 'jsnes/source')));
app.use('/jsnes/lib', express.static(path.join(__dirname, 'jsnes/lib')));

// Главная страница
app.get('/', async (req, res) => {
  const indexHtml = await fs.readFile(path.join(__dirname, 'index.html'));
  res.send(indexHtml.toString());
});

// ROM отдача
app.get('/rom', (req, res) => {
  res.sendFile(path.resolve(romPath));
});

// Создаём HTTP + WebSocket сервер
const server = http.createServer(app);
const wss = new WebSocket.Server({
  server,
});

const pairs = new Map(); // ws -> partner
const lock = new Set();  // хранит ws без пары

// Статистика
const maxPLayers = parseInt(process.argv[4]) || 4;
console.log(process.argv[4]);
const room = [];
let totalBytesReceived = 0;
let totalBytesSent = 0;

// Вывод статистики каждые 10 сек
setInterval(() => {
  console.log(`[Traffic] Received: ${totalBytesReceived} B | Sent: ${totalBytesSent} B`);
}, 10000);

// Heartbeat (опросник)
function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', (ws) => {
  console.log('connect');

  ws.isAlive = true;
  ws.on('pong', heartbeat);

  room.push(ws);
  if (room.length === maxPLayers) {
    room.forEach((ws, id) => {
      ws.send(`join ${id + 1}`);
    });
  }

  ws.on('message', (data, isBinary) => {
    const size = isBinary ? data.byteLength : Buffer.byteLength(data);
    totalBytesReceived += size;
    if (!isBinary && Buffer.isBuffer(data)) {
      var parts = data.toString().split(" ");
      var cmd = parts[0];
      if (cmd === 'keyup' || cmd === 'keydown') {
        const peer = room[0];
        if (peer && peer.readyState === WebSocket.OPEN) {
          peer.send(data, { binary: isBinary });
          totalBytesSent += size;
        }
      }
    } else if (!isBinary) {
      room.forEach((peer) => {
        if (peer && peer.readyState === WebSocket.OPEN) {
          peer.send(data, { binary: isBinary });
          totalBytesSent += size;
        }
      });
    } else {
      room.forEach((peer, id) => {
        if (peer && peer.readyState === WebSocket.OPEN && id !== 0) {
          peer.send(data, { binary: isBinary });
          totalBytesSent += size;
        }
      });
    }
  });

  ws.on('close', () => {
    console.log('disconnect');
    const id = room.indexOf(ws);
    if (id !== -1) room.splice(id, 1);
    room.forEach((peer) => {
      if (peer && peer.readyState === WebSocket.OPEN) {
        console.log('stop');
        peer.send('part');
      }
    });

    console.log(`[Session ended] Current total traffic: Received ${totalBytesReceived} B, Sent ${totalBytesSent} B`);
  });
});

// Периодический опросник (heartbeat)
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      ws.terminate();
      return;
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 10000); // каждые 10 секунд

wss.on('close', function close() {
  clearInterval(interval);
});

server.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
