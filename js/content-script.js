async function analysis(menuId) {
    let popup = new Popup("miner", "矿工");
    popup.create();
    popup.show();

    let miner = new Miner();
    let url = window.location.href;

    if(!url.includes("jpmnb.net")){
        miner.set(new Resolver(url));
    }else{
        miner.set(new Excavator(url));
    }
    
    popup.setDownloadEvent(async (sender) => miner.download(sender));
    popup.write(async () => await miner.get());
}