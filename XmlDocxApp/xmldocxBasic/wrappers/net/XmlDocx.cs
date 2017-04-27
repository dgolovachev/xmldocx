using System;
using System.Diagnostics;
using System.IO;
using System.Collections.Generic;

namespace XmlDocxApi
{
	public class XmlDocx
	{

		#region Globals
		//path to general config options xml file
		private string configXml;
		//xmldocx absolute path.
		private string xmldocxPath;
		//turn on/off debug mode
		private bool debug;
		//list, paths to xml files with the content to be added to the word document 
		private List<string> content;
		//list, paths to XML files with the general properties of the Word document
		private List<string> documentProperties;
		#endregion

		#region Constructor
		/// /// <summary>
		/// Initializes a new instance of the <see cref="XmlDocx.XmlDocx"/> class.
		/// </summary>
		/// <param name="xml">
		/// Path to general config options xml file.
		/// </param>
		/// <exception cref='FileNotFoundException'>
		/// </exception>
		public XmlDocx(string xml)
		{
			if(!File.Exists(xml))
			{
				throw new FileNotFoundException("The file does not exist", "xml");
			}
			this.configXml = Path.GetFullPath(xml);
			this.debug = false;
			this.content =  new List<string>();
			this.documentProperties = new List<string>();
			this.xmldocxPath = String.Concat(Directory.GetCurrentDirectory(), "/../");

		}

		/// /// <summary>
		/// Initializes a new instance of the <see cref="XmlDocx.XmlDocx"/> class.
		/// </summary>
		/// <param name="xml">
		/// Path to general config options xml file.
		/// </param>
		/// /// <param name="debug">
		/// Enable debug mode.
		/// </param>
		/// <exception cref='FileNotFoundException'>
		/// </exception>
		public XmlDocx (string xml, bool debug)
		{
			if(!File.Exists(xml))
			{
				throw new FileNotFoundException("The file does not exist", "xml");
			}
			this.configXml = Path.GetFullPath(xml);
			this.debug = debug;
			this.content =  new List<string>();
			this.documentProperties = new List<string>();
			this.xmldocxPath = String.Concat(Directory.GetCurrentDirectory(), "/../");

		}
		#endregion

		#region Properties

		/// <summary>
		/// Gets or sets the config xml.
		/// </summary>
		/// <value>
		/// The config xml.
		/// </value>
		/// <exception cref='ArgumentException'>
		/// Is thrown when an argument passed to a method is invalid.
		/// </exception>
		public string ConfigXml 
		{
			get {
				return this.configXml;
			}
			set {
				if(!File.Exists(value))
				{
					throw new FileNotFoundException("The file does not exist");
				}
				this.configXml = value;
			}
		}

		/// <summary>
		/// Change debug mode.
		/// </summary>
		/// <value>
		/// <c>true</c> if debug; otherwise, <c>false</c>.
		/// </value>
		public bool Debug 
		{
			get {
				return this.debug; 
			} 
			set {
				this.debug = value;
			} 
		}

		/// <summary>
		/// Gets or sets the xmldocx path.
		/// </summary>
		/// <value>
		/// The xmldocx path.
		/// </value>
		public string XmldocxPath 
		{ 
			get {
				return this.xmldocxPath; 
			} 
			set {
				this.xmldocxPath = value;
			} 
		}
		#endregion

		#region Methods

		/// <summary>
		/// Adds the content.
		/// </summary>
		/// <param name='xml'>
		/// path to XML file with the content to be added to the word document.
		/// </param>
		/// <exception cref='ArgumentException'>
		/// Is thrown when an argument passed to a method is invalid.
		/// </exception>
		public void AddContent(string xml)
		{
			if(!File.Exists(xml))
			{
				throw new FileNotFoundException("The file does not exist", "xml");
			}
			this.content.Add(Path.GetFullPath(xml));
		}

		/// <summary>
		/// Sets the document properties.
		/// </summary>
		/// <param name='xml'>
		/// path to XML file with the general properties of the Word document.
		/// </param>
		/// <exception cref='ArgumentException'>
		/// Is thrown when an argument passed to a method is invalid.
		/// </exception>
		public void SetDocumentProperties(string xml)
		{   
			if(!File.Exists(xml))
			{
				throw new FileNotFoundException("The file does not exist", "xml");
			}
			this.documentProperties.Add(Path.GetFullPath(xml));
		}

		/// <summary>
		/// Render this instance.
		/// </summary>
		public void Render()
		{
			string command = String.Concat(this.xmldocxPath, "xmldocx/XMLAPICommand.php", " ", "-c", " ", this.configXml, " ", "-d", " ", String.Join(" ", this.documentProperties.ToArray()), " ", "-b", " ", String.Join(" ", this.content.ToArray()));
			ProcessStartInfo ProcessInfo = new ProcessStartInfo("php", command);
			ProcessInfo.CreateNoWindow = true; 
			ProcessInfo.UseShellExecute = false;
			try
			{
				// Start the process with the info we specified.
				// Call WaitForExit and then the using statement will close.
				using (Process exeProcess = Process.Start(ProcessInfo))
				{
					exeProcess.WaitForExit();
					if (this.debug) {
						string error = exeProcess.StandardError.ReadToEnd();
						System.Diagnostics.Debug.Write(error);
					}
				}
			}
			catch(IOException io)
			{
				System.Diagnostics.Debug.Write(io);
			}
		}	
		#endregion
	}
}
