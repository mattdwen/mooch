using System;
using mooch.client.Services;
using NLog;

namespace mooch.client
{
  internal class Program
  {
    private static Logger logger;

    private static void Main(string[] args)
    {
      logger = LogManager.GetCurrentClassLogger();

      LogMessage("********************");
      LogMessage("Mooch Client running");
      LogMessage("********************");

      var slack = Slack.Instance;
      slack.SlackMessageRecieved += Slack_SlackMessageRecieved;

      var grabWatcher = new GrabWatcher();
      grabWatcher.LogMessage += LogMessage;

      var thumbnailWatcher = new ThumbnailWatcher();
      thumbnailWatcher.LogMessage += LogMessage;

      Console.ReadKey();
    }

    private static void Slack_SlackMessageRecieved(SlackAPI.WebSocketMessages.NewMessage message)
    {
      var command = message.text.Split(' ')[0];
      switch (command)
      {
        case "hello":
          var userName = Slack.Instance.GetUserName(message.user);
          Slack.Instance.PostMessage(message.channel, $"Hello @{userName}!");
          break;

        case "snapshot":
          ISpy.Snapshot();
          break;

        default:
          Slack.Instance.PostMessage(message.channel, "*derp*");
          break;
      }
    }

    private static void LogMessage(string message)
    {
      logger.Log(LogLevel.Info, message);
    }
  }
}