chrome.runtime.onMessage.addListener(async (request, sender, callback) => {
    if (request && request.topic && request.message && request.topic === "download") {
        await browserDownload(request.message);
        callback(request);
    }
});

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
    if (info.menuItemId === "menuSearch" && info.selectionText) {
        let javdbSearcher = new JavdbSearcher(info.selectionText);
        let javhooSearcher = new JavhooSearcher(info.selectionText);

        await chrome.tabs.create({ url: await javdbSearcher.getUrl(), active: false });
        await chrome.tabs.create({ url: await javhooSearcher.getUrl(), active: false });
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