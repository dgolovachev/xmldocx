var fs = require("fs");

function XmlDocxHelper(tempPath) {
    this.tempPath = tempPath;

    if (!this.tempPath)
        throw "Path is empty";
    if (!fs.existsSync(tempPath)) {
        fs.mkdir(tempPath);
    }
}

XmlDocxHelper.prototype.getContentXml = function () {
    var fileName = `${this.tempPath}/content_${Date.now()}.xml`;

    var data = `<?xml version="1.0" encoding="UTF-8"?>
    <pdx:document xmlns:pdx="http://www.phpdocx.com/main" >
        <pdx:content>
            <pdx:addText>
                <pdx:textRun>
                    <pdx:data pdx:dataId="" pdx:dataType="text">Hello world!</pdx:data>
                </pdx:textRun>
            </pdx:addText>
        </pdx:content>
    </pdx:document>`;

    writeFileData(fileName, data);

    return fileName;
}

XmlDocxHelper.prototype.getConfigXml = function (docPath, outputName) {
    if (!docPath)
        throw "Document Path is empy";
    var fileName = `${this.tempPath}/config_${Date.now()}.xml`;

    var data = `<?xml version="1.0" encoding="UTF-8"?>
    <pdx:document xmlns:pdx="http://www.phpdocx.com/main" >
        <pdx:config>
            <pdx: template pdx: path="${docPath}" />
            <pdx:output pdx:name="D://${outputName}" pdx:type="docx" />
        </pdx:config>
    </pdx:document>`;

    writeFileData(fileName, data);

    return fileName;
}

XmlDocxHelper.prototype.getSettingsXml = function () {
    var fileName = `${this.tempPath}/settings_${Date.now()}.xml`;

    var data = `<?xml version="1.0" encoding="UTF-8"?>
    <pdx:document xmlns:pdx="http://www.phpdocx.com/main" >
        <pdx:settings>
      </pdx:settings>
    </pdx:document>`;

    writeFileData(fileName, data);
    return fileName;
}

function writeFileData(fileName, data) {
    try {
        fs.writeFileSync(fileName, data);
    } catch (e) { throw "Error write data: " + e.message; }
}

// exports
module.exports = XmlDocxHelper;