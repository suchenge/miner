chrome.runtime.onMessage.addListener(async (request, sender, callback) => {
    if (request.topic === "download"){
        await chrome.downloads.download(request.message, async (item) => {
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
});

chrome.downloads.onChanged.addListener(async item => {
    if (item.state && item.state.current === "complete") {
        chrome.downloads.search({id:item.id}, dItem => {
            let itemString = JSON.stringify(dItem);
            chrome.tabs.executeScript({
                code: "(async() => await sign('" + itemString + "'))()"
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
    if (info.menuItemId === "menuSearch" && info.selectionText) {
        await new JavdbSearcher(info.selectionText).open();
        await new JavhooSearcher(info.selectionText).open();
    }
    else {
        await chrome.tabs.executeScript({
            code: "(async() => await analysis('" + info.menuItemId + "'))()"
        });
    }
});

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