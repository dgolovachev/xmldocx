'use strict';

var fs = require("fs");
var express = require("express");
var logger = require('./logger.js');
var XmlDocx = require("./wrappers/XmlDocx.js");
var XmlDocxTools = require("./xmldocx-tools.js");
var multer = require("multer");
var tempPath = "./temp"; // путь папки временного  хранения
var delay = 6000; // время проверки файла
var supportExtensions = ["docx", "doc"]; // триал версия работает только с файлами .docx

module.exports.protect = function (request, response) {
    var file = request.file;
    if (!file || file.size == 0) { // файл не принят или пустой
        logger.warn("request witout file or file emty");
        response.sendStatus(400);
    }
    else {
        var inputFileName = file.filename;
        var inputFilePath = getInputFilePath(inputFileName);
        var ext = inputFileName.split(".").pop();

        if (!supportExtension(ext)) { // не поддерживаемое расширение
            logger.warn("sent unsupported file with extension: " + ext);
            removeFile(inputFilePath); // удаляем принятый файл
            response.sendStatus(400);
        }
        else {
            logger.info("acepted file: " + inputFileName);
            var outputFilePath = getOutputFilePath(inputFileName); // путь нового документа

            // создаем xml файлы конфигурации для xmldocx
            var xmlDocxTools = new XmlDocxTools(tempPath);
            var config = xmlDocxTools.getProtectedConfigXml(inputFilePath, outputFilePath); // защита от редактирования
            var content = xmlDocxTools.getContentXml();
            var settings = xmlDocxTools.getSettingsXml();

            // изменяем документ
            var document = new XmlDocx(config);
            document.setDocumentProperties(settings);
            document.addContent(content);
            document.render(function (err) {
                if (err) {
                    logger.error(err);
                    // удаляем временные файлы
                    logger.info("delete temp file: " + inputFilePath + ", " + config + ", " + content + ", " + settings);
                    removeFile(inputFilePath, config, content, settings);
                    response.sendStatus(500);
                }
                else {
                    //response.setHeader("Content-Type", "application/msword"); // word < 2007 .doc
                    response.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"); // word > 2007 .docx
                    var file = fs.ReadStream(outputFilePath);
                    sendFile(file, response, function (err) {// возвращаем изменненый документ
                        if (err) {
                            logger.error(err);
                            response.sendStatus(500);
                        }
                        // удаляем временные файлы
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

                // создаем xml файлы конфигурации для xmldocx
                var xmlDocxTools = new XmlDocxTools(tempPath);
                var config = xmlDocxTools.getDigitalConfigXml(inputFilePath, privateKeyPath, certificatePath); // установка цифровой подписи
                var content = xmlDocxTools.getContentXml();
                var settings = xmlDocxTools.getSettingsXml();

                // изменяем документ
                var document = new XmlDocx(config);
                document.setDocumentProperties(settings);
                document.addContent(content);
                document.render(function (err) {
                    if (err) {
                        logger.error(err);
                        // удаляем временные файлы
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
                            // удаляем временные файлы
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
    if (!file || file.size == 0) { // файл не принят или пустой
        logger.warn("request witout file or file emty");
        response.sendStatus(400);
    }
    else {
        var inputFileName = file.filename;
        var inputFilePath = getInputFilePath(inputFileName); // путь принятого файла
        var ext = inputFileName.split(".").pop(); // расширение принятого файла

        if (!supportExtension(ext)) { // принятый файл имеет не поддерживаемое расширение 
            logger.warn("sent unsupported file with extension: " + ext);
            removeFile(inputFilePath); // удаляем принятый файл
            response.sendStatus(400);
        }
        else {
            logger.info("acepted file: " + inputFileName);
            var outputFilePath = getOutputFilePath(inputFileName); // путь нового документа

            // создаем xml файлы конфигурации для xmldocx
            var xmlDocxTools = new XmlDocxTools(tempPath);
            var config = xmlDocxTools.getConfigXml(inputFilePath, outputFilePath);
            var content = xmlDocxTools.getContentXml();
            var settings = xmlDocxTools.getSettingsXml();

            // путь сгенерированного документа с расширением
            outputFilePath = outputFilePath + "." + ext;

            // изменяем документ
            var document = new XmlDocx(config);
            document.setDocumentProperties(settings);
            document.addContent(content);
            document.render(function (err) {
                if (err) {
                    logger.error(err);
                    // удаляем временные файлы
                    logger.info("delete temp file: " + inputFilePath + ", " + config + ", " + content + ", " + settings);
                    removeFile(inputFilePath, config, content, settings);
                    response.sendStatus(500);
                }
                else {
                    //response.setHeader("Content-Type", "application/msword"); // word < 2007 .doc
                    response.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"); // word > 2007 .docx
                    var file = fs.ReadStream(outputFilePath);
                    sendFile(file, response, function (err) { // возвращаем изменненый документ
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

function sendFile(file, response, callback) { // отправка файла с обработкой ошибок
    file.pipe(response);
    logger.info("sent file: " + file.path);

    file.on("error", function (error) { // обработка ошибки чтения файла
        callback(error);
    });

    response.on("close", function () { // освобождаем ресурсы занятые файлом если клиент не до конца скачал файл 
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