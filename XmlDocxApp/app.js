'use strict';

var fs = require("fs");
var express = require("express");
var XmlDocx = require("./xmldocxBasic/wrappers/node.js/XmlDocx.js");
var XmlDocxHelper = require("./xmldocx-helper.js");
var multer = require("multer");
var PORT = 8080;
var tempPath = "./temp"; // путь папки временного  хранения


if (!fs.existsSync(tempPath)) {
    fs.mkdir(tempPath);
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'temp/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

var upload = multer({ storage: storage });

var app = express();

app.use(express.static(__dirname + "/public"));

app.post("/xmlDocx", upload.single('data'), function (request, response) {
    console.log(request.file);
    if (request.file) {
        var outputName = request.file.originalname; // имя принятого файла
        var filePath = request.file.path; // путь принятого документа
        var ext = outputName.split(".").pop(); // расширение принятого файла
        if (ext === "doc" || ext === "docx") {

            // создаем xml файлы конфигурации для xmldocx
            var helper = new XmlDocxHelper(tempPath);
            var config = helper.getConfigXml(filePath, outputName);// второй параметр путь к обработанному файлу
            var content = helper.getContentXml();
            var settings = helper.getSettingsXml();

            // изменяем документ
            var document = new XmlDocx(config);
            document.setDocumentProperties(settings);
            document.addContent(content);
            document.render();

            // возвращаем изменненый документ
            response.writeHead(200, { "Content-Type": "application/msword" });
            fs.createReadStream(filePath).pipe(response);

            // удаляем временные файлы
            //   fs.unlinkSync(filePath);
            //   fs.unlinkSync(config);
            //  fs.unlinkSync(content);
            // fs.unlinkSync(settings);
        } else {
            //   fs.unlinkSync(filePath); // удаляем принятый файл
            response.sendStatus(400);
        }

    } else {
        response.sendStatus(400);
    }
});

app.listen(PORT, function () {
    console.log("server start on port: " + PORT);
});