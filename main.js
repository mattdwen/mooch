'use strict';
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

const config = require('./conf/config.secret');
const moochBot = require('./lib/moochBot');
const MoochBot = new moochBot.MoochBot(config);

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({ width: 800, hight: 600 });
	mainWindow.loadURL('file://' + __dirname + '/index.html');
	mainWindow.webContents.openDevTools();
	mainWindow.on('closed', function() {
		mainWindow = null;
	});
}

app.on('ready', createWindow);

app.on('activate', function() {
	if (mainWindow == null) {
		createWindow();
	}
});

app.on('window-all-closed', function() {
	if (process.platform != 'darwin') {
		app.quit();
	}
});

ipcMain.on('slack:connect', () => {
		MoochBot.connect();
});

MoochBot.on('connected', (message) => {
	mainWindow.webContents.send('slack:connected');
});
