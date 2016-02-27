///<reference path="../typings/node/node.d.ts" />

//declare var Botkit: any;

import events = require('events');
import Botkit = require('botkit');

const toMe = ['direct_message', 'direct_mention', 'mention'];

export class MoochBot extends events.EventEmitter {
	bot: any;
	controller: any;
	connected: boolean = false;
	dataPath: string;
	token: string;

	public getUserByIdCallback:(user:any) => void;

	constructor(token: string, dataPath: string) {
		super();

		this.token = token;
		this.dataPath = dataPath;
		this.setupController();
		this.setupBot();
	}

	public connect() {
		this.emit('connecting');
		this.bot.startRTM((error, bot, payload) => {
			if (error !== null) {
				this.emit('error', error);
			}
		});
	}

	public reconnect() {
		if (this.connected) return;
		this.connect();
		setTimeout(() => {
			this.reconnect();
		}, 30 * 1000);
	}

	public getUserById(id: string, callback) {
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

	public getUserNameById(id: string, callback) {
		this.getUserById(id, (user) => {
			callback(user.name);
		});
	}

	private setupController() {
		this.controller = Botkit.slackbot({
			json_file_store: this.dataPath + '/data'
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

		this.controller.hears(['hello', 'hi'], toMe, (bot, message) => {
			this.sayHello(bot, message);
		});
	}

	private sayHello(bot, message) {
		this.getUserNameById(message.user, (name) => {
			bot.reply(message, 'Hello there ' + name);
			this.logMessage(message);
		});
	}

	private setupBot() {
		this.bot = this.controller.spawn({
			token: this.token
		});
	}

	private logMessage(message) {
		this.getUserNameById(message.user, (name) => {
			this.emit('received', name + 'said : ' +  message.text);
		});
	}
}
