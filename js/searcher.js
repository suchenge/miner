class BaseSearcher {
    constructor(id) {
        this.id = id.trim();
    }

    active = false;
    async getUrl() {}

    async open(){
        if (this.id){
            let url = await this.getUrl();
            if (url){
                console.log(url);
                sendMessage("openUrl", "", {url: url, active: false}, response => {});
            }
        }
    }

    async returnUrl(){
        return await this.getUrl();
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

class MissavSearcher extends BaseSearcher {
    constructor(id){
        id = id.replace(/(\d+)/, '-$1');
        console.log(id);
        super(id);
    }

    active = false;

    async getUrl(){
        let url = `https://missav123.jp/${this.id}`;
        console.log(url);

        return url;
    }
}

async function fetchHtml(url, cookies) {
    return await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ topic: 'fetchHtml', message: { url, cookies } }, response => {
            const error = chrome.runtime.lastError;
            if (error) return reject(new Error(error.message));
            if (!response || !response.ok) return reject(new Error(response?.error || '请求失败'));

            resolve(response.html);
        });
    });
}

class JavdbSearcher extends BaseSearcher {
    constructor(id) {
        // SSIS123 -> SSIS-123，已经是 SSIS-123 的保持不变
        super(id.trim().toUpperCase().replace(/([A-Z]+)(\d)/, '$1-$2'));
    }

    async getUrl() {
        let baseUrl = "https://javdb.com/";
        let searchUrl = baseUrl + "search?q=" + encodeURIComponent(this.id) + "&f=all";
        console.log(searchUrl);

        try {
            // javdb 需要 over18=1，否则返回年龄验证页
            let response = await fetchHtml(searchUrl, [{ name: 'over18', value: '1' }]);

            console.log(response);

            if (!response) return null;

            let html = $(response);

            let boxes = [];
            html.find("a.box").each((_, element) => {
                let anchor = $(element);
                let href = anchor.attr("href");
                if (href) {
                    boxes.push({
                        href: href,
                        title: (anchor.attr("title") || anchor.text() || "").toUpperCase()
                    });
                }
            });

            if (!boxes.length) {
                console.warn("[javdb] 没有搜索结果，可能被 Cloudflare 拦截或搜索为空：", html.find("title").text());
                return null;
            }

            // 优先选标题里包含当前番号的结果，避免拿错第一个
            let wanted = this.id.replace(/[^A-Z0-9]/gi, "").toUpperCase();
            let hit = boxes.find(box => box.title.replace(/[^A-Z0-9]/gi, "").includes(wanted)) || boxes[0];

            let result = new URL(hit.href, baseUrl).href;
            console.log(result);

            return result;
        } catch (error) {
            console.error("[javdb] 搜索失败：", error);
            return null;
        }
    }
}

async function searchKeyword(url, keyword){
    if (url && keyword) {
        if (url.includes('dms.360scm.com') || url.includes('devops.aliyun.com'))
            await new Scm360Searcher(keyword).open();
        else {
            const { searcher } = await chrome.storage.local.get('searcher');
            console.log(searcher);
            switch(searcher){
                case 'DB':
                    await new JavdbSearcher(keyword).open();
                    break;
                case 'Miss':
                    await new MissavSearcher(keyword).open();
                    break;
                case 'Bus':
                    await new JavbusSearcher(keyword).open();
                    break;
            }
            /*
            if (searcher === 'DB')
                await new JavdbSearcher(keyword).open();
            else
                await new JavbusSearcher(keyword).open();
            */
        }
    }
}

async function getSearchKeywordUrl(url, keyword){
    if (url && keyword) {
        if (url.includes('dms.360scm.com') || url.includes('devops.aliyun.com'))
            return await new Scm360Searcher(keyword).returnUrl();
        else {
            const { searcher } = await chrome.storage.local.get('searcher');
            if (searcher === 'DB')
                return await new JavdbSearcher(keyword).returnUrl();
            else
                return await new JavbusSearcher(keyword).returnUrl();
        }
    }
}
