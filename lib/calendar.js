var fs = require('fs');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var moment = require('moment');
var readline = require('readline');
var DateTimeHelpers = require('./datetime');

moment.locale('en-nz');

function Calendar(configuration) {
	var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
	var TOKEN_DIR = './conf/tokens/';
	var TOKEN_PATH = TOKEN_DIR + '/goole-calendar.json';

	var dtt = DateTimeHelpers();
	var calendar = {
		config: {},
		auth: {}
	};

	function authorize(callback) {
		var clientId = configuration.google.calendar.clientId;
		var clientSecret = configuration.google.calendar.clientSecret;
		var auth = new googleAuth();
		calendar.auth = new auth.OAuth2(clientId, clientSecret, 'urn:ietf:wg:oauth:2.0:oob');

		fs.readFile(TOKEN_PATH, function(err, token) {
			if (err) {
				getNewToken(callback);
			} else {
				calendar.auth.credentials = JSON.parse(token);
				callback();
			}
		});
	};

	function getNewToken(callback) {
		var authUrl = calendar.auth.generateAuthUrl({
			access_type: 'offline',
			scope: SCOPES
		});

		console.log('Authorize this app by visiting ', authUrl);

		var rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		rl.question('Enter the code: ', function(code) {
			rl.close();

			calendar.auth.getToken(code, function(err, token) {
				if (err) {
					console.error('Error while trying to retrieve access token', err);
					return;
				}

				calendar.auth.credentials = token;
				storeToken(token);
				callback();
			});
		});
	}

	function storeToken(token) {
		try {
			fs.mkdirSync(TOKEN_DIR);
		} catch (err) {
			if (err.code != 'EEXIST') {
				throw err;
			}
		}

		fs.writeFile(TOKEN_PATH, JSON.stringify(token));
		console.log('Token stored to ' + TOKEN_PATH);
	}

	calendar.config = configuration;

	calendar.humanize = function(event) {
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

	calendar.listEvents = function(callback) {
		var cal = google.calendar('v3');
		cal.events.list({
			auth: calendar.auth,
			calendarId: 'primary',
			timeMin: (new Date()).toISOString(),
			maxResults: 10,
			singleEvents: true,
			orderBy: 'startTime'
		}, function(err, response) {
			if (err) throw err;
			var events = response.items.map(calendar.humanize);
			callback(events);
		});
	};

	authorize(function() {});

	return calendar;
}

module.exports = Calendar;
