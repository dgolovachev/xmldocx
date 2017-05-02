'use strict';

var express = require("express");
var logger = require('./logger.js');
var multer = require("multer");
var controller = require("./app-controller.js");

var PORT = 8080;
var tempPath = "./temp"; // путь папки временного  хранения

var storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, tempPath); // путь сохранения принятых файлов
    },
    filename: function (req, file, cb) {
        var ext = file.originalname.split(".").pop(); // расширение принятого файла
        if (!ext) cb(null, Date.now());
        else cb(null, Date.now() + "." + ext);
    }

});
var upload = multer({ storage: storage });

var app = express();
app.use(express.static(__dirname + "/public"));

app.post("/protect", upload.single('data'), controller.protect);

app.post("/signature", upload.single('data'), controller.signature)

app.post("/test", upload.single('data'), controller.test)

app.listen(PORT, function () {
    logger.info("server start on port: " + PORT);
});