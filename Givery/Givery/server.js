var restify = require('restify');

var config = require('./config/config.json');
var auth = require('./auth.js');
var users = require('./users.js');
var companies = require('./companies.js');

// Initialize server
var server = restify.createServer();
server.use(restify.bodyParser());
server.use(restify.queryParser());

// Auth requests
server.post('/api/auth/login', auth.login);

// User related requests
server.get('/api/users/events', users.events);
server.post('/api/users/reserve', users.reserve);

// Company related requests
server.post('/api/companies/events', companies.events);

server.listen(config.port, function () {
    console.log('Server listening on port %s', config.port);
});