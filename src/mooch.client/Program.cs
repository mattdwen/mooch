using System;
using mooch.client.Services;

namespace mooch.client
{
  internal class Program
  {
    private static void Main(string[] args)
    {
      var thumbnailWatcher = new ThumbnailWatcher();
      thumbnailWatcher.LogMessage += ThumbnailWatcher_LogMessage;

      Console.WriteLine("********************");
      Console.WriteLine("Mooch Client running");
      Console.WriteLine("********************");

      //Slack.PostMessage("general", "Hello!");

      Console.ReadKey();
    }

    private static void ThumbnailWatcher_LogMessage(string message)
    {
      Console.WriteLine($"{DateTime.Now} {message}");
    }
  }
}