'use strict';

var fs = require("fs");
var express = require("express");
var logger = require('./logger.js');
var XmlDocx = require("./wrappers/XmlDocx.js");
var XmlDocxTools = require("./xmldocx-tools.js");
var multer = require("multer");
var tempPath = "./temp"; // ���� ����� ����������  ��������
var delay = 6000; // ����� �������� �����
var supportExtensions = ["docx", "doc"]; // ����� ������ �������� ������ � ������� .docx

module.exports.protect = function (request, response) {
    var file = request.file;
    if (!file || file.size == 0) { // ���� �� ������ ��� ������
        logger.warn("request witout file or file emty");
        response.sendStatus(400);
    }
    else {
        var inputFileName = file.filename;
        var inputFilePath = getInputFilePath(inputFileName);
        var ext = inputFileName.split(".").pop();

        if (!supportExtension(ext)) { // �� �������������� ����������
            logger.warn("sent unsupported file with extension: " + ext);
            removeFile(inputFilePath); // ������� �������� ����
            response.sendStatus(400);
        }
        else {
            logger.info("acepted file: " + inputFileName);
            var outputFilePath = getOutputFilePath(inputFileName); // ���� ������ ���������

            // ������� xml ����� ������������ ��� xmldocx
            var xmlDocxTools = new XmlDocxTools(tempPath);
            var config = xmlDocxTools.getProtectedConfigXml(inputFilePath, outputFilePath); // ������ �� ��������������
            var content = xmlDocxTools.getContentXml();
            var settings = xmlDocxTools.getSettingsXml();

            // �������� ��������
            var document = new XmlDocx(config);
            document.setDocumentProperties(settings);
            document.addContent(content);
            document.render(function (err) {
                if (err) {
                    logger.error(err);
                    // ������� ��������� �����
                    logger.info("delete temp file: " + inputFilePath + ", " + config + ", " + content + ", " + settings);
                    removeFile(inputFilePath, config, content, settings);
                    response.sendStatus(500);
                }
                else {
                    //response.setHeader("Content-Type", "application/msword"); // word < 2007 .doc
                    response.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"); // word > 2007 .docx
                    var file = fs.ReadStream(outputFilePath);
                    sendFile(file, response, function (err) {// ���������� ���������� ��������
                        if (err) {
                            logger.error(err);
                            response.sendStatus(500);
                        }
                        // ������� ��������� �����
                        logger.info("delete temp file: " + inputFilePath + ", " + outputFilePath + ", " + config + ", " + content + ", " + settings);
                        removeFile(inputFilePath, outputFilePath, config, content, settings);
                    });
                }
            });
        }
    }
};

module.exports.digitalSignature = function (request, response) {
    var files = request.files;
    if (!files) {
        logger.warn("empy request");
        response.sendStatus(400);
    }
    else {
        if (files.length !== 3) {
            logger.warn("count files: " + files.length);
            for (var i = 0; i < files.length; i++) {
                removeFile(__dirname + "/" + files[i].path);
            }
            response.sendStatus(400);
        }
        else {
            if (!checkFilesExtension(files) || !checkFilesSize(files)) {
                logger.warn("wrong file send");
                for (var i = 0; i < files.length; i++) {
                    removeFile(__dirname + "/" + files[i].path);
                }
                response.sendStatus(400);
            }
            else {
                var inputFilePath = getInputFilePath(files[0].filename);
                var certificatePath = getInputFilePath(files[1].filename);
                var privateKeyPath = getInputFilePath(files[2].filename);

                // ������� xml ����� ������������ ��� xmldocx
                var xmlDocxTools = new XmlDocxTools(tempPath);
                var config = xmlDocxTools.getDigitalConfigXml(inputFilePath, privateKeyPath, certificatePath); // ��������� �������� �������
                var content = xmlDocxTools.getContentXml();
                var settings = xmlDocxTools.getSettingsXml();

                // �������� ��������
                var document = new XmlDocx(config);
                document.setDocumentProperties(settings);
                document.addContent(content);
                document.render(function (err) {
                    if (err) {
                        logger.error(err);
                        // ������� ��������� �����
                        logger.info("delete temp file");
                        removeFile(config, content, settings);
                        for (var i = 1; i < files.length; i++) {
                            removeFile(__dirname + "/" + files[i].path);
                        }
                        response.sendStatus(500);
                    }
                    else {
                        //response.setHeader("Content-Type", "application/msword"); // word < 2007 .doc
                        response.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"); // word > 2007 .docx
                        var file = fs.ReadStream(inputFilePath);
                        sendFile(file, response, function (err) {
                            if (err) {
                                logger.error(err);
                                response.sendStatus(500);
                            }
                            // ������� ��������� �����
                            logger.info("delete temp file");
                            removeFile(config, content, settings);
                            for (var i = 1; i < files.length; i++) {
                                removeFile(__dirname + "/" + files[i].path);
                            }
                        });
                    }
                });
            }
        }
    }
};

