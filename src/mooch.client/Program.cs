using System;
using mooch.client.Services;

namespace mooch.client
{
  internal class Program
  {
    private static void Main(string[] args)
    {
      var slack = Slack.Instance;
      slack.SlackMessageRecieved += Slack_SlackMessageRecieved;

      var grabWatcher = new GrabWatcher();
      grabWatcher.LogMessage += ThumbnailWatcher_LogMessage;

      var thumbnailWatcher = new ThumbnailWatcher();
      thumbnailWatcher.LogMessage += ThumbnailWatcher_LogMessage;

      Console.WriteLine("********************");
      Console.WriteLine("Mooch Client running");
      Console.WriteLine("********************");

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

    private static void ThumbnailWatcher_LogMessage(string message)
    {
      Console.WriteLine($"{DateTime.Now} {message}");
    }
  }
}