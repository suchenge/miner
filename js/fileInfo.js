class FileInfo{
    constructor(url, path, index, buildNameFunction) {
        this.uri = url;
        this.url = url;
        this.path = path;
        this.index = index;
        this.buildNameFunction = buildNameFunction;
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
    }

    get(){
        let name = this.buildNameFunction(this);
        return {
            uri: this.uri,
            url: this.url,
            type: this.type,
            path: replaceBadFileName(this.path) + "\\" + name + "." + this.type,
            id: this.url.hashCode()
        }
    }

    static getFiles(urls, path, buildNameFunction){
        let result = [];
        urls.forEach((url, index) => result.push(new FileInfo(url, path, index, buildNameFunction)));
        return result;
    }
}

FileInfo.prototype.toString = function() {
    return this.url;
}

FileInfo.prototype.hashCode = function(){
    if(this.url) return this.url.hashCode();
    return "";
}

class TorrentInfo{
    constructor(torrent, path, index, buildNameFunction){
        this.torrent = torrent;
        this.index = index,
        this.type = "torrent";
        this.path = replaceBadFileName(path) + "\\" + buildNameFunction(this) + ".torrent";
        this.url = this.getUrl();
    }

    static getFiles(torrents, path, buildNameFunction){
        let result = [];
        torrents.forEach((torrent, index) => result.push(new TorrentInfo(torrent, path, index, buildNameFunction)));
        return result;
    }
}

TorrentInfo.prototype.toString = function(){
    return this.index + " | " + this.torrent.name + " | " + this.torrent.size + " | " + this.torrent.date;
}

TorrentInfo.prototype.hashCode = function(){
    return this.url.hashCode();
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