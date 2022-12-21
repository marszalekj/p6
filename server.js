// import pour pouvoir recevoir et repondre a des requetes http
const http = require("http");
// import de l'application
const app = require("./app");
// port a utiliser par le serveur
app.set("port", process.env.PORT);
const server = http.createServer(app);
// methode qui ecoute les requetes envoyees au serveur sur le port indique
server.listen(process.env.PORT);
