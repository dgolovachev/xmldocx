'use strict';

var fs = require("fs");
var express = require("express");
var logger = require('./logger.js');
var XmlDocx = require("./wrappers/XmlDocx.js");
var XmlDocxTools = require("./xmldocx-tools.js");
var multer = require("multer");
var tempPath = "./temp"; // ���� ����� ����������  ��������
var delay = 6000; // ����� �������� �����
var supportExtensions = ["docx"]; // ����� ������ �������� ������ � ������� .docx

module.exports.protect = function (request, response) {
    if (!request.file) { // ���� �� ������
        logger.warn("request witout file");
        response.sendStatus(400);
    }
    else {
        var inputFileName = request.file.filename;
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
            document.render();

            // ����������� �������� �����
            checkFile(outputFilePath, delay, function (err, data) {
                if (err) {
                    logger.error("error in process generating document: " + outputFilePath);
                    response.sendStatus(500);
                }
                else {
                    response.setHeader("Content-Type", "application/msword");
                    var file = fs.ReadStream(outputFilePath);
                    sendFile(file, response); // ���������� ���������� ��������
                    removeFile(outputFilePath); // ������� ������������� ��������
                }

                // ������� ��������� �����
                logger.info("delete temp file: " + inputFilePath + ", " + config + ", " + content + ", " + settings);
                removeFile(inputFilePath, config, content, settings);
            });
        }
    }
};

module.exports.signature = function (request, response) {
    if (!request.file) { // ���� �� ������
        logger.warn("request witout file");
        response.sendStatus(400);
    }
    else {
        var inputFileName = request.file.filename;
        var inputFilePath = getInputFilePath(inputFileName);
        var ext = inputFileName.split(".").pop();

        if (!supportExtension(ext)) { // �� �������������� ����������
            logger.warn("sent unsupported file with extension: " + ext);
            removeFile(inputFilePath); // ������� �������� ����
            response.sendStatus(400);
        }
        else {
            logger.info("acepted file: " + inputFileName);
            var outputFilePath = getOutputFilePath(inputFileName);

            var certificatePath = `${__dirname}/cert/certificate.crt `;
            var privaKeyPath = `${__dirname}/cert/privaKey.key `;

            // ������� xml ����� ������������ ��� xmldocx
            var xmlDocxTools = new XmlDocxTools(tempPath);
            var config = xmlDocxTools.getDigitalConfigXml(inputFilePath, privaKeyPath, certificatePath); // ��������� �������� �������
            var content = xmlDocxTools.getContentXml();
            var settings = xmlDocxTools.getSettingsXml();

            // �������� ��������
            var document = new XmlDocx(config);
            document.setDocumentProperties(settings);
            document.addContent(content);
            document.render();

            // �������� ��������� ������ xmldocx           
            setTimeout(function () {
                response.setHeader("Content-Type", "application/msword");
                var file = fs.ReadStream(inputFilePath);
                sendFile(file, response); // ���������� ���������� ��������

                // ������� ��������� �����
                logger.info("delete temp file: " + inputFilePath + ", " + config + ", " + content + ", " + settings);
                removeFile(inputFilePath, config, content, settings);
            }, 1500);
        }
    }
};

module.exports.test = function (request, response) {
    if (!request.file) { // ���� �� ������
        logger.warn("request witout file");
        response.sendStatus(400);
    }
    else {
        var inputFileName = request.file.filename;
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
            document.render();

            // ����������� �������� �����
            checkFile(outputFilePath, delay, function (err, data) {
                if (err) {
                    response.sendStatus(500);
                    logger.error("error in process generating document: " + outputFilePath);
                }
                else {
                    response.setHeader("Content-Type", "application/msword");
                    var file = fs.ReadStream(outputFilePath);
                    sendFile(file, response); // ���������� ���������� ��������
                    removeFile(outputFilePath); // ������� ������������� ��������
                }
                // ������� ��������� �����
                logger.info("delete temp file: " + inputFilePath + ", " + config + ", " + content + ", " + settings);
                removeFile(inputFilePath, config, content, settings);
            });
        }
    }
};

function sendFile(file, response) { // �������� ����� � ���������� ������
    file.pipe(response);
    logger.info("sent file: " + file.path);

    file.on("error", function (error) { // ��������� ������ ������ �����
        logger.error(error)
        response.sendStatus(500);
    });

    response.on("close", function () { // ����������� ������� ������� ������ ���� ������ �� �� ����� ������ ���� 
        logger.info("destroy file: " + file.path);
        file.destroy();
    });
}

function checkFile(path, delay, callback) { // ����������� �������� ������������� ����� �.�. ���������� xmldocx �� ���������� ��������� ������
    var timer = setTimeout(function () {
        clearInterval(interval); // ������� �������� �������� ������������� �����
        callback("error file not exist", null);
    }, delay);

    var interval = setInterval(function () {
        if (fs.existsSync(path)) {
            clearTimeout(timer);// ������� ������ ����������� ������ 
            clearInterval(interval); // ������� �������� �������� ������������� �����
            callback(null, true);
        }
    }, 100);
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