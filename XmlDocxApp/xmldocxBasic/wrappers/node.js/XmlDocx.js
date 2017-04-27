"use strict";

var fs = require("fs"),
    path = require("path"),
    exec = require("child_process").exec;

/**
 * Creates a Word document out of a XML file.
 *
 * Example:
 *  var test = new XmlDocx("config.xml");
 *  test.setDocumentProperties("settings.xml");
 *  test.addContent("content.xml");
 *  test.render();
 */
function XmlDocx(xml, debug) {
    if (!fs.existsSync(xml)) {
        throw "The file does not exist";
    }

    this.config = path.resolve(process.cwd(), xml);
    this.documentContent = [];
    this.documentProperties = [];
    this.debug = debug;
    this.xmldocxPath = __dirname + "/../";
}

/**
 * XML file with content to be added to the Word document.
 */
XmlDocx.prototype.addContent = function(xml) {
    if (!fs.existsSync(xml)) {
        throw "The file does not exist";
    }

    this.documentContent.push(path.resolve(process.cwd(), xml));
}

/**
 * XML file with the general properties of the Word document.
 */
XmlDocx.prototype.setDocumentProperties = function(xml) {
    if (!fs.existsSync(xml)) {
        throw "The file does not exist";
    }

    this.documentProperties.push(path.resolve(process.cwd(), xml));
}

/**
 * Absolute path to the xmldocx folder.
 */
XmlDocx.prototype.setXmldocxPath = function(xmldocxPath) {
    this.xmldocxPath = xmldocxPath;
}

/**
 * Renders Word document out of the XML data.
 */
XmlDocx.prototype.render = function() {
    var output = exec("php " + this.xmldocxPath + "xmldocx/XMLAPICommand.php -c" + this.config + " -d" + this.documentProperties.join(" ") + " -b'" + this.documentContent.join(" ") + "'");

    if (this.debug) {
        console.log(output);
    }
}

module.exports = XmlDocx;