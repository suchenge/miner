class BaseFileInfo{
    constructor() {
    }
}
class FileInfo extends BaseFileInfo{
    constructor(url, path, index, buildNameFunction) {
        super();
        this.uri = url;
        this.url = url;
        this.path = path;
        this.index = index;
        this.buildNameFunction = buildNameFunction;
        this.description = "file";
        if (url && !url.startsWith("http")) {
            let head = "http";
            let host = window.location.host;
            if (window.location.href.startsWith("https")) head = "https"
            this.url =  head + "://" + host + "/" + url;
        }

        if (url) {
            let urlGroup = url.split("/");
            let nameGroup = urlGroup[urlGroup.length - 1].split(".");
            this.type = nameGroup[nameGroup.length - 1];
        }

        let name = this.buildNameFunction(this);
        this.path = replaceBadFileName(path) + "/" + name + "." + this.type;
        this.hashCode = this.url ? this.url.hashCode() : "";
    }

    static getFiles(urls, path, buildNameFunction){
        let result = [];
        if (!urls) return result;

        urls.forEach((url, index) => {
            if(url
                && !url.startsWith("chrome-extension:")
                && !result.find(item => item.url === url))
                result.push(new FileInfo(url, path, index, buildNameFunction))
        });
        return result;
    }
}

FileInfo.prototype.toString = function() {
    return this.index === -1 ? this.url: this.index + " | " + this.url;
}

class TorrentInfo extends BaseFileInfo{
    constructor(torrent, path, index, buildNameFunction){
        super();
        this.torrent = torrent;
        this.index = index;
        this.type = "torrent";
        this.path = replaceBadFileName(path) + "/" + buildNameFunction(this) + ".torrent";
        this.url = this.getUrl();
        this.hashCode = this.url ? this.url.hashCode() : "";
        this.description = "torrent";
    }

    static getFiles(torrents, path, buildNameFunction){
        let result = [];
        if (!torrents) return result;

        let counter = 0;
        torrents.forEach((torrent, index) => {
            if (torrent.link && !result.find(item => item.torrent.link === torrent.link)){
                counter ++;
                let info = new TorrentInfo(torrent, path, counter, buildNameFunction);
                result.push(info);
            }
        });
        return result;
    }
}

TorrentInfo.prototype.toString = function(){
    return this.index + " | " + this.torrent.name + " | " + this.torrent.size + " | " + this.torrent.date;
}

TorrentInfo.prototype.getUrl = function(){
    let match = this.torrent.link.match(/magnet\:\?xt=urn\:btih\:(.*?)&dn=.*?/);
    let id = match[1];
    return `https://itorrents.org/torrent/${id}.torrent`;
    /*
    let idFirst = id.substr(0, 2);
    let idLast = id.substr(-2, 2);
    return `http://bt.box.n0808.com/${idFirst}/${idLast}/${id}.torrent`;
    */
}