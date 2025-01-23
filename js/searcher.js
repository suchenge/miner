class BaseSearcher {
    constructor(id) {
        this.id = id.trim();
    }

    active = false;
    async getUrl() {

    }
    async open(){
        if (this.id){
            let url = await this.getUrl();
            if (url){
                await chrome.tabs.create({ url: await this.getUrl(), active: this.active });
            }
        }
    }
}

class JavbusSearcher extends BaseSearcher {
    constructor(id){
        id = id.replace(/(\d+)/, '-$1');
        console.log(id);
        super(id);
    }

    active = false;

    async getUrl(){
        let url = "https://www.javbus.com/" + this.id;
        return url;
    }
}

class Scm360Searcher extends BaseSearcher {
    constructor(id) {
        super(id);
    }

    active = true;
    async getUrl(){
        let url;
        if (this.id.startsWith('RQ'))
            url = 'https://dms.360scm.com/dms/dev/dev_view_rq.html?reqid=' + this.id;
        else if (this.id.startsWith('MP')){
            url = 'https://dms.360scm.com/dms/cs/cs_view_malfunction.html?malfunction_id=' + this.id;
        }

        return url;
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
            return baseUrl + href.substring(1, href.length);
        }
        return null;
    }
}

async function searchKeyword(url, keyword){
    if (url && keyword) {
        if (url.includes('dms.360scm.com') || url.includes('devops.aliyun.com'))
            await new Scm360Searcher(keyword).open();
        //else await new JavdbSearcher(keyword).open();
        else await new JavbusSearcher(keyword).open();
    }
}
