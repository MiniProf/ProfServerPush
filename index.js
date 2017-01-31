var MySQLEvents = require('mysql-events');

var io = require('socket.io')();
// or
var Server = require('socket.io');
var io = new Server(8000);

var dsn = {
  host:'sccug-mini-prof.lancs.ac.uk',
  user:     "root",
  password: "root",
  includeEvents: ['tablemap', 'writerows', 'updaterows', 'deleterows']
};
try{
var con = MySQLEvents(dsn);
var liveChartsClients = [];
var sessionValidClients = [];
var pollLiveClients = [];

var lChartsEvent = con.add('db',(oldRow,newRow,ev)=>{
  console.log("shit happened");

  liveChartsClients.map((client)=>{
    if(client && client.value && client.value == fields.SessionID){
      client.socket.emit(fields);
    }
  });
});
var sessionValidEvent = con.add('db.MP_Sessions',(oldRow,newRow,ev)=>{
  sessionValidClients.map((client)=>{
    if(client && client.value && client.value == fields.SessionID){
      client.socket.emit(fields);
    }
  });
},'Active');

var pollLiveEvent = con.add('db.MP_Questions',(oldRow,newRow,ev)=>{
  pollLiveClients.map((client)=>{
    if(client && client.value && client.value == fields.SessionID){
      client.socket.emit("POLL LIVE");
    }
  });
},'Active');
con.connect(dsn);
console.log(con);
//con.triggers[0].callback();

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

