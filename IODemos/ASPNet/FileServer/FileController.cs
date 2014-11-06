using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;

namespace FileServer
{
    public class FileController : ApiController
    {
        private string _dataFolder = @"D:\Users\Jeroen\TA-Advanced\Data";
 
        [Route("files/{fileName}", Name="FileRoute")]
        public HttpResponseMessage Get(string fileName)
        {
            var path = Path.Combine(_dataFolder, fileName);
            if (!File.Exists(path))
                return new HttpResponseMessage(HttpStatusCode.NotFound);
            var result = new HttpResponseMessage(HttpStatusCode.OK);
            result.Content = new StreamContent(new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read));
            result.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
            return result;
        }

        [Route("list")]
        public MyFileInfo[] Get()
        {
            return new DirectoryInfo(_dataFolder).GetFiles().Select(x => new MyFileInfo{fileName = x.Name, size = x.Length, url = Url.Link("FileRoute", new{fileName=x.Name})}).ToArray();
        }
    }

    public class MyFileInfo
    {
        public string fileName { get; set; }
        public long size { get; set; }
        public string url { get; set; }
    }
}
