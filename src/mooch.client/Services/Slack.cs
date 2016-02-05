using System;
using System.Configuration;
using System.Linq;
using SlackAPI;

namespace mooch.client.Services
{
  public static class Slack
  {
    #region Declarations

    private static readonly string _botName = "mooch";

    #endregion Declarations

    #region Private Methods

    private static SlackSocketClient GetClient()
    {
      var token = ConfigurationManager.AppSettings["slack.auth.token"];
      var client = new SlackSocketClient(token);
      return client;
    }

    private static string GetChannelId(SlackSocketClient client, string channelName)
    {
      return client.Channels.FirstOrDefault(x => x.name == channelName)?.id;
    }

    #endregion Private Methods

    #region Public Methods

    public static void PostImage(string channelName, byte[] image, string filename, string title = null)
    {
      var client = GetClient();
      client.Connect((connected) =>
      {
        var channelId = GetChannelId(client, channelName);

        client.UploadFile((FileUploadResponse response) => {}, image, filename, new [] {channelId}, title);
      });
    }

    public static void PostMessage(string channelName, string message)
    {
      var client = GetClient();
      client.Connect((connected) =>
      {
        var channelId = GetChannelId(client, channelName);

        client.PostMessage(null, channelId, message, _botName);
      });
    }

    #endregion Public Methods
  }
}