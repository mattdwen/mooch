///<reference path="../typings/node/node.d.ts" />

//declare var extend:any;

import events = require('events');
import fs = require('fs');
import path = require('path');
import extend = require('xtend');

export class Config extends events.EventEmitter {
	app:any;
	configPath:string;
	defaultOptions = {
		google: {
			calendar: {
				clientId: '',
				clientSecret: ''
			}
		},
		slack: {
			token: ''
		}
	};

	options = this.defaultOptions;

	constructor(app: any) {
		super();

		this.app = app;
		this.configPath = path.join(app.getPath('userData'), 'config.json');
		this.load();
	}

	load() {
		if (fs.existsSync(this.configPath)) {
			var options = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
			this.options = extend(this.defaultOptions, options);
		}
	}

	save() {
		fs.writeFileSync(this.configPath, JSON.stringify(this.options));
		this.emit('saved');
	}
}
