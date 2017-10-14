
var server = require('http').createServer();
var io = require('socket.io')(server);

io.on('connection',(socket)=>{
  socket.emit('welcome', { message: 'Welcome!', id: socket.id });
  socket.on('message',(data)=>{});
});
server.listen(3000);
