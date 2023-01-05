class BaseSearcher {
    constructor(id) {
        this.id = id;
    }
    async getUrl() {

    }
}

class JavdbSearcher extends BaseSearcher {
    constructor(id) {
        super(id)
    }
    async getUrl() {
        let baseUrl = "https://javdb.com/";
        let searchUrl = baseUrl + "search?q=" + this.id + "&f=all";
        let response = await request(searchUrl);
        if (response) {
            let html = $(response);
            let href = html.find("a[class='box']").attr("href");
            return baseUrl + href;
        }
        return null;
    }
}

class JavhooSearcher extends BaseSearcher {
    constructor(id) {
        super(id)
    }
    async getUrl() {
        return "https://www.javhoo.org/ja/av/" + this.id;
    }
}