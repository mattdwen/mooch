///<reference path="../typings/tsd.d.ts"/>

import events = require('events');
import fs = require('fs');
import path = require('path');

var extend = require('xtend');

export class Config extends events.EventEmitter {
	app: Electron.App;
	configPath: string;
	defaultOptions = {
		google: {
			calendar: {
				clientId: '',
				clientSecret: ''
			}
		},
		security: {
			snapshots: {
				path: ''
			}
		},
		slack: {
			token: ''
		}
	};

	options = this.defaultOptions;

	constructor(app: Electron.App) {
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
