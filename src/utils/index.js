import Fs from "fs";
import Path, { resolve } from "path";
import axios from "axios";

let files = [];

const traverseSync = (dir) => {
    Fs.readdirSync(dir).map((file) => {
        const path = Path.join(dir, file);
        return Fs.lstatSync(path).isDirectory()
            ? traverseSync(path)
            : validateExtension(path);
    });

    return files;
};

const validateExtension = (file) => {
    var allowedExtensions = /(.md)$/i;

    return allowedExtensions.exec(file)
        ? files.push({
              name: file,
              value: file,
          })
        : false;
};

const getAllLinksFromFile = (file) => {
    let links = [];

    const matches = file.match(/\[([^\[]+)\](\(.*\))/gm) || [];

    const singleMatch = /\[([^\[]+)\]\((.*)\)/;

    for (var i = 0; i < matches.length; i++) {
        var text = singleMatch.exec(matches[i]);
        links.push(text[2]);
    }

    return links;
};

const readFile = (path) =>
    new Promise((resolve, reject) => {
        Fs.readFile(path, "utf-8", (err, data) => {
            if (err) reject(err);
            resolve(getAllLinksFromFile(data.toString()));
        });
    });


const validateLinksFiles = async (links) => {
    return  await axiosPEticion(links);
}

const axiosPEticion = async (links) => {
    try {
        let response = [];

        await Promise.all(
            links.map(async (link) => {
                response.push(await validatePerUrl(link));
            })
        )

        return response;
    } catch (error) {
        console.log(error)
    }

};

const validatePerUrl = (url) => {
    return axios
        .get(url)
        .then(function (response) {
            if (response.status === 201 || response.status === 200) {
                return {
                    url,
                    success: true,
                    status: response.status
                };
            } else {
                return {
                    url,
                    success: false,
                    status: response.status
                }
            }

        })
        .catch(function (error) {
            return {
                url,
                success: false,
                status: error.code
            }
        });
}

export { traverseSync, readFile, validateLinksFiles };
