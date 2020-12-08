var config = require("./../config")
var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
var User = require("./../models/user");
var Conversation = require("./../models/conversation");
var Message = require("./../models/message");
var authUtil = require("./authUtil")
var randomstring = require("randomstring");

//authorize user then generate token
router.post("/authorization", (req, res, next) => {
	var params = req.body;
	if(typeof(params.nickName) === "undefined"){
		res.status(200).json({status: "error", message: "Nick name required!"});
		return;		
	} 
	
	User.search({nickName: params.nickName}, function(err, user){
		if(err){
			console.log(err);
			res.status(200).json({status: "error", message: err});
			return;
		} else {
			if(user.rows.length == 0){
				User.createUser({nickName: params.nickName}, function(err, userCreatedStatus){
					if(err){
						console.log(err);
						res.status(200).json({status: "error", message: err});
						return;
					} else {
						var userData = {
							id: userCreatedStatus.rows.insertId,
							nickName: params.nickName
						};
						const jwtToken = jwt.sign(userData, config.secret, {expiresIn: config.tokenLife});
						res.status(200).json({status: "success", token: jwtToken, userId: userData.id});
					}
				});
			} else {
				var userData = {
					id: user.rows[0].id,
					nickName: user.rows[0].nickName
				};
				const jwtToken = jwt.sign(userData, config.secret, {expiresIn: config.tokenLife});
				res.status(200).json({status: "success", token: jwtToken, userId: userData.id});
			}
		}
	})
});	

router.post("/get", authUtil.ensureAuthenticated, (req, res, next) => {
	User.search({id: req.user.id}, function(err, user){
		if(err){
			console.log(err);
			res.status(200).json({status: "error", message: err});
			return;
		} else {
			console.log(user)
			res.status(200).json({status: "success", items: user.rows[0]});
		}
	});
});

//get all conversation
router.post("/get-all", authUtil.ensureAuthenticated, (req, res, next) => {
	User.list({id: req.user.id}, function(err, users){
		if(err){
			console.log(err);
			res.status(200).json({status: "error", message: err});
			return;
		} else {
			res.status(200).json({status: "success", items: users.rows});
		}
	});
});

//update user isOnline status
router.post("/update-status", authUtil.ensureAuthenticated, (req, res, next) => {
	var params = req.body;
	// all validations
	if(typeof(params.status) === "undefined"){
		res.status(200).json({status: "error", message: "status required!"});
		return;		
	} else if(params.status != "Yes" && params.status != "No"){
		res.status(200).json({status: "error", message: "invalid status value. Shoule be Yes/No"});
		return;
	}

	User.customUpdate({id: req.user.id}, {isOnline: params.status}, function(err, succ){
		if(err){
			console.log(err);
			res.status(200).json({status: "error", message: err});
			return;
		} else {
			res.status(200).json({status: "success", message: "Online status update successfully!"});
		}
	})
});

