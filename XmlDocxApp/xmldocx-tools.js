"use strict";

var fs = require("fs");

function XmlDocxTools(tempPath) {
    if (!tempPath) throw "path is empty";
    this.tempPath = tempPath;
    if (!fs.existsSync(tempPath))
        fs.mkdirSync(tempPath);
}

XmlDocxTools.prototype.getConfigXml = function (documentPath, outputPath) {
    if (!documentPath) throw "document path is empy";
    if (!outputPath) throw "output path is empy";

    var fileName = `${this.tempPath}/config_${Date.now()}.xml`;

    var data = `<?xml version="1.0" encoding="UTF-8"?>
    <pdx:document xmlns:pdx="http://www.phpdocx.com/main" >
        <pdx:config>
            <pdx:template pdx:path="${documentPath}" />
            <pdx:output pdx:name="${outputPath}" pdx:type="docx" />
        </pdx:config>
    </pdx:document>`;

    writeFileData(fileName, data);

    return fileName;
}

XmlDocxTools.prototype.getProtectedConfigXml = function (documentPath, outputPath) {
    if (!documentPath) throw "document path is empy";
    if (!outputPath) throw "output path is empy";

    var fileName = `${this.tempPath}/config_${Date.now()}.xml`;

    var data = `<?xml version="1.0" encoding="UTF-8"?>
                <pdx:document xmlns:pdx="http://www.phpdocx.com/main">
                    <pdx:config>
                        <pdx:output pdx:name="output" pdx:type="docx" />
                        <pdx:crypto>
                            <pdx:protect pdx:password="" pdx:src="${documentPath}" pdx:target="${outputPath}" />
                        </pdx:crypto>
                    </pdx:config>
                </pdx:document>`;

    writeFileData(fileName, data);

    return fileName;
}

XmlDocxTools.prototype.getDigitalConfigXml = function (documentPath, privateKeyPath, certificatePath) {
    if (!documentPath) throw "document path is empy";
    if (!privateKeyPath) throw "privatekey path is empy";
    if (!certificatePath) throw "certificate path is empy";

    var fileName = `${this.tempPath}/config_${Date.now()}.xml`;

    var data = `<?xml version="1.0" encoding="UTF-8"?>
                <pdx:document xmlns:pdx="http://www.phpdocx.com/main">
                    <pdx:config>
                        <pdx: output pdx: name="output" pdx: type="docx" />
                        <pdx:crypto>
                            <pdx:sign pdx:privateKey="${privateKeyPath}" pdx:password="" pdx:X509Certificate="${certificatePath}" pdx:src="${documentPath}" />
                        </pdx:crypto>
                    </pdx:config>
                </pdx:document>`;

    writeFileData(fileName, data);

    return fileName;
}

XmlDocxTools.prototype.getContentXml = function () {
    var fileName = `${this.tempPath}/content_${Date.now()}.xml`;

    var data = `<?xml version="1.0" encoding="UTF-8"?>
    <pdx:document xmlns:pdx="http://www.phpdocx.com/main" >
        <pdx:content>
        </pdx:content>
    </pdx:document>`;

    writeFileData(fileName, data);

    return fileName;
}

XmlDocxTools.prototype.getSettingsXml = function () {
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
    }
    catch (e) { throw "error write data: " + e.message; }
}

// exports
module.exports = XmlDocxTools;