$(function() {
	$('#slackConnect').click(() => {
		ipcRenderer.send('slack:connect');
		$('#slackConnect').addClass('hidden-xs-up');
		$('#slackConnecting').removeClass('hidden-xs-up');
	}).trigger('click');

	ipcRenderer.on('slack:connected', () => {
		$('#slackConnecting').addClass('hidden-xs-up');
		$('#slackDisconnect').removeClass('hidden-xs-up');
	});

	ipcRenderer.on('slack:disconnected', () => {
		$('#slackDisconnect').addClass('hidden-xs-up');
		$('#slackConnect').removeClass('hidden-xs-up');
	});

	ipcRenderer.on('slack:error', (sender, error) => {
		console.log(error);
		showMessage(error.code, 'danger');
	});

	ipcRenderer.on('slack:received', (sender, message) => {
		showMessage(message.text, 'muted');
	});

	function showMessage(message, style) {
		$('#slackMessage')
			.attr('class', 'text-' + style)
			.text(message);
	}
});
