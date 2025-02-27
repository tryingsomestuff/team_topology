// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Dossier pour les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Structure de données pour stocker les votes par équipe
let teamData = {
  "ED": { votes: 0, connections: { "SOLV": 0, "SIMU": 0, "SOFT": 0, "DATA": 0, "B2B": 0, "B2C": 0, "ADV": 0, "PM": 0, "MAT": 0, "Other": 0 } },
  "SOLV": { votes: 0, connections: { "ED": 0, "SIMU": 0, "SOFT": 0, "DATA": 0, "B2B": 0, "B2C": 0, "ADV": 0, "PM": 0, "MAT": 0, "Other": 0 } },
  "SIMU": { votes: 0, connections: { "ED": 0, "SOLV": 0, "SOFT": 0, "DATA": 0, "B2B": 0, "B2C": 0, "ADV": 0, "PM": 0, "MAT": 0, "Other": 0 } },
  "SOFT": { votes: 0, connections: { "ED": 0, "SOLV": 0, "SIMU": 0, "DATA": 0, "B2B": 0, "B2C": 0, "ADV": 0, "PM": 0, "MAT": 0, "Other": 0 } },
  "DATA": { votes: 0, connections: { "ED": 0, "SOLV": 0, "SIMU": 0, "SOFT": 0, "B2B": 0, "B2C": 0, "ADV": 0, "PM": 0, "MAT": 0, "Other": 0 } },
  "B2B": { votes: 0, connections: { "ED": 0, "SOLV": 0, "SIMU": 0, "SOFT": 0, "DATA": 0, "B2C": 0, "ADV": 0, "PM": 0, "MAT": 0, "Other": 0 } },
  "B2C": { votes: 0, connections: { "ED": 0, "SOLV": 0, "SIMU": 0, "SOFT": 0, "DATA": 0, "B2B": 0, "ADV": 0, "PM": 0, "MAT": 0, "Other": 0 } },
  "ADV": { votes: 0, connections: { "ED": 0, "SOLV": 0, "SIMU": 0, "SOFT": 0, "DATA": 0, "B2B": 0, "B2C": 0, "PM": 0, "MAT": 0, "Other": 0 } },
  "PM": { votes: 0, connections: { "ED": 0, "SOLV": 0, "SIMU": 0, "SOFT": 0, "DATA": 0, "B2B": 0, "B2C": 0, "ADV": 0, "MAT": 0, "Other": 0 } },
  "MAT": { votes: 0, connections: { "ED": 0, "SOLV": 0, "SIMU": 0, "SOFT": 0, "DATA": 0, "B2B": 0, "B2C": 0, "ADV": 0, "PM": 0, "Other": 0 } },
  "Other": { votes: 0, connections: { "ED": 0, "SOLV": 0, "SIMU": 0, "SOFT": 0, "DATA": 0, "B2B": 0, "B2C": 0, "ADV": 0, "PM": 0, "MAT": 0 } }
};

// Charger les données existantes si disponibles
try {
  const data = fs.readFileSync('team_data.json', 'utf8');
  teamData = JSON.parse(data);
  console.log('Données chargées avec succès');
} catch (err) {
  console.log('Aucune donnée existante trouvée, démarrage avec des données vides');
}

// Sauvegarder les données
function saveData() {
  fs.writeFileSync('team_data.json', JSON.stringify(teamData, null, 2), 'utf8');
  console.log('Données sauvegardées');
}

// Routes API
app.get('/api/team-data', (req, res) => {
  res.json(teamData);
});

app.post('/api/vote', (req, res) => {
  const { team, connections } = req.body;
  
  // Validation de base
  if (!team || !connections || !Array.isArray(connections)) {
    return res.status(400).json({ error: 'Données invalides' });
  }
  
  // Incrémenter le compteur de votes pour l'équipe
  teamData[team].votes++;
  
  // Mettre à jour les connections
  connections.forEach(connectedTeam => {
    if (team !== connectedTeam && teamData[team].connections[connectedTeam] !== undefined) {
      teamData[team].connections[connectedTeam]++;
      teamData[connectedTeam].connections[team]++; // Mettre à jour dans les deux sens
    }
  });
  
  // Sauvegarder les données
  saveData();
  
  // Notifier tous les clients de la mise à jour
  io.emit('data-updated', teamData);
  
  res.status(200).json({ success: true });
});

