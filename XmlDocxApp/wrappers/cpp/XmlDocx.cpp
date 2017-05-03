/**
 * Create a Word document out of a XML file.
 *
 * This class implements XmlDocx.hpp
 *
 * Example:
 * XmlDocx *doc = new XmlDocx("config.xml");
 * doc->addProperties("settings.xml");
 * doc->addContent("content.xml");
 * doc->render();
 */
#include "XmlDocx.hpp"
#include <errno.h>
#include <exception>
#include <iostream>
#include <string.h>
#include <stdio.h>
#include <stdexcept>
#include <stdlib.h>
#include <vector>
#ifdef WINDOWS
    #include <direct.h>
    #define getCurrentDir _getcwd
#else
    #include <unistd.h>
	#define getCurrentDir getcwd
#endif

using namespace std;

/**
 * constructor
 */
XmlDocx::XmlDocx(string config) 
{
	this->init(config, false);
}

/**
 * constructor (overloading)
 */
XmlDocx::XmlDocx(string config, bool debug) 
{
	this->init(config, debug);
}

/**
 * initialize the object
 * @param 	config	XML config absolute path
 * @param 	debug	XmlDocx absolute root path
 */
void XmlDocx::init(string config, bool debug)
{
	try
	{
		this->checkFile(config);
	}
	catch (exception& e)
  	{
  		cout << e.what() << endl;
  		exit(EXIT_FAILURE);
	}

	this->config = config;
	this->debug = debug;

	// set base path
	string baseXmlDocxPath = string(getCurrentDir(0, 0)) + "/../../";
	this->setXmldocxPath(baseXmlDocxPath);
}

/**
 * check file path
 * @param 	path	Absolute file path
 */
void XmlDocx::checkFile(string path)
{
	FILE *fp = NULL;
    fp = fopen(path.c_str(), "r");
    if (fp == NULL)
    {
    	string error = "The file does not exist \"" + path + "\": " + string(strerror(errno));
    	throw runtime_error(error);
    }
}

/**
 * destructor
 */
XmlDocx::~XmlDocx()
{
}

/**
 * return XML config (file path)
 */
string XmlDocx::getConfig()
{
	return this->config;
}

/**
 * set XML config (file path)
 * @param 	config	XML config absolute path
 */
void XmlDocx::setConfig(string config)
{
	try
	{
		this->checkFile(config);
	}
	catch (exception& e)
  	{
  		cout << e.what() << endl;
  		exit(EXIT_FAILURE);
	}

	this->config = config;
}

/**
 * return absolute xmldocx path
 */
string XmlDocx::getXmldocxPath()
{
	return this->xmldocxPath;
}

/**
 * set absolute xmldocx path
 * @param 	debug	XmlDocx absolute root path
 */
void XmlDocx::setXmldocxPath(string xmldocxPath)
{
	try
	{
		this->checkFile(xmldocxPath);
	}
	catch (exception& e)
  	{
  		cout << e.what() << endl;
  		exit(EXIT_FAILURE);
	}

	this->xmldocxPath = xmldocxPath;
}

/**
 * get debug mode
 */
bool XmlDocx::getDebug()
{
	return this->debug;
}

/**
 * set debug mode
 * @param 	debug	Debug mode (true or false)
 */
void XmlDocx::setDebug(bool debug)
{
	this->debug = debug;
}

/**
 * get content XML file (file path)
 */
vector<string> XmlDocx::getContent()
{
	return this->content;
}

/**
 * add XML content file (file path)
 * @param 	content		XML content file (absolute path)
 */
void XmlDocx::addContent(string content)
{
	try
	{
		this->checkFile(content);
	}
	catch (exception& e)
  	{
  		cout << e.what() << endl;
  		exit(EXIT_FAILURE);
	}

	this->content.push_back(content);
}

/**
 * get XML properties file (file path)
 */
vector<string> XmlDocx::getProperties()
{
	return this->properties;
}

/**
 * add properties XML file (file path)
 * @param 	properties 	XML properties file (absolute path)
 */
void XmlDocx::addProperties(string properties)
{
	try
	{
		this->checkFile(properties);
	}
	catch (exception& e)
  	{
  		cout << e.what() << endl;
  		exit(EXIT_FAILURE);
	}

	this->properties.push_back(properties);
}

/**
 * Renders Word document out of the XML data.
 */
void XmlDocx::render()
{
	string xmlProperties = "";
	string xmlContent = "";

	// implode properties paths with " " separator
	for(size_t i = 0; i < this->properties.size(); ++i)
	{
		if(i != 0) {
			xmlProperties += " ";
		}
		xmlProperties += this->properties[i];
	}

	// implode content paths with " " separator
	for(size_t i = 0; i < this->content.size(); ++i)
	{
		if(i != 0) {
			xmlContent += " ";
		}
		xmlContent += this->content[i];
	}

	try
	{
		string command = "php " + this->getXmldocxPath() + "xmldocx/XMLAPICommand.php -c " + this->getConfig() + " -d " + xmlProperties + " -b " + xmlContent;
		int result = system(command.c_str());
	}
	catch(exception& e)
	{
		cout << e.what() << endl;
  		exit(EXIT_FAILURE);
	}

}