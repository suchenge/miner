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

async function getBlackUrls(){
    return await new Promise((resolve, reject) => {
        chrome.storage.local.get('blackUrls', data => {
            if(data && data.blackUrls) resolve(data.blackUrls);
            else resolve([]);
        });
    });
}

async function matchBookmark(url){
    return await chrome.bookmarks.get("临时");
}

function replaceBadFileName(name) {
    let str = name;
    str = str.replace(/\'/g, '');
    str = str.replace(/\?/g, '');
    str = str.replace(/\？/g,'');
    str = str.replace(/\:/g, '');
    str = str.replace(/\*/g, '');
    str = str.replace(/\"/g, '');
    str = str.replace(/\</g, '');
    str = str.replace(/\>/g, '');
    str = str.replace(/\\/g, '');
    str = str.replace(/\//g, '');
    str = str.replace(/\|/g, '');
    str = str.trim();
    //str = str.replace(/\./g, '');
    return str;
}

function isRelativePath(url){
    return !/^https?:\/\//i.test(url);
}

function isPic(url){
    return /\.(gif|jpg|jpeg|png|webp)/i.test(url);
}

function getAbsoluteUrl(url){
    var img = new Image();
    img.src = url;  // 设置相对路径给Image, 此时会发送出请求
    url = img.src;  // 此时相对路径已经变成绝对路径
    img.src = null; // 取消请求
    return url;
}

function createLink(url){
    let newA = document.createElement("a");
    newA.href = url;
    return newA;
}

function getAbsoluteUrlByHref(url){
    let newA = createLink(url);
    let href = newA.href;
    newA.remove();
    return href;
}

async function openUrl(url, isActive = false){
    await chrome.tabs.create({ url: url, active: isActive });
}
