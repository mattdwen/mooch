import events = require('events');

import ConfigModule = require('./Config');
import dtt = require('./dateTimeTools');

var app = require('electron').app;
var fs = require('fs');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var moment = require('moment');

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

	listEvents(query:string, callback) {
		this.calendar.cal.events.list({
			auth: this.calendar.auth,
			calendarId: 'primary',
			q: query,
			timeMin: (new Date()).toISOString(),
			singleEvents: true,
			maxResults: 10,
			orderBy: 'startTime'
		}, (err, response) => {
			if (err) {
				this.emit('error', err);
				return;
			}

			var events = response.items.map(this.humanize);
			callback(events);
		});
	}

	private humanize(event) {
		var txt = 'human text';
		var start = moment(event.start.dateTime || event.start.date);
		var end = moment(event.end.dateTime || event.end.date);
		var daysDuration = end.diff(start, 'days');

		event.txt = dtt.humanizeDateTime(start);
		event.txt += ', ' + event.summary;

		if (daysDuration > 0) {
			event.txt += ' for ' + daysDuration + ' days';
		}

		if (event.location) {
			event.txt += ' at ' + event.location;
		}

		return event;
	}
}