// Route pour réinitialiser les données (protégée par un code simple)
app.post('/api/reset', (req, res) => {
  const { resetCode } = req.body;
  
  // Code simple pour protection basique
  if (resetCode !== "reset123") {
    return res.status(403).json({ error: 'Code incorrect' });
  }
  
  // Réinitialiser les données
  let teamData = {
    "ED": { votes: 0, connections: { "SOLV": 0, "SIMU": 0, "SOFT": 0, "DATA": 0, "B2B": 0, "B2C": 0, "ADV": 0, "PM": 0, "MAT": 0, "Other": 0 } },
    "SOLV": { votes: 0, connections: { "ED": 0, "SIMU": 0, "SOFT": 0, "DATA": 0, "B2B": 0, "B2C": 0, "ADV": 0, "PM": 0, "MAT": 0, "Other": 0 } },
    "SIMU": { votes: 0, connections: { "ED": 0, "SOLV": 0, "SOFT": 0, "DATA": 0, "B2B": 0, "B2C": 0, "ADV": 0, "PM": 0, "MAT": 0, "Other": 0 } },
    "SOFT": { votes: 0, connections: { "ED": 0, "SOLV": 0, "SIMU": 0, "DATA": 0, "B2B": 0, "B2C": 0, "ADV": 0, "PM": 0, "MAT": 0, "Other": 0 } },
    "DATA": { votes: 0, connections: { "ED": 0, "SOLV": 0, "SIMU": 0, "SOFT": 0, "B2B": 0, "B2C": 0, "ADV": 0, "PM": 0, "MAT": 0, "Other": 0 } },
    "B2B": { votes: 0, connections: { "ED": 0, "SOLV": 0, "SIMU": 0, "SOFT": 0, "DATA": 0, "B2C": 0, "ADV": 0, "PM": 0, "MAT": 0, "Other": 0 } },
    "B2C": { votes: 0, connections: { "ED": 0, "SOLV": 0, "SIMU": 0, "SOFT": 0, "DATA": 0, "B2B": 0, "ADV": 0, "PM": 0, "MAT": 0, "Other": 0 } },
    "ADV": { votes: 0, connections: { "ED": 0, "SOLV": 0, "SIMU": 0, "SOFT": 0, "DATA": 0, "B2B": 0, "B2C": 0, "PM": 0, "MAT": 0, "Other": 0 } },
    "PM": { votes: 0, connections: { "ED": 0, "SOLV": 0, "SIMU": 0, "SOFT": 0, "DATA": 0, "B2B": 0, "B2C": 0, "ADV": 0, "MAT": 0, "Other": 0 } },
    "MAT": { votes: 0, connections: { "ED": 0, "SOLV": 0, "SIMU": 0, "SOFT": 0, "DATA": 0, "B2B": 0, "B2C": 0, "ADV": 0, "PM": 0, "Other": 0 } },
    "Other": { votes: 0, connections: { "ED": 0, "SOLV": 0, "SIMU": 0, "SOFT": 0, "DATA": 0, "B2B": 0, "B2C": 0, "ADV": 0, "PM": 0, "MAT": 0 } }
  };
  
  saveData();

  io.emit('data-updated', teamData);
  
  res.status(200).json({ success: true });
});

// Gérer les connexions Socket.io
io.on('connection', (socket) => {
  console.log('Nouvelle connexion client');
  
  // Envoyer les données actuelles au nouveau client
  socket.emit('initial-data', teamData);
  
  socket.on('disconnect', () => {
    console.log('Client déconnecté');
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});