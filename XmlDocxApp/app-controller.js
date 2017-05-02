'use strict';

var fs = require("fs");
var express = require("express");
var logger = require('./logger.js');
var XmlDocx = require("./wrappers/XmlDocx.js");
var XmlDocxTools = require("./xmldocx-tools.js");
var multer = require("multer");
var tempPath = "./temp"; // путь папки временного  хранения
var delay = 6000; // время проверки файла
var supportExtensions = ["docx"]; // триал версия работает только с файлами .docx

module.exports.protect = function (request, response) {
    if (!request.file) { // файл не принят
        logger.warn("request witout file");
        response.sendStatus(400);
    }
    else {
        var inputFileName = request.file.filename;
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
            document.render();

            // асинхронная проверка файла
            checkFile(outputFilePath, delay, function (err, data) {
                if (err) {
                    logger.error("error in process generating document: " + outputFilePath);
                    response.sendStatus(500);
                }
                else {
                    response.setHeader("Content-Type", "application/msword");
                    var file = fs.ReadStream(outputFilePath);
                    sendFile(file, response); // возвращаем изменненый документ
                    removeFile(outputFilePath); // удаляем сгенированный документ
                }

                // удаляем временные файлы
                logger.info("delete temp file: " + inputFilePath + ", " + config + ", " + content + ", " + settings);
                removeFile(inputFilePath, config, content, settings);
            });
        }
    }
};

module.exports.signature = function (request, response) {
    if (!request.file) { // файл не принят
        logger.warn("request witout file");
        response.sendStatus(400);
    }
    else {
        var inputFileName = request.file.filename;
        var inputFilePath = getInputFilePath(inputFileName);
        var ext = inputFileName.split(".").pop();

        if (!supportExtension(ext)) { // не поддерживаемое расширение
            logger.warn("sent unsupported file with extension: " + ext);
            removeFile(inputFilePath); // удаляем принятый файл
            response.sendStatus(400);
        }
        else {
            logger.info("acepted file: " + inputFileName);
            var outputFilePath = getOutputFilePath(inputFileName);

            var certificatePath = `${__dirname}/cert/certificate.crt `;
            var privaKeyPath = `${__dirname}/cert/privaKey.key `;

            // создаем xml файлы конфигурации для xmldocx
            var xmlDocxTools = new XmlDocxTools(tempPath);
            var config = xmlDocxTools.getDigitalConfigXml(inputFilePath, privaKeyPath, certificatePath); // установка цифровой подписи
            var content = xmlDocxTools.getContentXml();
            var settings = xmlDocxTools.getSettingsXml();

            // изменяем документ
            var document = new XmlDocx(config);
            document.setDocumentProperties(settings);
            document.addContent(content);
            document.render();

            // ожидание окончания работы xmldocx           
            setTimeout(function () {
                response.setHeader("Content-Type", "application/msword");
                var file = fs.ReadStream(inputFilePath);
                sendFile(file, response); // возвращаем изменненый документ

                // удаляем временные файлы
                logger.info("delete temp file: " + inputFilePath + ", " + config + ", " + content + ", " + settings);
                removeFile(inputFilePath, config, content, settings);
            }, 1500);
        }
    }
};

module.exports.test = function (request, response) {
    if (!request.file) { // файл не принят
        logger.warn("request witout file");
        response.sendStatus(400);
    }
    else {
        var inputFileName = request.file.filename;
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
            document.render();

            // асинхронная проверка файла
            checkFile(outputFilePath, delay, function (err, data) {
                if (err) {
                    response.sendStatus(500);
                    logger.error("error in process generating document: " + outputFilePath);
                }
                else {
                    response.setHeader("Content-Type", "application/msword");
                    var file = fs.ReadStream(outputFilePath);
                    sendFile(file, response); // возвращаем изменненый документ
                    removeFile(outputFilePath); // удаляем сгенированный документ
                }
                // удаляем временные файлы
                logger.info("delete temp file: " + inputFilePath + ", " + config + ", " + content + ", " + settings);
                removeFile(inputFilePath, config, content, settings);
            });
        }
    }
};

function sendFile(file, response) { // отправка файла с обработкой ошибок
    file.pipe(response);
    logger.info("sent file: " + file.path);

    file.on("error", function (error) { // обработка ошибки чтения файла
        logger.error(error)
        response.sendStatus(500);
    });

    response.on("close", function () { // освобождаем ресурсы занятые файлом если клиент не до конца скачал файл 
        logger.info("destroy file: " + file.path);
        file.destroy();
    });
}

function checkFile(path, delay, callback) { // асинхронная проверка существования файла т.к. библиотека xmldocx не возвращает результат работы
    var timer = setTimeout(function () {
        clearInterval(interval); // удаляем интервал проверки существования файла
        callback("error file not exist", null);
    }, delay);

    var interval = setInterval(function () {
        if (fs.existsSync(path)) {
            clearTimeout(timer);// удаляем таймер отправлящий ошибку 
            clearInterval(interval); // удаляем интервал проверки существования файла
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