$(function() {
	$('#slackConnect').click(() => {
		ipcRenderer.send('slack:connect');
	}).trigger('click');

	ipcRenderer.on('slack:connecting', connecting);
	ipcRenderer.on('slack:connected', connected);
	ipcRenderer.on('slack:disconnected', disconnected);

	ipcRenderer.on('slack:error', (sender, error) => {
		console.error(error);
		showMessage(error.code, 'danger');
	});

	ipcRenderer.on('slack:received', (sender, message) => {
		showMessage(message, 'muted');
	});

	function showMessage(message, style) {
		$('#slackMessage')
			.attr('class', 'text-' + style)
			.text(message);
	}

	function connecting() {
		$('#slackConnect').addClass('hidden-xs-up');
		$('#slackConnecting').removeClass('hidden-xs-up');
		$('#slackDisconnect').addClass('hidden-xs-up');
	}

	function connected() {
		$('#slackConnect').addClass('hidden-xs-up');
		$('#slackConnecting').addClass('hidden-xs-up');
		$('#slackDisconnect').removeClass('hidden-xs-up');
	}

	function disconnected() {
		$('#slackConnect').removeClass('hidden-xs-up');
		$('#slackConnecting').addClass('hidden-xs-up');
		$('#slackDisconnect').addClass('hidden-xs-up');
	}
});
