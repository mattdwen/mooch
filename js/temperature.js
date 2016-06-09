var tempSensors = {
	"ceiling": "192.168.2.41",
	"kitchen": "192.168.2.42"
};

function refreshTemperatures() {
	$.each(tempSensors, (name,ip) => {
		$.getJSON('http://' + ip + '/data.php', {range: 'hour'}, (data) => {
			var latest = data[0];
			var temp = parseInt(latest.temp);
			var humidity = parseInt(latest.humidity);

			ipcRenderer.send('temperature', name, temp, humidity);

			$('#temp-' + name).html(temp);
		});
	});
}

setInterval(refreshTemperatures, 60000);

$('#refreshTemperatures').click(() => {
	refreshTemperatures();
});
