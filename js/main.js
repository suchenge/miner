chrome.runtime.onMessage.addListener(async (request, sender, callback) => {
    console.log({method: "main listener", request: request, callback: callback})

    callback({method:"main listener callback", request});
});

let popup = new Popup("miner", "矿工");
async function analysis(menuId) {
    let url = window.location.href;

    let downloader = new Downloader()
    downloader.set(!url.includes("jpmnb.net") ? new Resolver(url) : new Excavator(url));

    popup.create();
    popup.show();
    popup.isCanBeSelect(content => content instanceof BaseFileInfo);
    popup.isDefaultSelected(content => content instanceof FileInfo);
    popup.download(async(lines) => await downloader.download(lines));
    await popup.write(async() => await downloader.get());
}

async function sign(fileItem){
    let item = eval(fileItem)[0];
    console.log(item);
    let hashCode = item.url.hashCode();
    popup.sign(hashCode, item.state === "complete");
}