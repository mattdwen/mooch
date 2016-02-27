'use strict';
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

//const config = require('./conf/config.secret');
const config = require('./lib/config');
const Config = new config.Config(app);

const moochBot = require('./lib/moochBot');
var MoochBot;

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({ width: 800, hight: 600 });
	mainWindow.loadURL('file://' + __dirname + '/index.html');
	mainWindow.webContents.openDevTools();
	mainWindow.on('closed', function() {
		mainWindow = null;
	});
}

// app
// -----------------------------------------------------------------------------

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



// options
// -----------------------------------------------------------------------------

ipcMain.on('options:load', () => {
	mainWindow.webContents.send('options:loaded', Config.options);
});

ipcMain.on('options:save', (sender, options) => {
	Config.options = options;
	Config.save();
});

Config.on('saved', () => {
	mainWindow.webContents.send('options:saved');
	mainWindow.webContents.send('slack:disconnected');
	connectMoochBot();
})



// moochbot / slack
// -----------------------------------------------------------------------------

function connectMoochBot() {
	MoochBot = new moochBot.MoochBot(Config.options.slack.token);

	MoochBot.on('connecting', (message) => {
		mainWindow.webContents.send('slack:connecting');
	});

	MoochBot.on('connected', (message) => {
		mainWindow.webContents.send('slack:connected');
	});

	MoochBot.on('disconnected', (message) => {
		mainWindow.webContents.send('slack:disconnected');
	});

	MoochBot.on('error', (error) => {
		mainWindow.webContents.send('slack:error', error);
	});

	MoochBot.on('received', (message) => {
		mainWindow.webContents.send('slack:received', message);
	});

	MoochBot.reconnect();
}

ipcMain.on('slack:connect', connectMoochBot);
