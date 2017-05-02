using System;
using xNet;

namespace testService
{
    class Program
    {
        static void Main()
        {
            var url = "http://localhost:8080/test";
            var filePath = @"D:\11111.docx";

            using (var request = new HttpRequest())
            {
                request.AddFile("data", filePath);
                try
                {
                    var response = request.Post(url);
                    Console.WriteLine(response.ToString());
                }
                catch (Exception exception)
                {
                    Console.WriteLine(exception.Message);
                }

            }
        }
    }
}