//get conversation details & all messages of that conversation
router.post("/get-conversation", authUtil.ensureAuthenticated, (req, res, next) => {
	var params = req.body;
	var userIds = [];
	userIds.push(req.user.id.toString())
	userIds = userIds.concat(params.userIds.split(","));
	Conversation.check({userIds: userIds}, function(err, conversation){
		if(err){
			console.log(err);
			res.status(200).json({status: "error", message: err});
			return;
		} else {
			const randString = randomstring.generate(20);
			if(conversation.rows.length > 0 && userIds.length == conversation.rows[0].conversationCount){
				//conversation is already exists
				Conversation.search({session: conversation.rows[0].session}, function(err, conv){
					if(err){
						console.log(err)
					} else {
						if(conv.rows.length == userIds.length){
							Message.search({session: conversation.rows[0].session}, function(err, messages){
								if(err){
									console.log(err)
								} else {
									res.status(200).json({status: "success", session: conversation.rows[0].session, items: messages.rows, userNickname: req.user.nickName});
								}
							})
						} else {
							//inititate new conversation
							userIds.forEach(function(userId){
								var conver = {
									userId: userId,
									session: randString
								}
								Conversation.createConversation(conver, function(err, succ){
									if(err){
										console.log(err)
									} else {
										console.log("conversation added")
									}
								})
							});
							res.status(200).json({status: "success", session: randString});
						}
					}
				})
			} else {
				//inititate new conversation
				userIds.forEach(function(userId){
					var conver = {
						userId: userId,
						session: randString
					}
					Conversation.createConversation(conver, function(err, succ){
						if(err){
							console.log(err)
						} else {
							console.log("conversation added")
							res.status(200).json({status: "success", session: randString});
						}
					})
				});
			}
		}
	});

	// Conversation.get({userIds: userIds}, function(err, conversation){
	// 	if(err){
	// 		console.log(err);
	// 		res.status(200).json({status: "error", message: err});
	// 		return;
	// 	} else {
	// 		res.status(200).json({status: "success", message: "Online status update successfully!"});
	// 	}
	// })
});

//add user to conversation
router.post("/add-user-to-conversation", authUtil.ensureAuthenticated, (req, res, next) => {
	var params = req.body;
	User.userInConversation(params, function(err, isUserInConversation){
		if(err){
			console.log(err);
			res.status(200).json({status: "error", message: err});
			return;
		} else {
			console.log(isUserInConversation);
			if(isUserInConversation.rows.length == 0){
				User.search({nickName: params.nickName}, function(err, userDetail){
					if(err){
						console.log(err)
					} else {
						var conver = {
							userId: userDetail.rows[0].id,
							session: params.session
						}
						Conversation.createConversation(conver, function(err, succ){
							if(err){
								console.log(err)
							} else {
								console.log("user added to conversation");
								res.status(200).json({status: "success", session: params.session, nickName: req.user.nickName, addedUser: userDetail.rows[0].id});
							}
						})
					}
				})
			} else {
				res.status(200).json({status: "error", message: "You can't add this user to this conversation."});
			}
		}
	})
});

//get conversation by session
router.post("/get-conversation-by-session", authUtil.ensureAuthenticated, (req, res, next) => {
	var params = req.body;
	Conversation.search(params, function(err, conversations){
		if(err){
			console.log(err);
			res.status(200).json({status: "error", message: err});
			return;
		} else {
			res.status(200).json({status: "success", items: conversations.rows});
		}
	})
});

//get all conversation
router.post("/get-all-conversations", authUtil.ensureAuthenticated, (req, res, next) => {
	Conversation.search({userId: req.user.id}, function(err, conversations){
		if(err){
			console.log(err);
			res.status(200).json({status: "error", message: err});
			return;
		} else {
			console.log(conversations);
			if(conversations.rows.length > 0){
				var results = [], sessions = [], userIds = [], userObj = [], conversationObj = [];
				conversations.rows.forEach(function(conversation){
					sessions.push(conversation.session);
					conversationObj[conversation.session] = { users: []};
				})
				Conversation.bySession({sessions: sessions}, function(err, bySessions){
					if(err){
						console.log(err)
					} else {
						if(bySessions.rows.length > 0){
							bySessions.rows.forEach(function(sess){
								userIds.push(sess.userId);
							});
							User.userByIds({userIds: userIds}, function(err, users){
								if(err){
									console.log(err)
								} else {
									if(users.rows.length > 0){
										users.rows.forEach(function(user){
											userObj[user.id] = user;
										});
										bySessions.rows.forEach(function(sess){
											conversationObj[sess.session].users.push(userObj[sess.userId].nickName);
										});
										console.log(conversationObj);
									}
								}
							})
						} else {
							res.status(200).json({status: "success", items: []});
						}
					}
				})
			} else {
				res.status(200).json({status: "success", items: []});
			}
		}
	})
});

module.exports = router;