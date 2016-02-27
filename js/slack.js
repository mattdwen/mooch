$(function() {
	$('#slackConnect').click(() => {
		ipcRenderer.send('slack:connect');
		$('#slackConnect').addClass('hidden-xs-up');
		$('#slackConnecting').removeClass('hidden-xs-up');
	});

	ipcRenderer.on('slack:connected', () => {
		$('#slackConnecting').addClass('hidden-xs-up');
		$('#slackDisconnect').removeClass('hidden-xs-up');
	});
});
