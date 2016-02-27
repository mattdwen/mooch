///<reference path="../typings/node/node.d.ts" />

import events = require('events');
import fs = require('fs');
import path = require('path');

export class Config extends events.EventEmitter {
	app:any;
	configPath:string;
	options = {
		slack: {
			token: ''
		}
	};

	constructor(app: any) {
		super();

		this.app = app;
		this.configPath = path.join(app.getPath('userData'), 'config.json');
		this.load();
	}

	load() {
		if (fs.existsSync(this.configPath)) {
			this.options = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
		}
	}

	save() {
		fs.writeFileSync(this.configPath, JSON.stringify(this.options));
		this.emit('saved');
	}
}
