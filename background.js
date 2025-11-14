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
})