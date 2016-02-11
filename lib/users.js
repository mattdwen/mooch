function Users(controller, bot) {
	var users = {};

	users.get = function(id, callback) {
		controller.storage.users.get(id, function(err, user) {
			if (user) {
				callback(user);
				return;
			}

			bot.api.users.info({user: id}, function(err, response) {
				controller.storage.users.save(response.user);
				callback(response.user);
				return;
			});
		});
	}

	users.name = function(id, callback) {
		users.get(id, function(user) {
			callback(user.name);
		});
	}

	return users;
}

module.exports = Users;
