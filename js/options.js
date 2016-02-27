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

	ipcRenderer.send('options:load');
});
