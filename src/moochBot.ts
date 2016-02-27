///<reference path="../typings/node/node.d.ts" />

declare var Botkit: any;

import events = require('events');
import Botkit = require('botkit');

const toMe = ['direct_message', 'direct_mention', 'mention'];

export class MoochBot extends events.EventEmitter {
	config: any;
	controller: any;
	bot: any;

	constructor(config: any) {
		super();

		this.config = config;
		this.setupController();
		this.setupBot();
	}

	connect() {
		this.bot.startRTM((error, bot, payload) => {
			if (error !== null) {
				this.emit('error', error);
			}
		});
	}

	private setupController() {
		this.controller = Botkit.slackbot({
			json_file_store: './data'
		});

		this.controller.on('rtm_open', (bot) => {
			this.emit('connected');
		});

		this.controller.on('rtm_close', (bot) => {
			this.emit('disconnected');
		});

		this.controller.hears('hello', toMe, (bot, message) => {
			this.emit('received', message);
			bot.reply(message, 'Hello there');
		});
	}

	private setupBot() {
		this.bot = this.controller.spawn({
			token: this.config.slack.token
		});
	}
}
