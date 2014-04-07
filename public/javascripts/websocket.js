var lastMessage;

window.onload = function () {
  //create socket
  var ws = new WebSocket('ws://localhost:3000');
  ws.onopen = function () {
    // send first ping
    ping();
  };

  ws.onmessage = function (ev) {
    console.log(' got: ' + ev.data);
    // you got echo back, measure latency
    document.getElementById('latency').innerHTML = new Date - lastMessage;
    //ping again
    ping();
  }

  function ping () {
    // record the timestamp
    lastMessage = +new Date;
    // send the message
    ws.send('ping');
  };
}
