chrome.runtime.onMessage.addListener(async (request, sender, callback) => {
    if (request.topic === "download"){
        await chrome.downloads.download(request.message, async (item) => {
            downloadItemInfos.set(item, sender.tab.id);
        });

        callback(request);
    }

    if (request.topic === "bookmark"){
        await chrome.bookmarks.search({url: request.message}, async (item) => {
            let bookmarkString = JSON.stringify(item);
            chrome.bookmarks.remove(item[0].id, () => {
                chrome.tabs.executeScript(sender.tab.id, {
                    code: "(async() => await clean_up_sign('" + sender.tab.id + "', '" + bookmarkString + "'))()"
                });
            });
        });
    }

    if (request.topic === "appendBlackUrls"){
        let blackUrls = await getBlackUrls();

        if (blackUrls) blackUrls.push.apply(blackUrls, request.message);
        else blackUrls = request.message;

        blackUrls = [...new Set(blackUrls)];

        await chrome.storage.local.set({blackUrls:blackUrls});
    }

    if (request.topic === "searchKeyword"){
        await searchKeyword(request.message.url, request.message.keyword);
    }

    if (request.topic === "openUrl"){
        await openUrl(request.message.url);
    }
});

chrome.downloads.onChanged.addListener(async item => {
    if (item.state && (item.state.current === "complete" || item.state.current === "interrupted")) {
        chrome.downloads.search({ id: item.id }, dItem => {
            let itemString = JSON.stringify(dItem);
            let tabId = downloadItemInfos.get(item.id);
            downloadItemInfos.delete(item.id);

            chrome.tabs.executeScript(tabId, {
                code: "(async() => await sign('" + tabId + "', '" + itemString + "'))()"
            });
        });
    }
});


chrome.contextMenus.onClicked.addListener(async function (info, tab) {
    switch (info.menuItemId){
        //勘探
        case "menuSearch":
            await searchKeyword(tab.url, info.selectionText);
            break;
        //开采
        case "menuDownload":
            await chrome.tabs.executeScript(tab.id, {
                code: "(async() => await analysis('" + info.menuItemId + "'))()"
            });
            break;
        //清理
        case "menuClear":
            await chrome.tabs.executeScript(tab.id, {
                code: "(async() => await clean_up())()"
            });
            break;
        //挖掘
        case "menuExcavate":
            await chrome.tabs.executeScript(tab.id, {
                code: "(async() => await excavate())()"
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
        type:"separator",
        parentId: "menuMain",
    }, {
        id: "menuClear",
        visible: true,
        title: "🪚 清理",
        parentId: "menuMain",
        contexts: ["all"],
    }
];

menus.forEach(menu => chrome.contextMenus.create(menu));