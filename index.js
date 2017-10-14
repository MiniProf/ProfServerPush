var ZongJi = require('zongji');
var io = require('socket.io')();
// or
var Server = require('socket.io');

var zongji = new ZongJi({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
   //debug: true
});

class PUSHServer {
  constructor(port){
    this.server = new Server(port);
    this.tables = [];
    this.handlers = [];

    process.on('SIGINT', function() {
      console.log('Got SIGINT.');
      zongji.stop();
      process.exit();
    });
    zongji.start({
      includeEvents: ['tablemap', 'writerows', 'updaterows']
    });
    zongji.on('binlog',(evt)=>{
      //stop spamming
      if(evt.getEventName() == "writerows"){
        var table = evt.tableMap[evt.tableId].tableName;
        var row = evt.rows[0];
        this.handlers[table].func(row,this.handlers[table].clients);
      }
    });
  }
  addHandler(tableName, func){
    this.tables.push(tableName);
    this.handlers[tableName] = {
      func:func,
      clients:[]
    };
  }
  addClient(tableName, client){
    this.handlers[tableName].clients.push(client);
  }
  start(){
    this.server.on('connection',(socket)=>{
      socket.on('init',(data)=>{
        console.log(data);
        if(data.tableName && (this.tables.indexOf(data.tableName)!=-1)){
          this.addClient(data.tableName,{
            value:data.match,
            socket:socket
          });
          socket.emit('init', 'success');
        }else{
          socket.emit('init', 'failed');
        }

      });
    });
  }
}
var tables = ["MP_Lecturers","MP_Questions","MP_Reviews","MP_Sessions","MP_TLS", "MP_Tokens"];
var handler = (row, clients)=>{
  clients.map((client)=>{
    if(client.value === undefined)
      client.socket.emit('update',row);
    else{
      for (var data in row) {
        if(data.indexOf(client.value) != -1){
          client.socket.emit('update',row);
          break;
        }
      }
    }
  })
};
var PUSHserver = new PUSHServer(8000);
tables.map(
  (table)=>{
    PUSHserver.addHandler(table,handler);
  }
);

PUSHserver.start();
console.log("Server Started on port 8000");
