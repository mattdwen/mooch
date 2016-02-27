///<reference path="../typings/node/node.d.ts" />

declare var Botkit: any;

import events = require('events');
import Botkit = require('botkit');

const toMe = ['direct_message', 'direct_mention', 'mention'];

export class MoochBot extends events.EventEmitter {
	bot: any;
	controller: any;
	connected: boolean = false;
	token: string;


	constructor(token: string) {
		super();

		this.token = token;
		this.setupController();
		this.setupBot();
	}

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

	private setupController() {
		this.controller = Botkit.slackbot({
			json_file_store: './data'
		});

		this.controller.on('rtm_open', (bot) => {
			this.connected = true;
			this.emit('connected');
		});

		this.controller.on('rtm_close', (bot) => {
			this.connected = false;
			this.emit('disconnected');
			this.reconnect();
		});

		this.controller.hears('hello', toMe, (bot, message) => {
			this.emit('received', message);
			bot.reply(message, 'Hello there');
		});
	}

	private setupBot() {
		this.bot = this.controller.spawn({
			token: this.token
		});
	}
}
