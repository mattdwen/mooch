///<reference path="../typings/tsd.d.ts" />

import events = require('events');
import DateTimeTools = require('./dateTimeTools');
import CalendarModule = require('./calendar');

var Botkit = require('botkit');
var _ = require('lodash');

const toMe = ['direct_message', 'direct_mention', 'mention'];

export class MoochBot extends events.EventEmitter {
	bot: any;
	calendar: CalendarModule.Calendar;
	controller: any;
	connected: boolean = false;
	dataPath: string;
	token: string;

	temperature: any = {};

	humidity: any = {};

	public getUserByIdCallback:(user:any) => void;

	// Constructor
	// ---------------------------------------------------------------------------

	constructor(token: string, dataPath: string, calendar: CalendarModule.Calendar) {
		super();

		console.log('NEW BOT');

		this.token = token;
		this.dataPath = dataPath;
		this.calendar = calendar;
		this.setupController();
		this.setupBot();
	}



	// Controller
	// ---------------------------------------------------------------------------

	setupController() {
		this.controller = Botkit.slackbot({
			json_file_store: this.dataPath + '/data'
		});

		// Connection
		//
		this.controller.on('rtm_open', (bot) => {
			this.connected = true;
			this.emit('connected');
		});

		this.controller.on('rtm_close', (bot) => {
			this.connected = false;
			this.emit('disconnected');
			this.reconnect();
		});

		// Calendar
		//
		this.controller.hears('coming up', 'direct_message,direct_mention,mention', (bot, message) => {
			this.whatsComingUp(bot, message);
		});

		this.controller.hears('staying (.*) weekend', toMe, (bot, message) => {
			this.whosStaying(bot, message);
		});

		// Misc
		//
		this.controller.hears(['hello', 'hi'], toMe, (bot, message) => {
			this.sayHello(bot, message);
		});

		// Temperature
		//
		this.controller.hears('temperature', toMe, (bot, message) => {
			this.currentTemperature(bot, message);
		});
	}



	// Bot
	// ---------------------------------------------------------------------------

	setupBot() {
		this.bot = this.controller.spawn({
			token: this.token,
			retry: Infinity
		});
	}




	// Connection
	// ---------------------------------------------------------------------------

	connect() {
		this.emit('connecting');
		this.bot.startRTM((error, bot, payload) => {
			if (error !== null) {
				this.emit('error', error);
			}
		});
	}

	reconnect() {
		if (this.connected) return;
		this.connect();
		setTimeout(() => {
			this.reconnect();
		}, 30 * 1000);
	}



	// User handling
	// ---------------------------------------------------------------------------

	getUserById(id: string, callback) {
		this.controller.storage.users.get(id, (err, user) => {
			if (user) {
				callback(user);
				return;
			}

			this.bot.api.users.info({user: id}, (err, response) => {
				this.controller.storage.users.save(response.user);
				callback(response.user);
				return;
			});
		});
	}

	getUserNameById(id: string, callback) {
		this.getUserById(id, (user) => {
			callback(user.name);
		});
	}


	// Calendar functions
	// ---------------------------------------------------------------------------

	whatsComingUp(bot, message) {
		this.calendar.listEvents('', (events) => {
			if (events.length === 0) {
				bot.reply(message, "There's nothing in the next month.");
			} else {
				for (var i = 0; i < events.length; i++) {
					bot.reply(message, events[i].txt)
				}
			}
		});

		this.logMessage(message);
	}

	whosStaying(bot, message) {
		var weekend;
		var match = message.match[1]
		switch (match) {
			case 'this':
				weekend = DateTimeTools.thisWeekend();
				break;
			case 'next':
				weekend = DateTimeTools.nextWeekend();
				break;

			default:
				bot.reply(message, "I'm not sure what weekend you're talking about.");
				return;
		}

		this.calendar.queryEvents('staying', weekend.starts, weekend.ends, function(events) {
			if (events.length === 0) {
				bot.reply(message, "There's no one staying " + match  + " weekend.");
			} else {
				for (var i = 0; i < events.length; i++) {
					bot.reply(message, events[i].txt)
				}
			}
		});

		this.logMessage(message);
	}

	sayHello(bot, message) {
		this.getUserNameById(message.user, (name) => {
			bot.reply(message, 'Hello there ' + name);
			this.logMessage(message);
		});
	}

	logMessage(message) {
		this.getUserNameById(message.user, (name) => {
			this.emit('received', name + ' said : ' +  message.text);
		});
	}



	// Temperature
	// ---------------------------------------------------------------------------

	currentTemperature(bot, message) {
		_.forEach(this.temperature, (temp, location) => {
			bot.reply(message, "It's " + temp + '° in the ' + location + '.');
		});
	}

	recordTemperature(location, temperature, humidity) {
		this.temperature[location] = temperature;
		this.humidity[location] = humidity;
	}
}
