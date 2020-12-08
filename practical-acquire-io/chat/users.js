class Users {

	constructor () {
		this.users = [];
	}
	addUser (socketId, userId) {
		var user = {socketId: socketId, userId: userId };
		this.users.push(user);
		return user;
	}
	removeUser (socketId) {
		for (var i = 0; i < this.users.length; i++) {
			if(typeof(this.users[i]) != "undefined"){
				if(this.users[i].socketId === socketId){
					var currentUser = this.users[i];
					//delete this.users[i];
					this.users.splice(i, 1);
					return currentUser;
				}
			}
		}
	}
	getUser (userId) {
		var allusers = [];
		for (var i = this.users.length; i >= 0; i--) {
			if(typeof(this.users[i]) != "undefined"){
				if(this.users[i].userId === userId){
					allusers.push(this.users[i])
				}
			}
		}
		return allusers;
	}
	getUserBySocketId (socketId) {
		for (var i = 0; i < this.users.length; i++) {
			if(typeof(this.users[i]) != "undefined"){
				if(this.users[i].socketId === socketId){
					return this.users[i];
					break;
				}
			}
		}
	}

}

module.exports = {
	Users
};