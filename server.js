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
  "ED":    { votes: 0, connections: {} },
  "SOLV":  { votes: 0, connections: {} },
  "SIMU":  { votes: 0, connections: {} },
  "SOFT":  { votes: 0, connections: {} },
  "DATA":  { votes: 0, connections: {} },
  "SIM/US":  { votes: 0, connections: {} },
  "SIM/IND":  { votes: 0, connections: {} },
  "B2B":   { votes: 0, connections: {} },
  "B2C":   { votes: 0, connections: {} },
  "ADV":   { votes: 0, connections: {} },
  "PM":    { votes: 0, connections: {} },
  "MAT":   { votes: 0, connections: {} },
  "DOTI/BS": { votes: 0, connections: {} },
  "DOTI/IN": { votes: 0, connections: {} },
  "DOMF":    { votes: 0, connections: {} },
  "GST":    { votes: 0, connections: {} },
  "Others":   { votes: 0, connections: {} }
};

// Initialize connections for each team
let teams = Object.keys(teamData);
teams.forEach(team => {
  teams.forEach(connection => {
    if (team !== connection) {
      teamData[team].connections[connection] = 0;
    }
  });
});

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
    "ED":    { votes: 0, connections: {} },
    "SOLV":  { votes: 0, connections: {} },
    "SIMU":  { votes: 0, connections: {} },
    "SOFT":  { votes: 0, connections: {} },
    "DATA":  { votes: 0, connections: {} },
    "SIM/US":  { votes: 0, connections: {} },
    "SIM/IND":  { votes: 0, connections: {} },
    "B2B":   { votes: 0, connections: {} },
    "B2C":   { votes: 0, connections: {} },
    "ADV":   { votes: 0, connections: {} },
    "PM":    { votes: 0, connections: {} },
    "MAT":   { votes: 0, connections: {} },
    "DOTI/BS": { votes: 0, connections: {} },
    "DOTI/IN": { votes: 0, connections: {} },
    "DOMF":    { votes: 0, connections: {} },
    "GST":    { votes: 0, connections: {} },
    "Others":   { votes: 0, connections: {} }
  };
  
  // Initialize connections for each team
  let teams = Object.keys(teamData);
  teams.forEach(team => {
    teams.forEach(connection => {
      if (team !== connection) {
        teamData[team].connections[connection] = 0;
      }
    });
  });
  
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