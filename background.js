chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
   if (changeInfo.status === 'complete'){
       chrome.scripting.executeScript({
           target: { tabId: tabId },
           files: ["/js/main.js"],
       })
   }
});

/*
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.topic === "searchKeyword"){
        await chrome.scripting.executeScript({
            target: { tabId: sender.tab.id },
            args: [request.message.url, request.message.keyword],
            func: async (url, keyword) => await searchKeyword(url, keyword)
        });

        return true;
    }

    if (request.topic === "openUrl"){
        await chrome.tabs.create({ url: request.message.url, active: request.message.active });

        return true;
    }

    if (request.topic === "download"){
        await chrome.downloads.download(request.message, async (item) => {
            downloadItemInfos.set(item, sender.tab.id);
        });

        await sendResponse(request);

        return true;
    }

    if (request.topic === "appendBlackUrls"){
        let blackUrls = await getBlackUrls();

        if (blackUrls) blackUrls.push.apply(blackUrls, request.message);
        else blackUrls = request.message;

        blackUrls = [...new Set(blackUrls)];

        await chrome.storage.local.set({blackUrls:blackUrls});
    }

    if (request.topic === "setSetting"){
        await chrome.storage.local.set(request.message);
        console.log('[setSetting] Saved:', request.message);

        return true;
    }
})
*/

chrome.downloads.onChanged.addListener(async item => {
    if (item.state && (item.state.current === "complete" || item.state.current === "interrupted")) {
        console.log(item.state);
        chrome.downloads.search({ id: item.id }, async (fileItem) => {
            let tabId = downloadItemInfos.get(item.id);

            downloadItemInfos.delete(item.id);
            //await sign(tabId, dItem);

            chrome.scripting.executeScript({
                target: { tabId: tabId },
                args: [tabId, fileItem],
                func: async (tabId, fileItem) => await sign(tabId, fileItem)
            })
        });
    }
});


chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    switch (info.menuItemId){
        //勘探
        case "menuSearch":
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                args: [tab.url, info.selectionText],
                func: async (url, keyword) => await searchKeyword(url, keyword)
            });

            break;
        //开采
        case "menuDownload":
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                args: [info.menuItemId],
                func: async (menuItemId) => await analysis(menuItemId)
            });

            break;
        //清理
        case "menuClear":
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: async () => await clean_up()
            });

            break;
        //挖掘
        case "menuExcavate":
            await chrome.scripting.executeScript({
                target: { tabId: tab.id, allFrames: true },
                func: async () => await excavate()
            });

            break;
    }
});

//通过消息通知的下载文件信息
let downloadItemInfos = new Map();

const menus = [
    {
        id: "menuMain",
        visible: true,
        title: "矿工",
        contexts: ["all"],
    }, {
        id: "menuDownload",
        visible: true,
        title: "🗜️ 开采",
        parentId: "menuMain",
        contexts: ["all"],
    }, {
        id: "menuSearch",
        visible: true,
        title: "🛠️ 勘探",
        parentId: "menuMain",
        contexts: ["all"],
    }, {
        id: "menuExcavate",
        visible: true,
        title: "⛏️ 挖掘",
        parentId: "menuMain",
        contexts: ["all"],
    }, {
        id: "menuSeparator",
        type: "separator",
        parentId: "menuMain",
    }, {
        id: "menuClear",
        visible: true,
        title: "🪚 清理",
        parentId: "menuMain",
        contexts: ["all"],
    }
];

chrome.runtime.onInstalled.addListener(() => {
    menus.forEach(menu => chrome.contextMenus.create(menu));

    // 恢复代理状态
    chrome.storage.local.get(['proxyEnabled', 'proxySites'], (data) => {
        if (data.proxyEnabled) {
            setProxyConfig(data.proxySites || []);
            console.log('[proxy] 启动时恢复代理连接');
        }
    });
});


// =============================================================================
// 代理配置
// =============================================================================

var currentProxySites = [];

// 设置请求日志
function setupRequestLogging() {
    chrome.webRequest.onCompleted.addListener((details) => {
        if (details.url.startsWith('http')) {
            try {
                var url = new URL(details.url);
                var host = url.hostname;
                var isProxy = currentProxySites.some(site => host.includes(site));
                var status = isProxy ? '✅ 走代理' : '⬜ 直连';
                console.log(`[访问] ${host} - ${status}`);
            } catch (e) {}
        }
    }, { urls: ["<all_urls>"] });
}

// 初始化请求日志
setupRequestLogging();

/**
 * 设置代理：仅对指定网站走代理
 * @param {string[]} sites - 需要代理的网站域名列表
 */
