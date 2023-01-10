chrome.runtime.onMessage.addListener(async (request, sender, callback) => {
    console.log({method: "main listener", request: request, callback: callback})

    callback({method:"main listener callback", request});
});

let downloader = null;
let popup = null;


async function sign(itemString){
    let item = eval(itemString);
    let hashCode = downloader.getMatchedFileHashCode(item[0].url);
    popup.sign(hashCode);
}

async function analysis(menuId) {
    downloader = new Downloader()

    popup = new Popup("miner", "矿工");
    popup.create();
    popup.show();

    let url = window.location.href;

    if(!url.includes("jpmnb.net")){
        downloader.set(new Resolver(url));
    }else{
        downloader.set(new Excavator(url));
    }
    
    popup.setDownloadEvent(async (sender) => await downloader.download(sender));
    popup.write(async () => await downloader.get());
}