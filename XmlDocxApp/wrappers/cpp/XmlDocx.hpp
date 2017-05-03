#ifndef __XMLDOCX__
#define __XMLDOCX__

#include <string>
#include <vector>
using namespace std;

/**
 * XmlDocx.hpp
 *
 * Header class to define XmlDocx.cpp
 */
class XmlDocx 
{
	private:
		string config;
		string xmldocxPath;
		bool debug;
		vector<string> content;
		vector<string> properties;

		/**
		 * initialize the object
		 * @param 	config	XML config absolute path
		 * @param 	debug	XmlDocx absolute root path
		 */
		void init(string config, bool debug);

		/**
		 * check file path
		 * @param 	path	Absolute file path
		 */
		void checkFile(string path);

	public:
		/**
		 * constructor
		 * @param 	config	XML config absolute path
		 */
		XmlDocx(string config);

		/**
		 * constructor (overloading)
		 * @param 	config	XML config absolute path
		 * @param 	debug	XmlDocx absolute root path
		 */
		XmlDocx(string config, bool debug);

		/**
		 * destructor
		 */
		~XmlDocx();

		/**
		 * return XML config (file path)
		 */
		string getConfig();
		
		/**
		 * set XML config (file path)
		 * @param 	config	XML config absolute path
		 */
		void setConfig(string config);
		
		/**
		 * return absolute xmldocx path
		 */
		string getXmldocxPath();
		
		/**
		 * set absolute xmldocx path
		 * @param 	debug	XmlDocx absolute root path
		 */
		void setXmldocxPath(string xmldocxPath);
		
		/**
		 * get debug mode
		 */
		bool getDebug();
		
		/**
		 * set debug mode
		 * @param 	debug	Debug mode (true or false)
		 */
		void setDebug(bool debug);
		
		/**
		 * get content XML file (file path)
		 */
		vector<string> getContent();
		
		/**
		 * add XML content file (file path)
		 * @param 	content		XML content file (absolute path)
		 */
		void addContent(string content);

		/**
		 * get XML properties file (file path)
		 */
		vector<string> getProperties();

		/**
		 * add properties XML file (file path)
		 * @param 	properties 	XML properties file (absolute path)
		 */
		void addProperties(string properties);

		/**
		 * Renders Word document out of the XML data.
		 */
		void render();
};
#endif