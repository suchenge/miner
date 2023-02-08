String.prototype.hashCode = function () {
    if (!this) return this;

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
}

function sendMessage(topic, id, messageBody, callback) {
    let request = {
        topic: topic,
        id: id,
        message: messageBody
    };
    console.log({method: "sendMessage", request: request});
    chrome.runtime.sendMessage(request, callback);
}

async function matchBookmark(url){
    return await chrome.bookmarks.get("临时");
}

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
