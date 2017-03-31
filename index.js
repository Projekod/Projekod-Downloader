#!/usr/bin/env node
var version = '0.0.1';
var download, program, exists, path, inquirer, request, chalk;
var boxes = [];
var jsonUrl = 'https://raw.githubusercontent.com/Projekod/Projekod-Downloader/master/pkdofile.json';

request = require('request');
chalk = require('chalk');

/* Check Version */

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
