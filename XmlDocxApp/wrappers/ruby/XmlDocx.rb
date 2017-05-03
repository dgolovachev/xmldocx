# Creates a Word document out of a XML file.
#
# Example
#   test = XmlDocx.new("config.xml")
#   test.setDocumentProperties("settings.xml")
#   test.addContent("content.xml")
#   test.render

require 'pathname'

class XmlDocx
    def initialize(xml, debug = false)
        unless File.file?(xml)
            raise 'The file does not exist'
        end

        @config = Pathname.new(xml).realpath.to_s
        @content = Array.new
        @documentProperties = Array.new
        @debug = debug
        @xmldocxPath = File.dirname(__FILE__) + '/../'
    end

    # XML file with content to be added to the Word document.
    def addContent(xml)
        unless File.file?(xml)
            raise 'The file does not exist'
        end

        @content.push(Pathname.new(xml).realpath.to_s)
    end

    # XML file with the general properties of the Word document.
    def setDocumentProperties(xml)
        unless File.file?(xml)
            raise 'The file does not exist'
        end

        @documentProperties.push(Pathname.new(xml).realpath.to_s)
    end

    # Absolute path to the xmldocx folder
    def setXmlDocxPath(xmldocxPath)
        @xmldocxPath = xmldocxPath
    end

    # Renders Word document out of the XML data.
    def render
        system("php", @xmldocxPath + "xmldocx/XMLAPICommand.php", "-c" + @config, "-d" + @documentProperties * " ", "-b" + @content * " ")
    end
end