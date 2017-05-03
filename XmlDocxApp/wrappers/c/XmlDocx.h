// data structure to linked lists
typedef struct node 
{
    char *val;
    struct node *next;
} nodeType;

// data structure to load xmlDocx properties
typedef struct XmlDocx 
{
	// XML config file
	char *config;
	// absolute path
	char *xmldocxPath;
	// debug mode
	int debug;	
	// XML properties files
	nodeType *properties;
	// XML content files
	nodeType *content;

} XmlDocxType;

/**
 * void init: initialize xmldocx structure.
 * @param xmldocx Item of type XmlDocxType
 * @param xmlConfig XML properties file path
 * @param debug	Debug mode
 */
void init(XmlDocxType *xmldocx, char *xmlConfig, int debug);

/**
 * void addContent: add content to xmldocx structure.
 * @param xmldocx Item of type XmlDocxType
 * @param xmlContent XML content file path
 */
void addContent(XmlDocxType *xmldocx, char *xmlContent);

/**
 * void addDocumentProperties: add settings to xmldocx structure.
 * @param xmldocx Item of type XmlDocxType
 * @param xmlProperties XML properties file path
 */
void addDocumentProperties(XmlDocxType *xmldocx, char *xmlProperties);

/**
 * void render: add settings to xmldocx structure.
 * @param xmldocx Item of type XmlDocxType
 */
void render(XmlDocxType xmldocx);

/**
 * void render: absolute path to the xmldocx folder.
 * @param xmldocx Item of type XmlDocxType
 */
void setXmldocxPath(XmlDocxType *xmldocx, char *xmldocxPath);