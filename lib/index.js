var config = require('../conf/config.secret');
var Botkit = require('botkit');
var Tools = require('./tools');

var controller = Botkit.slackbot({
	json_file_store: './data'
});

var bot = controller.spawn({
	token: config.slack.token
});

var dtt = Tools.dateTime();
var users = Tools.users(controller, bot);
var calendar = Tools.calendar(config);

bot.startRTM(function(err, bot, payload) {
	if (err) {
		throw new Error('Could not connect to Slack');
	}
});

controller.hears('coming up', 'direct_message,direct_mention,mention', function(bot, message) {
	calendar.listEvents('', function(events) {
		if (events.length === 0) {
			bot.reply(message, "There's nothing in the next month.");
		} else {
			for (var i = 0; i < events.length; i++) {
				bot.reply(message, events[i].txt)
			}
		}
	});
});

controller.hears('staying (.*) weekend', 'direct_message,direct_mention,mention', function(bot, message) {
	var weekend;
	switch (message.match[1]) {
		case 'this':
			weekend = dtt.thisWeekend();
			break;
		case 'next':
			weekend = dtt.nextWeekend();
			break;
			
		default:
			bot.reply(message, "I'm not sure what weekend you're talking about.");
			return;
	}

	calendar.queryEvents('staying', weekend.starts, weekend.ends, function(events) {
		if (events.length === 0) {
			bot.reply(message, "There's no one staying this weekend.");
		} else {
			for (var i = 0; i < events.length; i++) {
				bot.reply(message, events[i].txt)
			}
		}
	})
});

controller.hears(['hello','hi'], 'direct_message,direct_mention,mention', function(bot, message) {
	users.name(message.user, function(name) {
		bot.reply(message, 'Hey ' + name);
	});
});
