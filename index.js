#!/usr/bin/env node

var pjson = require('./package.json');
var version = pjson.version;

var exists, inquirer, request, chalk, url, http, exec, fs, rimraf;
var boxes = [];
var jsonUrl = 'https://raw.githubusercontent.com/Projekod/Projekod-Downloader/master/pkdofile.json';

request = require('request');
chalk = require('chalk');
inquirer = require('inquirer');
exists = require('fs').existsSync;
fs = require('fs');
url = require('url');
http = require('http');
exec = require('child_process').exec;
rimraf = require("rimraf");

request(jsonUrl, function (error, response, body) {
    if (response.statusCode !== 200) {
        console.log(chalk.red("HATA! - Versiyon dosyası indirme sırasında bir hata oluştu"));
        console.log(body);
        console.log(response.statusCode);
        console.log(error);
        process.exit();
    }

    if (response.statusCode === 200) {
        var _object = JSON.parse(body);
        var _version = _object.version;
        var _cv = checkVersion(version, _version);
        if (_cv < 0) {
            console.log(chalk.red("Kullandığınız uygulamanın versiyonu geride kalmış, lütfen güncelleyin"));
            process.exit();
        } else {
            boxes = _object.boxes;
            main();
        }
    }
});

function main() {
    var choices = boxes.map(function (item, key) {
        return (key + 1) + '- ' + chalk.yellow(item.name) + ' (' + item.description + ')';
    });
    inquirer.prompt([
        {
            type: 'list',
            name: 'download',
            message: 'Ne vereyim abime ?',
            paginated: true,
            choices: choices
        },
        {
            type: 'input',
            name: 'directory',
            message: 'Klasör adı ne olsun ? : ',
            default: function () {
                return '.';
            }
        }
    ]).then(function (answer) {
        var downloadStr = answer.download;
        var keys = downloadStr.split("- ");
        var directory = answer.directory;
        if (keys.length > 1) {
            var key = (keys[0] - 1);
            var box = boxes[key];
            rockNRoll(box, directory);
        } else {
            console.log(chalk.red("Cevap metni düzenlenemedi."));
            process.exit();
        }
    });
}

function rockNRoll(box, directory) {
    var inHere = !directory || directory === '.';

    if (exists(directory)) {
        inquirer.prompt([{
            type: 'confirm',
            message: inHere
                ? 'Bulunduğun dizine yüklemek istiyor musun ?'
                : 'Belirttiğin dizin zaten var onun içine yüklemek istiyor musun ?',
            name: 'ok'
        }]).then(function (answer) {
            if (!answer.ok) {
                console.log(chalk.red("Kullanıcı isteği ile program sonlandırıldı."));
                process.exit();
            }
            downloadBox(box, directory);
        })
    } else {
        downloadBox(box, directory);
    }
}

function downloadBox(box, directory) {
    console.log(chalk.green('Dosyanız indiriliyor lütfen bekleyin'));
    exec('git clone https://github.com/' + box.target + '.git ' + directory, (err, stdout, stderr) => {
        if (err) {
            return;
        }
        console.log(chalk.green('İndirme işlemi tamamlandı'));
        rimraf(directory + '/.git', function () {
            console.log(chalk.green('Klasör hazırlandı'));
        });
    });
}

function checkVersion(a, b) {
    if (a === b) {
        return 0;
    }
    var a_components = a.split(".");
    var b_components = b.split(".");
    var len = Math.min(a_components.length, b_components.length);
    for (var i = 0; i < len; i++) {
        if (parseInt(a_components[i]) > parseInt(b_components[i])) {
            return 1;
        }
        if (parseInt(a_components[i]) < parseInt(b_components[i])) {
            return -1;
        }
    }
    if (a_components.length > b_components.length) {
        return 1;
    }
    if (a_components.length < b_components.length) {
        return -1;
    }
    return 0;
}
