chrome.runtime.onMessage.addListener(async (request, sender, callback) => {
    console.log({method: "main listener", request: request, callback: callback})

    callback({method:"main listener callback", request});
});

let donwloader = new Downloader();
let popup = new Popup("miner", "矿工");
popup.create();

async function sign(itemString){
    let item = eval(itemString);
    let hashCode = donwloader.getMatchedFileHashCode(item[0].url);
    popup.sign(hashCode);
}

async function analysis(menuId) {
    popup.show();

    let url = window.location.href;

    if(!url.includes("jpmnb.net")){
        donwloader.set(new Resolver(url));
    }else{
        donwloader.set(new Excavator(url));
    }
    
    popup.setDownloadEvent(async (sender) => await donwloader.download(sender));
    popup.write(async () => await donwloader.get());
}