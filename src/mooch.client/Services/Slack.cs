﻿using System.Configuration;
using System.Linq;
using SlackAPI;
using SlackAPI.WebSocketMessages;
using NLog;

namespace mooch.client.Services
{
  public class Slack
  {
    #region Constructor

    public Slack()
    {
      var token = ConfigurationManager.AppSettings["slack.auth.token"];

      _connectionTimer = new System.Timers.Timer(1000 * 60); // 1 minute
      _connectionTimer.Elapsed += _connectionTimer_Elapsed;
      _connectionTimer.Start();

      _client = new SlackSocketClient(token);
      _client.OnMessageReceived += _client_OnMessageReceived;

      _client.Connect(response => {
        LogManager.GetCurrentClassLogger().Info("Connected to Slack");
        _botId = _client.Users.FirstOrDefault(x => x.name == "mooch")?.id;
      });
    }

    #endregion Constructor

    #region Declarations

    private readonly string _botName = "mooch";
    private readonly SlackSocketClient _client;
    private readonly System.Timers.Timer _connectionTimer;

    private string _botId = "";

    #endregion Declarations

    #region Properties

    public static Slack Instance { get; } = new Slack();

    #endregion Properties

    #region Delegates

    public delegate void SlackMessageRecievedEventHandler(NewMessage message);

    #endregion Delegates

    #region Events

    public event SlackMessageRecievedEventHandler SlackMessageRecieved;

    #endregion Events

    #region Private Methods

    private string GetChannelId(string channelName)
    {
      return _client.Channels.FirstOrDefault(x => x.name == channelName)?.id ?? channelName;
    }

    #endregion Private Methods

    #region Public Methods

    public string GetUserName(string userId)
    {
      return _client.Users.FirstOrDefault(x => x.id == userId)?.name ?? userId;
    }

    public void PostImage(string channelName, byte[] image, string filename, string title = null)
    {
      var channelId = GetChannelId(channelName);
      _client.UploadFile(response => { }, image, filename, new[] {channelId}, title);
    }

    public void PostMessage(string channelName, string message)
    {
      var channelId = GetChannelId(channelName);
      _client.PostMessage(null, channelId, message, _botName);
    }

    #endregion Public Methods

    #region Event Handlers

    private void _client_OnMessageReceived(NewMessage obj)
    {
      var name = $"<@{_botId}>:";
      if (!obj.text.StartsWith(name)) return;

      obj.text = obj.text.Replace(name, "").Trim();

      SlackMessageRecieved?.Invoke(obj);
    }

    private void _connectionTimer_Elapsed(object sender, System.Timers.ElapsedEventArgs e)
    {
      if (!_client.IsConnected)
      {
        _client.Connect((response) =>
        {
          LogManager.GetCurrentClassLogger().Info("Reconnected to Slack");
        });
      }
    }

    #endregion Event Handlers
  }
}