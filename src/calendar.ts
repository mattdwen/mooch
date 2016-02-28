import ConfigModule = require('./Config');
import events = require('events');

var app = require('electron').app;
var fs = require('fs');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

export class Calendar extends events.EventEmitter {
	options: any;
	calendar: any;
	tokenDir:string;
	tokenPath:string;

	constructor(options: any) {
		super();

		this.options = options;
		this.tokenDir = app.getPath('userData') + '/tokens';
		this.tokenPath = this.tokenDir + '/google-calendar.json';

		this.calendar = {
			cal: google.calendar('v3')
		}
	}

	checkAuthorisation() {
		var auth = new googleAuth();
		this.calendar.auth = new auth.OAuth2(
			this.options.google.calendar.clientId,
			this.options.google.calendar.clientSecret,
			'urn:ietf:wg:oauth:2.0:oob');

		fs.readFile(this.tokenPath, (err, token) => {
			if (err) {
				var authUrl = this.calendar.auth.generateAuthUrl({
					access_type: 'offline',
					scope: ['https://www.googleapis.com/auth/calendar.readonly']
				});
				this.emit('needstoken', authUrl);
			} else {
				this.calendar.auth.credentials = JSON.parse(token);
			}
		});
	}

	authorise(code: string) {
		this.calendar.auth.getToken(code, (err, token) => {
			if (err) {
				console.log(err);
				return;
			}

			this.calendar.auth.credentials = token;
			this.storeToken(token);
			this.emit('authorised');
		});
	}

	storeToken(token:string) {
		try {
			fs.mkdirSync(this.tokenDir);
		} catch (err) {
			if (err.code != 'EEXIST') {
				throw err;
			}
		}

		fs.writeFile(this.tokenPath, JSON.stringify(token));
	}
}
