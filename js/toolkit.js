String.prototype.hashCode = function () {
    if (!this) return this;

    var hash = 0, i, chr;
    if (this.length === 0) return hash;

    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; 
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

// 页面内轻提示：只用 DOM API，扩展上下文失效时依然可用
function showPageToast(text, isError = false) {
    const TOAST_ID = 'miner-page-toast';

    let toast = document.getElementById(TOAST_ID);
    if (!toast) {
        toast = document.createElement('div');
        toast.id = TOAST_ID;
        toast.style.cssText = [
            'position:fixed',
            'right:20px',
            'bottom:20px',
            'z-index:2147483647',
            'max-width:320px',
            'padding:10px 14px',
            'border-radius:6px',
            'color:#fff',
            'font:13px/1.45 system-ui,-apple-system,sans-serif',
            'box-shadow:0 4px 14px rgba(0,0,0,.28)',
            'pointer-events:none',
            'opacity:0',
            'transition:opacity .2s ease',
            'word-break:break-all'
        ].join(';');
        (document.body || document.documentElement).appendChild(toast);
    }

    toast.style.background = isError ? 'rgba(160,30,30,.9)' : 'rgba(0,0,0,.82)';
    toast.textContent = text;
    clearTimeout(toast._minerToastTimer);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });

    toast._minerToastTimer = setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 250);
    }, isError ? 3000 : 2200);
}

function sendMessage(topic, id, messageBody, callback) {
    let request = {
        topic: topic,
        id: id,
        message: messageBody
    };

    console.log('[sendMessage]', topic, messageBody);

    try {
        // 插件重新加载/更新后，已打开页面的 content script 会变成"孤儿"，
        // 此时 chrome.runtime 已失效，需要刷新页面
        if (!chrome.runtime?.id) throw new Error('Extension context invalidated');

        chrome.runtime.sendMessage(request, callback);
    } catch (error) {
        console.warn('[sendMessage] 扩展上下文已失效，请刷新页面后重试', error);
        showPageToast('扩展上下文已失效，请刷新页面后重试', true);
    }
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
