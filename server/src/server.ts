import { Socket } from "socket.io";
import { User } from "./interfaces/user.interfaces";

let app = require('express')();
const port = process.env.PORT || 3000;
app.set("port", port);

let http = require("http").Server(app);
let io = require("socket.io")(http);
const users: Map<string, User> = new Map();

io.on("connection", (socket: Socket) => {

  socket.on('connect_client', (user: User) => {
    console.log(`Client ${socket.id} connected`);
    users.set(socket.id, user);
  
    io.sockets.emit('update_clients', Array.from(users));
  });
  
  socket.on('disconnect', () => {
    const deleted = users.get(socket.id);
    users.delete(socket.id);
    io.sockets.emit('delete_client', {
      user: deleted,
      key: socket.id
    });
    console.log(`Client ${socket.id} disconnected`);
  });

  /**
   * TinyMCE Clients event types
   */
  socket.on("set_cursor", (message: string) => {
    io.sockets.emit('update_cursor', message);
  });

  socket.on("set_selection", (message: string) => {
    io.sockets.emit('update_selection', message);
  });

  socket.on("set_content", (message: string) => {
    io.sockets.emit('update_content', message);
  });
});


http.listen(port, () => {
  console.log('listening on :' + port);
});