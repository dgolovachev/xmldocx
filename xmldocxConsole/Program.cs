using XmlDocxApi;

namespace xmldocxConsole
{
    class Program
    {
        static void Main()
        {
            XmlDocx docx = new XmlDocx("config.xml", true);
            docx.SetDocumentProperties("settings.xml");
            docx.AddContent("content.xml");
            docx.Render();
        }
    }
}
