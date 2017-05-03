/**
 * Create a Word document out of a XML file.
 *
 * Example:
 *
 *	  #include "XmlDocx.h"
 *
 * 	  XmlDocxType doc;
 * 
 * 	  char *config = "config.xml";
 * 	  char *properties = "settings.xml";
 * 	  char *content = "content.xml";
 * 
 * 	  init(doc, "config.xml", 0);
 * 	  addDocumentProperties(doc, "settings.xml");
 * 	  addContent(doc, "content.xml");
 * 	  render(doc);
 */

#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include "XmlDocx.h"

extern int errno;

/**
 * checkFilePath: check if absolutePath is a valid path
 * @param absolutePath
 */
void checkFilePath(char *absolutePath)
{
	FILE* fp;
	
	fp = fopen(absolutePath, "r"); // read mode	
	if( fp == NULL )
	{
		fprintf(stderr, "Error: %d\n", errno);
		fprintf(stderr, ">> The file does not exist: %s\n", strerror( errno ));
		exit(EXIT_FAILURE);
	}
	fclose(fp);
}

/**
 * void init: initialize xmldocx structure.
 * @param xmldocx Item of type XmlDocxType
 * @param xmlConfig XML properties file path
 * @param debug	Debug mode
 */
void init(XmlDocxType *xmldocx, char *xmlConfig, int debug) 
{
	// set properties and content
	xmldocx->properties = NULL;
	xmldocx->content = NULL;

	// set mode
	xmldocx->debug = debug;

	// set base path
	char *currentPath = getcwd(0, 0);	
	char *baseXmlDocxPath;
	asprintf(&baseXmlDocxPath, "%s/../../", currentPath);
	xmldocx->xmldocxPath = baseXmlDocxPath;

	// check config file exists and set XML config
	checkFilePath(xmlConfig);
	xmldocx->config = xmlConfig;
}

/**
 * void addContent: add content to xmldocx structure.
 * @param xmldocx Item of type XmlDocxType
 * @param xmlContent XML content file path
 */
void addContent(XmlDocxType *xmldocx, char *xmlContent) 
{
	// add item to the end of the list
	if (xmldocx->content) {
		nodeType *current = xmldocx->content;
		while (current->next != NULL) {
	        current = current->next;
	    }
	    current->next = malloc(sizeof(nodeType));
	    current->next->val = xmlContent;
	    current->next->next = NULL;	
	} else {
		nodeType *current = malloc(sizeof(nodeType));
    	current->val = xmlContent;
    	current->next = NULL;
    	xmldocx->content = current;
	}
}

/**
 * void addDocumentProperties: add settings to xmldocx structure.
 * @param xmldocx Item of type XmlDocxType
 * @param xmlProperties XML properties file path
 */
void addDocumentProperties(XmlDocxType *xmldocx, char *xmlProperties) 
{
	// add item to the end of the list
	if (xmldocx->properties) {
		nodeType *current = xmldocx->properties;
		while (current->next != NULL) {
	        current = current->next;
	    }
	    current->next = malloc(sizeof(nodeType));
	    current->next->val = xmlProperties;
	    current->next->next = NULL;
	} else {
		nodeType *current = malloc(sizeof(nodeType));
    	current->val = xmlProperties;
    	current->next = NULL;
    	xmldocx->properties = current;
	}
}

/**
 * void render: absolute path to the xmldocx folder.
 * @param xmldocx Item of type XmlDocxType
 */
void setXmldocxPath(XmlDocxType *xmldocx, char *xmldocxPath)
{
    xmldocx->xmldocxPath = xmldocxPath;
}

/**
 * void render: renderize the xmldocx structure.
 * @param xmldocx Item of type XmlDocxType
 */
void render(XmlDocxType xmldocx) 
{
    char properties[2000];
    char content[2000];

    // join the XML properties paths into a single string
    nodeType *current = xmldocx.properties;
    while (current != NULL) {
        strcat(properties, " ");
		strcat(properties, current->val);

		// jump to next file
		current = current->next;
    }
    free(current);

	// join the XML content paths into a single string
    current = xmldocx.content;
    while (current != NULL) {
        strcat(content, " ");
        strcat(content, current->val);

        // jump to next file
        current = current->next;
    }
    free(current);

    char *command;
    asprintf(&command, "php %sxmldocx/XMLAPICommand.php -c %s -d %s -b %s", xmldocx.xmldocxPath, xmldocx.config, properties, content);

    int result = system(command);
}