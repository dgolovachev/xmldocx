'use strict';

var fs = require("fs");
var express = require("express");
var logger = require('./logger.js');
var XmlDocx = require("./wrappers/XmlDocx.js");
var XmlDocxTools = require("./xmldocx-tools.js");
var multer = require("multer");
var PORT = 8080;
var tempPath = "./temp"; // путь папки временного  хранения
var delay = 6000; // время проверки файла

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'temp/'); // путь сохранения принятых файлов
    },
    filename: function (req, file, cb) {
        var ext = file.originalname.split(".").pop(); // расширение принятого файла
        if (ext) { cb(null, Date.now() + "." + ext); }
        else { cb(null, Date.now()); }
    }
});

var upload = multer({ storage: storage });
var app = express();
app.use(express.static(__dirname + "/public"));

app.post("/xmlDocx", upload.single('data'), function (request, response) {
    if (request.file) {
        var inputFileName = request.file.filename;
        var inputFilePath = `${__dirname}\\temp\\${inputFileName}`; // путь принятого файла
        var ext = inputFileName.split(".").pop(); // расширение принятого файла

        if (ext === "docx" /*|| ext === "doc"*/) { // триал версия работает только с файлами .docx
            logger.info("acepted file: " + inputFileName);
            ext = "." + ext;
            var outputFilePath = `${__dirname}\\temp\\upd_${inputFileName.replace(ext, "")}`; // путь нового документа

            // создаем xml файлы конфигурации для xmldocx
            var xmlDocxTools = new XmlDocxTools(tempPath);
            var config = xmlDocxTools.getConfigXml(inputFilePath, outputFilePath);
            var content = xmlDocxTools.getContentXml();
            var settings = xmlDocxTools.getSettingsXml();

            // путь сгенерированного документа с расширением
            outputFilePath = outputFilePath + ext;

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
                } else {
                    response.setHeader("Content-Type", "application/msword");
                    var file = fs.ReadStream(outputFilePath);
                    sendFile(file, response); // возвращаем изменненый документ
                    fs.unlinkSync(outputFilePath); // удаляем сгенированный документ
                }
                // удаляем временные файлы
                logger.info("delete temp file: " + inputFilePath + ", " + config + ", " + content + ", " + settings);
                fs.unlinkSync(inputFilePath);
                fs.unlinkSync(config);
                fs.unlinkSync(content);
                fs.unlinkSync(settings);
            });

        } else { // принятый файл имеет расширение отлмчное от .docx
            response.sendStatus(400);
            fs.unlinkSync(inputFilePath); // удаляем принятый файл
            logger.warn("sent unsupported file with extension: " + ext);
        }
    } else { // файл не принят
        logger.warn("request witout file");
        response.sendStatus(400);
    }
});

function sendFile(file, response) { // отправка файла с обработкой ошибок
    file.pipe(response);
    logger.info("sent file: " + file.path);

    file.on("error", function (error) { // обработка ошибки чтения файла
        response.sendStatus(500);
        logger.error(error)
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

app.listen(PORT, function () {
    logger.info("server start on port: " + PORT);
});