using System.Configuration;
using System.IO;
using System.Threading.Tasks;

namespace mooch.client.Services
{
  public class GrabWatcher
  {
    #region Constructor

    public GrabWatcher()
    {
      var path = ConfigurationManager.AppSettings["security.grabs.path"];

      var watcher = new FileSystemWatcher(path)
      {
        Filter = "*.jpg"
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
      LogMessage?.Invoke("Snapshot grabbed");
      Task.Run(() =>
      {
        System.Threading.Thread.Sleep(500);
        Slack.Instance.PostImage("security", File.ReadAllBytes(e.FullPath), e.Name);
      });
    }

    #endregion Event Handlers
  }
}