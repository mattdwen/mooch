var moment = require('moment');
moment.locale('en-nz');

function DateTimeHelpers() {
	var tools = {};

	var dateFormat = 'dddd MMM Do';
	var timeFormat = 'h:mma';
	var calendarFormatsForMidnight = {
		sameDay: '[Today]',
		nextDay: '[Tomorrow]',
		nextWeek: 'dddd',
		sameElse: dateFormat
	}

	tools.thisWeekend = function() {
		var friday = moment().day('Friday');
		var monday = moment(friday).add(3, 'days');

		friday = moment(friday.format('YYYY-MM-DDT18:00:00'));
		monday = moment(monday.format('YYYY-MM-DDT06:00:00'));

		return {
			starts: friday,
			ends: monday
		};
	}

	tools.nextWeekend = function() {
		var friday = moment().day('Friday').add(7, 'days');
		var monday = moment(friday).add(3, 'days');

		friday = moment(friday.format('YYYY-MM-DDT18:00:00'));
		monday = moment(monday.format('YYYY-MM-DDT06:00:00'));

		return {
			starts: friday,
			ends: monday
		};
	}

	tools.humanizeDateTime = function(dateTime) {
		var m = moment(dateTime);
		var isThisWeek = (m.diff(moment(), 'days') <= 7);
		var isMidnight = (m.hour() === 0 && m.minute() === 0 && m.second() === 0);

		if (isThisWeek && isMidnight) {
			return m.calendar(null, calendarFormatsForMidnight);
		} else if (isThisWeek) {
			return m.calendar();
		} else if (isMidnight) {
			return m.format(dateOnlyFormat);
		} else {
			return m.format(dateFormat + ' [at] ' + timeFormat);
		}
	}

	return tools;
}

module.exports = DateTimeHelpers;
