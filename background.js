chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
   if (changeInfo.status === 'complete'){
       chrome.scripting.executeScript({
           target: { tabId: tabId },
           files: ["/js/main.js"],
       })
   }
});


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
})

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
});

/**
 * background_new.js
 * 独立可复用的 HTTPS 代理插件
 *
 * 功能：
 * 1. URL 通过正则匹配，走代理访问
 * 2. 其他 URL 直连
 * 3. 监听 tab 变化自动更新路由
 */

// =============================================================================
// 配置区 — 使用前修改这里的常量
// =============================================================================

// 正则匹配：满足匹配条件的 URL 走代理（不限制协议）
var PROXY_PATTERN = "我是谁.com";

// 代理服务器地址和端口
var PROXY_HOST = 'hk2.408944cc-d6ed-26d7-1145-a584d9a7ea1f.71a30608.the-best-airport.com';
var PROXY_PORT = 443;

// =============================================================================
// 代理配置
// =============================================================================

/**
 * 设置代理：正则匹配成功走代理，其他直连
 */
function setProxyConfig() {
  var pacScript = [
    'function FindProxyForURL(url, host) {',
    '  var PROXY = "HTTPS ' + PROXY_HOST + ':' + PROXY_PORT + '";',
    '  var DEFAULT = "DIRECT";',
    '  var re = "' + PROXY_PATTERN + '";',
    '  if (url.includes(re)) return PROXY;',
    '  return DEFAULT;',
    '}',
  ].join('\n');

  var config = {
    mode: 'pac_script',
    pacScript: { data: pacScript }
  };

  chrome.proxy.settings.set({ value: config, scope: 'regular' }, function() {
    console.log('[proxy] PAC 已设置');
  });
}

/**
 * 清除代理，恢复直连
 */
function clearProxyConfig() {
  chrome.proxy.settings.set({
    value: { mode: 'system' },
    scope: 'regular'
  }, function() {
    console.log('[proxy] 已断开，恢复直连');
  });
}

// =============================================================================
// Tab 监控
// =============================================================================

// Tab 切换时
chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function(tab) {
    if (tab && tab.url) {
      updateProxyStatus(tab.url);
    }
  });
});

// 同一 Tab 内 URL 变化时
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.url) {
    updateProxyStatus(changeInfo.url);
  }
});

/**
 * 根据 URL 正则匹配结果更新状态
 * @param {string} url
 */
function updateProxyStatus(url) {
  if (url.includes(PROXY_PATTERN)) {
    console.log('[proxy] 当前页面走代理:', url);
    proxyConnect();
  } else {
    proxyDisconnect();
    console.log('[proxy] 当前页面直连:', url);
  }
}

// =============================================================================
// 对外 API
// =============================================================================

/**
 * 连接代理
 */
function proxyConnect() {
  setProxyConfig();
  chrome.storage.local.set({ connected: 1 });
  console.log('[proxy] 已连接');
}

/**
 * 断开代理
 */
function proxyDisconnect() {
  clearProxyConfig();
  chrome.storage.local.set({ connected: 0 });
  console.log('[proxy] 已断开');
}