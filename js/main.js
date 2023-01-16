chrome.runtime.onMessage.addListener(async (request, sender, callback) => {
    console.log({method: "main listener", request: request, callback: callback})

    callback({method:"main listener callback", request});
});

let popup = new Popup("miner", "矿工");
async function analysis(menuId) {
    let url = window.location.href;

    let downloader = new Downloader()
    downloader.set(getMiner(url));

    popup.create();
    popup.show();
    popup.isCanBeSelect(content => content instanceof BaseFileInfo);
    popup.isDefaultSelected(content => content instanceof FileInfo);
    popup.download(async(lines) => await downloader.download(lines));
    await popup.write(async() => await downloader.get());
}

async function sign(tabId, fileItem){
    let item = eval(fileItem)[0];
    console.log({tabId, item});
    let hashCode = item.url.hashCode();
    popup.sign(hashCode, item.state === "complete");
}

function getMiner(url){
    let result = new BaseExcavator(url);

    let settings = [
        {
            name: "jpmnb",
            miner: () => new JpmnbExcavator(url)
        },{
            name: "xiannvku",
            miner: () => new XiannvkuExcavator(url)
        },{
            name: "xiurenba",
            miner: () => new XiurenbaExcavator(url)
        },{
            name: "xrmn01",
            miner: () => new Xrmn01Excavator(url)
        },{
            name: "javhoo",
            miner: () => new JavhooResolver(url)
        },{
            name: "javdb",
            miner: () => new JavdbResolver(url)
        },
    ]
    
    for(const setting of settings){
        if (url.includes(setting.name)){
            result = setting.miner();
            break;
        }
    }

    return result;
}