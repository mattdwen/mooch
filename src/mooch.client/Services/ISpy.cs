using System.Diagnostics;

namespace mooch.client.Services
{
  public static class ISpy
  {
    #region Public Methods

    public static void Snapshot()
    {
      Process.Start(@"C:\Program Files\iSpy\ispy.exe", "commands snapshot");
    }

    #endregion Public Methods
  }
}