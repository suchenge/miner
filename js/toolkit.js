String.prototype.hashCode = function () {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

function request(url) {
    return new Promise((resolve, reject) => {
        $.ajax(url, {
            dataType: 'html',
            timeout: 5000,
            type: 'GET',
            success: function (result) {
                resolve(result);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                /*
                alert(jqXHR.responseText);
                alert(jqXHR.status);
                alert(jqXHR.readyState);
                alert(jqXHR.statusText);
                alert(textStatus);
                alert(errorThrown);
                */
                reject(new Error('返回错误'))
            }
        })
    });
};

function sendDownloadMessage(downloadInfo, callback) {
    chrome.runtime.sendMessage(downloadInfo, callback);
};

async function browserDownload(downloadInfo, callback) {
    if (downloadInfo) {
        if (downloadInfo instanceof Array) {
            for (const info of downloadInfo) {
                await chrome.downloads.download(info);
            }
        } else {
            await chrome.downloads.download(downloadInfo);
        }
    }
};

function buildDownloadInfo(uri, name, path) {
    let id = uri;
    if (!uri.startsWith("http")) {
        let h = "http://";
        if (window.location.href.startsWith("https")) h = "https://";
        uri = h + window.location.host + "/" + uri;
    }
    if (uri && path) {
        return {
            topic: "download",
            id: id.hashCode(),
            message: {
                url: uri,
                filename: replaceBadFileName(path) + "\\" + name,
                method: "GET",
                conflictAction: 'overwrite',
                saveAs: false
            }
        };
    }
    return null;
};

function getName(url, index) {
    let uris = url.split("/");
    let name = uris[uris.length - 1];
    let names = name.split(".");
    let type = names[names.length - 1];

    return (index + "").padStart(5, "0") + "." + type;
};

function buildFileInfo(uri, id, index) {
    let getNameFunction = (uri, id, index) => {
        if (id) return getFileName(uri, id, index);
        return getName(uri, index);
    };

    return getNameFunction(uri, id, index);
};

function buildFileInfos(uris, id) {
    let infos = [];
    uris.forEach((uri, index) => infos.push(buildFileInfo(uri, id, index)));

    return infos;
};

function getFileName(url, id, index) {
    let uris = url.split("/");
    let name = uris[uris.length - 1];
    let names = name.split(".");
    let type = names[names.length - 1];

    if (index > -1) {
        name = id + "_" + index + "." + type;
    } else {
        name = id + "." + type;
    }
    return name;
};

function replaceBadFileName(name) {
    let str = name;
    str = str.replace(/\?/g, '');
    str = str.replace(/\:/g, '');
    str = str.replace(/\*/g, '');
    str = str.replace(/\"/g, '');
    str = str.replace(/\</g, '');
    str = str.replace(/\>/g, '');
    str = str.replace(/\\/g, '');
    str = str.replace(/\//g, '');
    str = str.replace(/\|/g, '');
    //str = str.replace(/\./g, '');
    return str;
}