module.exports.test = function (request, response) {
    var file = request.file;
    if (!file || file.size == 0) { // ���� �� ������ ��� ������
        logger.warn("request witout file or file emty");
        response.sendStatus(400);
    }
    else {
        var inputFileName = file.filename;
        var inputFilePath = getInputFilePath(inputFileName); // ���� ��������� �����
        var ext = inputFileName.split(".").pop(); // ���������� ��������� �����

        if (!supportExtension(ext)) { // �������� ���� ����� �� �������������� ���������� 
            logger.warn("sent unsupported file with extension: " + ext);
            removeFile(inputFilePath); // ������� �������� ����
            response.sendStatus(400);
        }
        else {
            logger.info("acepted file: " + inputFileName);
            var outputFilePath = getOutputFilePath(inputFileName); // ���� ������ ���������

            // ������� xml ����� ������������ ��� xmldocx
            var xmlDocxTools = new XmlDocxTools(tempPath);
            var config = xmlDocxTools.getConfigXml(inputFilePath, outputFilePath);
            var content = xmlDocxTools.getContentXml();
            var settings = xmlDocxTools.getSettingsXml();

            // ���� ���������������� ��������� � �����������
            outputFilePath = outputFilePath + "." + ext;

            // �������� ��������
            var document = new XmlDocx(config);
            document.setDocumentProperties(settings);
            document.addContent(content);
            document.render(function (err) {
                if (err) {
                    logger.error(err);
                    // ������� ��������� �����
                    logger.info("delete temp file: " + inputFilePath + ", " + config + ", " + content + ", " + settings);
                    removeFile(inputFilePath, config, content, settings);
                    response.sendStatus(500);
                }
                else {
                    //response.setHeader("Content-Type", "application/msword"); // word < 2007 .doc
                    response.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"); // word > 2007 .docx
                    var file = fs.ReadStream(outputFilePath);
                    sendFile(file, response, function (err) { // ���������� ���������� ��������
                        if (err) {
                            logger.error(err);
                            response.sendStatus(500);
                        }
                        logger.info("delete temp file: " + inputFilePath + ", " + outputFilePath + ", " + config + ", " + content + ", " + settings);
                        removeFile(inputFilePath, outputFilePath, config, content, settings);
                    });
                }
            });
        }
    }
};

function sendFile(file, response, callback) { // �������� ����� � ���������� ������
    file.pipe(response);
    logger.info("sent file: " + file.path);

    file.on("error", function (error) { // ��������� ������ ������ �����
        callback(error);
    });

    response.on("close", function () { // ����������� ������� ������� ������ ���� ������ �� �� ����� ������ ���� 
        logger.info("destroy file: " + file.path);
        file.destroy();
        callback(null);
    });
}

function supportExtension(input) {
    if (!input) return false;
    var ext = input.split(".").pop();
    for (var i = 0; i < supportExtensions.length; i++) {
        if (ext === supportExtensions[i]) {
            return true;
        }
    }

    return false;
}

function removeFile() {
    for (var i = 0; i < arguments.length; i++) {
        fs.unlinkSync(arguments[i]);
    }
}

function getInputFilePath(fileName) {
    return `${__dirname}/temp/${fileName}`;
}

function getOutputFilePath(fileName) {
    return `${__dirname}/temp/upd_${fileName}`;
}

function checkFilesSize(filesArray) {
    if (!filesArray) return false;

    var result = true;
    filesArray.forEach(function (item) {
        if (item.size == 0) {
            result = false;
        };
    });
    return result;

}

function checkFilesExtension(filesArray) {
    if (!filesArray) return false;

    var dataExt = filesArray[0].filename.split(".").pop();
    var certificateExt = filesArray[1].filename.split(".").pop();
    var keyExt = filesArray[2].filename.split(".").pop();
    if (dataExt === "doc" || dataExt === "docx" && certificateExt === "crt" || certificateExt === "pem" && keyExt === "key") {
        return true;
    }
    return false;
}