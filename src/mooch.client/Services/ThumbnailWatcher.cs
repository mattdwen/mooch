using System.Configuration;
using System.IO;
using System.Threading.Tasks;

namespace mooch.client.Services
{
  public class ThumbnailWatcher
  {
    #region Constructor

    public ThumbnailWatcher()
    {
      var path = ConfigurationManager.AppSettings["security.thumbs.path"];

      var watcher = new FileSystemWatcher(path)
      {
        Filter = "*_large.jpg"
      };
      watcher.Created += _watcher_Created;
      watcher.EnableRaisingEvents = true;
    }

    #endregion Constructor

    #region Delegates

    public delegate void LogMessageEventHandler(string message);

    #endregion Delegate

    #region Events

    public event LogMessageEventHandler LogMessage;

    #endregion Events

    #region Event Handlers

    private void _watcher_Created(object sender, FileSystemEventArgs e)
    {
      LogMessage?.Invoke("Motion detected");
      Task.Run(() =>
      {
        System.Threading.Thread.Sleep(500);
        Slack.PostImage("security", File.ReadAllBytes(e.FullPath), e.Name.Replace("_large", ""));
      });
    }

    #endregion Event Handlers
  }
}