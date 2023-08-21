chrome.runtime.onMessage.addListener(async (request, sender, callback) => {
    if (request.topic === "download"){
        await chrome.downloads.download(request.message, async (item) => {
            downloadItemInfos.set(item, sender.tab.id);
            /*
            await chrome.tabs.sendMessage(sender.tab.id, {
                topic:"download item",
                id: request.id,
                item: item
            }, callback);
            */
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
    /*
    let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tabs[0].id, {
        topic:"changed item",
        item: item
    });
    */
});


chrome.contextMenus.onClicked.addListener(async function (info, tab) {
    switch (info.menuItemId){
        case "menuSearch":
            if (tab.url.includes('dms.360scm.com') || tab.url.includes('devops.aliyun.com')){
                var url = null;
                var keyword = info.selectionText.toUpperCase();
                if (keyword.startsWith('RQ'))
                    url = 'https://dms.360scm.com/dms/dev/dev_view_rq.html?menuid=119&reqid=' + keyword;
                else if (keyword.startsWith('MP')){
                    url = 'https://dms.360scm.com/dms/cs/cs_view_malfunction.html?malfunction_id=' + keyword;
                }
                if (url) await chrome.tabs.create({ url: url, active: false });
            }
            else{
                await new JavdbSearcher(info.selectionText).open();
            }
            break
        case "menuDownload":
            await chrome.tabs.executeScript(tab.id, {
                code: "(async() => await analysis('" + info.menuItemId + "'))()"
            });
            break
        case "menuClear":
            await chrome.tabs.executeScript(tab.id, {
                code: "(async() => await clean_up())()"
            });
            break
    }
});

let downloadItemInfos = new Map();

const menus = [{
    id: "menuMain",
    visible: true,
    title: "矿工",
    contexts: ["all"],
}, {
    id: "menuDownload",
    visible: true,
    title: "☢ 开采",
    parentId: "menuMain",
    contexts: ["all"],
}, {
    id: "menuSearch",
    visible: true,
    title: "☣ 勘探",
    parentId: "menuMain",
    contexts: ["all"],
}, {
    type:"separator",
    parentId: "menuMain",
}, {
    id: "menuClear",
    visible: true,
    title: "✂ 清理",
    parentId: "menuMain",
    contexts: ["all"],
}/*
    ,{
        type:"separator",
        parentId: "menuMain", 
    },{ 
        id: "menuBurrow", 
        visible: true, 
        title: "☠ 挖掘", 
        parentId: "menuMain", 
        contexts: ["all"], 
    }*/
];

menus.forEach(menu => chrome.contextMenus.create(menu));