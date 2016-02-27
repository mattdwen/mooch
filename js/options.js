$(function() {
	$('#optionsForm').submit((e) => {
		e.preventDefault();

		var options = {
			slack: {
				token: $('#optionsSlackToken').val()
			}
		}

		ipcRenderer.send('options:save', options);
	});

	ipcRenderer.on('options:loaded', (sender, options) => {
		$('#optionsSlackToken').val(options.slack.token);
	});

	ipcRenderer.on('options:saved', () => {
		console.log('saved');
	});

	ipcRenderer.send('options:load');
});
