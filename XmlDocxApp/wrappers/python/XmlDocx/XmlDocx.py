import os as os
import subprocess as subprocess
import xml.etree.ElementTree as ElementTree

class XmlDocx():
    """Creates a Word document out of a XML file.

    Attributes:
        xml (string): config XML file path
        debug (bool, optional): turn on debug mode

    Example:
        test = XmlDocx("config.xml")
        test.setDocumentProperties("settings.xml")
        test.addContent("content.xml")
        test.render()

    Raises:
        Exception: If the file does not exist
    """

    def __init__(self, xml, debug = False):
        if not os.path.isfile(xml):
            raise Exception('The file does not exist')

        self.config = os.path.abspath(xml)
        self.content = []
        self.documentProperties = []
        self.debug = debug
        self.xmldocxPath = os.path.dirname(os.path.abspath(__file__)) + '/../../../'

    def addContent(self, xml):
        """XML file with content to be added to the Word document.

        Raises:
            Exception: If the file does not exist
        """
        if not os.path.isfile(xml):
            raise Exception('The file does not exist')

        self.content.append(os.path.abspath(xml))

    def setDocumentProperties(self, xml):
        """XML file with the general properties of the Word document.

        Raises:
            Exception: If the file does not exist
        """
        if not os.path.isfile(xml):
            raise Exception('The file does not exist')

        self.documentProperties.append(os.path.abspath(xml))

    def setXmlDocxPath(self, xmldocxPath):
        """Absolute path to the xmldocx folder
        """
        self.xmldocxPath = xmldocxPath

    def render(self):
        """Renders Word document out of the XML data.
        """
        subprocess.call(["php", self.xmldocxPath + "xmldocx/XMLAPICommand.php", "-c" + self.config, "-d" + ' '.join(self.documentProperties), "-b" + ' '.join(self.content)])