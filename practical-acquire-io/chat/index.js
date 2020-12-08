var app = require('express')();
var http = require('http');
var config = require('./config');
var port = config.port;
const {Users} = require('./users');
var https = require('https');
var fs = require('fs');
const jwt = require('jsonwebtoken');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

var server = http.createServer(app).listen(port, () => {
    console.log('server listens on port '+ port);  
});

process.setMaxListeners(0);

const io = require("socket.io")(server, {
    cors: {
      origin: "http://localhost:8888",
      methods: ["GET","POST"]
    }
  });

var userObj = new Users();
const superagent = require('superagent');
const { apiEndPoint } = require('./config');
const { param } = require('../node/src/routes/users');

io.on('connection', function (socket) {
    let auth = "";
    //console.log("socket params: ", socket);
    var decodedUser;
    
    if (typeof(socket.request._query["Authorization"]) != "undefined") {
        auth = socket.request._query["Authorization"];
        decodedUser = jwt.verify(auth, config.secret);
       
        superagent
        .post(config.apiEndPoint + "user/get")
        .set('Authorization', auth)
        .set('Content-Type', 'application/json')
        .end((err, user) => {
            //add user to socket
            userObj.addUser(socket.id, user.body.items.id);
            console.log(userObj)
            //update user's isOnline status to Yes
            superagent
            .post(apiEndPoint + "user/update-status")
            .send({status: "Yes"})
            .set('Content-Type', 'application/json')
            .set('Authorization', auth)
            .end((err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("user isOnline status updated to `Yes`");
                    socket.broadcast.emit("online", {userId: user.body.items.id});
                }
            });
        });
    } else {
        socket.disconnect();
    }

    //for send message
    socket.on('sendMessage', (params) => {
        let addedUser = params.addedUser;
        console.log("msg arrived..", params)
        delete params.addedUser;
        console.log("msg arrived next..", params, addedUser)
        superagent
        .post(apiEndPoint + "message/send")
        .send(params)
        .set('Content-Type', 'application/json')
        .set('Authorization', auth)
        .end((err, messagesRes) => {
            if (err) {
                console.log(err);
            } else {
                console.log("message saved", params);
                messagesRes = messagesRes.body;
                if(messagesRes.items.length > 0){
                    messagesRes.items.forEach(function(user){
                        let userSocket = userObj.getUser(user.userId);
                        if(userSocket){
                            user.messageContent = params.messageContent;
                            user.messageType = params.messageType;
                            if(typeof(addedUser) !== "undefined"){
                                user.addedUser = addedUser;
                            }
                            user.createdAt = messagesRes.message.createdAt;
                            user.updatedAt = messagesRes.message.updatedAt;
                            user.senderId  = messagesRes.message.senderId;
                            userSocket.forEach(function(eachUser){
                                if(decodedUser.id == eachUser.userId){
                                    user.messageContent = params.messageContent.replace(decodedUser.nickName, "You");
                                }
                                console.log('msg emitting to other user', user);
                                io.to(eachUser.socketId).emit("getMessage", user)
                            })
                        }
                    }); 
                }
            }
        });
    });

    //for add user to conversation
    socket.on('userAddedToConversation', (params) => {
        console.log("in userAddedToConversation", params);
        superagent
        .post(apiEndPoint + "user/get-conversation-by-session")
        .send({session: params.session})
        .set('Content-Type', 'application/json')
        .set('Authorization', auth)
        .end((err, conversations) => {
            if (err) {
                console.log(err);
            } else {
                conversations = conversations.body;
                if(conversations.status == "success"){
                    if(conversations.items.length > 0){
                        conversations.items.forEach(function(eachConversation){
                            let socketUser = userObj.getUser(eachConversation.userId);
                            if(socketUser){
                                socketUser.forEach(function(eachUser){
                                    console.log(params);
                                    io.to(eachUser.socketId).emit("userAddedToConversation", params)
                                })
                            }
                        });
                    }
                }

            }
        });
    });

    //for disconnect
    socket.on('disconnect', () => {
    	var disconnectedUser = userObj.removeUser(socket.id);
        console.log("user disconnected", JSON.stringify(disconnectedUser), userObj);
        let updateOnlineStatus = true;
        if (typeof(disconnectedUser) != "undefined") {
            if (userObj.users.length > 0) {
                userObj.users.forEach(function (u) {
                    if(u.userId == disconnectedUser.userId){
                        updateOnlineStatus = false;
                    }
                });
            }
        }
        
        if (updateOnlineStatus === true) {
            superagent
            .post(apiEndPoint + "user/update-status")
            .send({status: "No"})
            .set('Content-Type', 'application/json')
            .set('Authorization', auth)
            .end((err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("user isOnline status updated to `No`") 
                    socket.broadcast.emit("offline", {userId: disconnectedUser.userId});
                }
            });
        }
    });

    process.on('uncaughtException', function(err) {
        console.log(err)
    });
});