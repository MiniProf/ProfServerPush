var ZongJi = require('zongji');
var io = require('socket.io')();
// or
var Server = require('socket.io');
var io = new Server(8000);

var zongji = new ZongJi({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
   //debug: true
});

var liveChartsClients = [];
var sessionValidClients = [];
var pollLiveClients = [];


process.on('SIGINT', function() {
  console.log('Got SIGINT.');
  zongji.stop();
  process.exit();
});
try{
  zongji.start({
    includeEvents: ['tablemap', 'writerows', 'updaterows', 'deleterows']
  });
  zongji.on('binlog', function(evt) {
    if(evt.getEventName() == "writerows"){
      var table = evt.tableMap[evt.tableId].tableName;
      var row = evt.rows[0];
      switch (table) {
        case "MP_Sessions":
          liveChartsClients.map((client)=>{
            if(client && client.value && client.value == fields.SessionID){
              client.socket.emit(fields);
            }
          });
          break;
        case "MP_Questions":
          break;
        default:

      }
    }
  });
io.on('connection',(socket)=>{
  socket.on('message',(data)=>{
    var func = data.substring(0,data.indexOf("("));
    var funcArg = data.substring(data.indexOf("(")+1,data.length -1);
    switch (func) {
      case "liveCharts":
        liveChartsClients.push({
          value:funcArg,
          socket:socket
        });
        break;
      case "sessionValid":
        sessionValidClients.push({
            value:funcArg,
            socket:socket
          });
        break;
      case "pollLive":
        pollLiveClients.push({
            value:funcArg,
            socket:socket
          });
          console.log("ADDED CLIENT");
        break;
    }
  });
});
}
catch(e){
  console.log(e);
}
