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