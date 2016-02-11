var config = require('../conf/config.secret');
var Botkit = require('botkit');
var Tools = require('./tools');

var controller = Botkit.slackbot({
	json_file_store: './data'
});

var bot = controller.spawn({
	token: config.slack.token
});

var users = Tools.users(controller, bot);

bot.startRTM(function(err, bot, payload) {
	if (err) {
		throw new Error('Could not connect to Slack');
	}
});

controller.hears(['hello','hi'], 'direct_message,direct_mention,mention', function(bot, message) {
	users.name(message.user, function(name) {
		bot.reply(message, 'Hey ' + name);
	})
});
