$(function() {
	$('#optionsForm').submit((e) => {
		e.preventDefault();

		var options = {
			google: {
				calendar: {
					clientId: $('#optionsGoogleCalendarClientId').val(),
					clientSecret: $('#optionsGoogleCalendarClientSecret').val()
				}
			},
			slack: {
				token: $('#optionsSlackToken').val()
			}
		}

		ipcRenderer.send('options:save', options);
	});

	ipcRenderer.on('options:loaded', (sender, options) => {
		$('#optionsSlackToken').val(options.slack.token);
		$('#optionsGoogleCalendarClientId').val(options.google.calendar.clientId);
		$('#optionsGoogleCalendarClientSecret').val(options.google.calendar.clientSecret);
	});

	ipcRenderer.on('options:saved', () => {
		console.log('saved');
	});

	ipcRenderer.on('calendar:needsAuth', (sender, authUrl) => {
		$('#calendarAuthStartButton').show();
		$('#calendarAuthEntry').hide();
		$('#calendarAuthStartButton').attr('href', authUrl);
		$('#modalCalendarAuth').modal();
	});

	ipcRenderer.send('options:load');

	$('#calendarAuthStartButton').click(() => {
		$('#calendarAuthStartButton').hide();
		$('#calendarAuthEntry').show();
	});

	$('#calendarAuthEntry').submit(() => {
		var code = $('#calendarAuthCode').val();
		ipcRenderer.send('calendar:auth', code);
	});
});
