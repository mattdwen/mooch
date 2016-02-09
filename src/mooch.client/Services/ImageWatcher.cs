using System.IO;
using System.Threading;
using System.Threading.Tasks;
using NLog;

namespace mooch.client.Services
{
  public class ImageWatcher
  {
    #region Constructor

    public ImageWatcher(string path, string filter)
    {
      _path = path;
      _filter = filter;
      CreateWatcher();
    }

    #endregion Constructor

    #region Declarations

    private readonly string _filter;
    private readonly string _path;

    private FileSystemWatcher _watcher;

    #endregion Declarations

    #region Delegates

    public delegate void ImageCapturedEventHandler();

    #endregion Delegate

    #region Events

    public event ImageCapturedEventHandler ImageCaptured;

    #endregion Events

    #region Private Methods

    private void CreateWatcher()
    {
      _watcher = new FileSystemWatcher(_path)
      {
        Filter = _filter
      };

      while (!_watcher.EnableRaisingEvents)
      {
        try
        {
          _watcher.Created += _watcher_Created;
          _watcher.Error += Watcher_Error;
          _watcher.EnableRaisingEvents = true;
        }
        catch
        {
          Thread.Sleep(5000);
        }
      }
    }

    #endregion Private Methods

    #region Event Handlers

    private void _watcher_Created(object sender, FileSystemEventArgs e)
    {
      Task.Run(() =>
      {
        Thread.Sleep(500);
        ImageCaptured?.Invoke();
        Slack.Instance.PostImage("security", File.ReadAllBytes(e.FullPath), e.Name);
      });
    }

    private void Watcher_Error(object sender, ErrorEventArgs e)
    {
      LogManager.GetCurrentClassLogger().Error(e.GetException());
      CreateWatcher();
    }

    #endregion Event Handlers
  }
}