function setProxyConfig(sites) {
    sites = sites || [];
    currentProxySites = sites;
    var proxyConfig;

    if (sites.length > 0) {
        var pacScript = `
            function FindProxyForURL(url, host) {
                var sites = ${JSON.stringify(sites)};
                for (var i = 0; i < sites.length; i++) {
                    if (host.indexOf(sites[i]) !== -1) {
                        return 'SOCKS5 127.0.0.1:7897';
                    }
                }
                return 'DIRECT';
            }
        `;
        proxyConfig = {
            mode: 'pac_script',
            pacScript: {
                data: pacScript
            }
        };
    } else {
        proxyConfig = {
            mode: 'fixed_servers',
            rules: {
                singleProxy: {
                    scheme: 'socks5',
                    host: '127.0.0.1',
                    port: 7897
                },
                bypassList: ['localhost', '127.0.0.1']
            }
        };
    }

    chrome.proxy.settings.set({ value: proxyConfig, scope: 'regular' });
}

/**
 * 清除代理，恢复直连
 */
function clearProxyConfig() {
    currentProxySites = [];
    chrome.proxy.settings.set({
        value: { mode: 'direct' },
        scope: 'regular'
    }, function() {
        console.log('[proxy] 已断开，恢复直连');
    });
}

// =============================================================================
// 消息监听
// =============================================================================

function getHostname(url) {
    try {
        return new URL(url).hostname;
    } catch (e) {
        return url;
    }
}

// 在页面右下角显示一个不影响操作的轻提示
function showPageToast(tabId, message, isError = false) {
    if (!tabId) return;

    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (text, error) => {
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
                    'background:rgba(0,0,0,.82)',
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

            toast.style.background = error ? 'rgba(160,30,30,.9)' : 'rgba(0,0,0,.82)';
            toast.textContent = text;
            clearTimeout(toast._minerToastTimer);
            requestAnimationFrame(() => { toast.style.opacity = '1'; });

            toast._minerToastTimer = setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 250);
            }, error ? 3000 : 2200);
        },
        args: [message, isError]
    }).catch(() => {});
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 原有消息处理
    if (request.topic === "searchKeyword"){
        chrome.scripting.executeScript({
            target: { tabId: sender.tab.id },
            args: [request.message.url, request.message.keyword],
            func: async (url, keyword) => await searchKeyword(url, keyword)
        });
        return true;
    }

    if (request.topic === "openUrl"){
        chrome.tabs.create({ url: request.message.url, active: request.message.active })
            .then(() => {
                showPageToast(sender.tab && sender.tab.id, '已在新标签页打开：' + getHostname(request.message.url));
                sendResponse({ ok: true });
            })
            .catch(error => {
                showPageToast(sender.tab && sender.tab.id, '打开标签页失败：' + error, true);
                sendResponse({ ok: false, error: String(error) });
            });

        return true;
    }

    // 在后台请求跨域页面，content script 里的 XHR 会受页面同源策略限制
    if (request.topic === "fetchHtml"){
        const { url, cookies } = request.message;

        (async () => {
            if (cookies && cookies.length) {
                for (const cookie of cookies) {
                    await chrome.cookies.set({
                        url: url,
                        name: cookie.name,
                        value: cookie.value,
                        path: '/',
                        secure: true,
                        sameSite: 'no_restriction'
                    });
                }
            }

            const response = await fetch(url, { credentials: 'include' });
            const html = await response.text();

            if (response.ok) {
                showPageToast(sender.tab && sender.tab.id, '页面获取成功：' + getHostname(url));
            } else {
                showPageToast(sender.tab && sender.tab.id, '页面获取失败：HTTP ' + response.status, true);
            }

            sendResponse({
                ok: response.ok,
                status: response.status,
                html: response.ok ? html : '',
                error: response.ok ? null : 'HTTP ' + response.status
            });
        })().catch(err => {
            showPageToast(sender.tab && sender.tab.id, '页面获取失败：' + err, true);
            sendResponse({ ok: false, error: String(err) });
        });

        return true;
    }

    if (request.topic === "download"){
        chrome.downloads.download(request.message, async (item) => {
            downloadItemInfos.set(item, sender.tab.id);
        });
        sendResponse(request);
        return true;
    }

    if (request.topic === "appendBlackUrls"){
        getBlackUrls().then(blackUrls => {
            if (blackUrls) blackUrls.push.apply(blackUrls, request.message);
            else blackUrls = request.message;
            blackUrls = [...new Set(blackUrls)];
            chrome.storage.local.set({blackUrls:blackUrls});
        });
        return true;
    }

    if (request.topic === "setSetting"){
        chrome.storage.local.set(request.message);
        console.log('[setSetting] Saved:', request.message);
        sendResponse({ success: true });
        return true;
    }

    // 代理相关消息处理
    if (request.topic === 'setProxy') {
        const enabled = request.message.enabled;
        const sites = request.message.sites || [];
        if (enabled) {
            setProxyConfig(sites);
        } else {
            clearProxyConfig();
        }
        chrome.storage.local.set({ proxyEnabled: enabled, proxySites: sites }, () => {
            sendResponse({ success: true, enabled: enabled });
        });
        return true;
    }

    if (request.topic === 'getProxyStatus') {
        chrome.storage.local.get(['proxyEnabled', 'proxyNode'], (data) => {
            sendResponse({
                enabled: data.proxyEnabled || false,
                node: data.proxyNode || null
            });
        });
        return true;
    }
});