﻿using System;
using System.Configuration;
using mooch.client.Services;
using NLog;

namespace mooch.client
{
  internal class Program
  {
    private static void Main(string[] args)
    {
      LogMessage("********************");
      LogMessage("Mooch Client running");
      LogMessage("********************");

      var slack = Slack.Instance;
      slack.SlackMessageRecieved += Slack_SlackMessageRecieved;

      var thumbnailWatcher = new ImageWatcher(ConfigurationManager.AppSettings["security.thumbs.path"], "*_full.jpg");
      thumbnailWatcher.ImageCaptured += () => { LogManager.GetCurrentClassLogger().Info("Motion detected"); };

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

        default:
          Slack.Instance.PostMessage(message.channel, "*derp*");
          break;
      }
    }

    private static void LogMessage(string message)
    {
      LogManager.GetCurrentClassLogger().Info(message);
    }
  }
}