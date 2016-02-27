///<reference path="../typings/node/node.d.ts" />

declare var Botkit: any;

import events = require('events');
import Botkit = require('botkit');

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
		this.bot.startRTM((err, bot, payload) => {
			if(err) {
				throw new Error(err);
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
	}

	private setupBot() {
		this.bot = this.controller.spawn({
			token: this.config.slack.token
		});
	}
}
