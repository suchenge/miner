class BaseExcavator{
    constructor(url) {
        this.url = url;
    }

    async get(){
        let response = await request(this.url);
        let html = $(response);

        let title = this.getTitle(html);
        let stills = [];
        let currentPageStills = this.getStills(html);
        let otherPageUrls = this.getOtherPageUrls(html);

        console.log("first page still count" + currentPageStills.length);

        if (currentPageStills && currentPageStills.length > 0){
            currentPageStills.forEach(still => {
                if (!stills.includes(still)) stills.push(still);
            });
        }

        console.log(otherPageUrls);

        if (otherPageUrls && otherPageUrls.length > 0){
            for(const url of otherPageUrls){
                console.log("get other page" + url);

                let urlResponse = await request(url);
                let urlHtml = $(urlResponse);
                let urlStills = this.getStills(urlHtml);

                console.log(url + "still count" + urlStills.length);

                if (urlStills && urlStills.length > 0){
                    urlStills.forEach(still => {
                        if (!stills.includes(still)) stills.push(still);
                    });
                }
            }
        }

        console.log("add other page still count" + stills.length);

        return {
            title: title.trim(),
            stills: FileInfo.getFiles(stills, title, file => (file.index + "").padStart(5, "0")),
            path: title.trim()
        } 
    }

    getTitle(html){
        return html.filter("title").text();
    }

    getStills(html){
        let result = []
        let srcList = html.find("img");
        if (srcList && srcList.length > 0){
            for(const src of srcList) {
                if(src) result.push($(src).attr("src"));
            }
        }
        
        return result;
    }

    getOtherPageUrls(html){
        return [];
    }
}

class Sis001Excavator extends BaseExcavator{

    constructor(url){
        super(url)
    }

    getTitle(html){
        return html.find("h2").eq(1).text();
    }

    getStills(html){
        let stills = [];

        let imgElements = html.find("img");
        if (imgElements) {
            for (const element of imgElements) {
                var imgElement = $(element);
                var imgOnload = imgElement.attr("onload");
                if (imgOnload && imgOnload.includes("attachimg")){
                    stills.push(imgElement.attr("src").trim());
                }
            }
        }

        return stills;
    }
}

class SehuatangExcavator extends BaseExcavator{

    constructor(url){
        super(url)
    }

    getOtherPageUrls(html){
        return []
    }

    getTitle(html){
        return replaceBadFileName(html.find("span[id='thread_subject']").text());
    }

    getStills(html){
        let stills = [];

        let imgElement = html.find("img");
        if (imgElement) {
            for (const element of imgElement) {
                let src = $(element).attr("zoomfile");
                if (!src) src = $(element).attr('file');

                if (src) stills.push(src.trim());
            }
        }

        return stills;
    }
}

class Gmd9999Excavator extends BaseExcavator{

    constructor(url){
        super(url)
    }

    getOtherPageUrls(html){
        let urls = [];
        let pageLinks = html.find("a[class='page-link']");

        if (pageLinks){
            for (const pageLink of pageLinks){
                let pageUrl = $(pageLink).attr("href");
                pageUrl = getAbsoluteUrlByHref(pageUrl);

                if (pageUrl.includes("?page=1")) continue;
                if (urls.includes(pageUrl)) continue;

                console.log(pageUrl);
                urls.push(pageUrl);
            }
        }

        return urls;
    }

    getTitle(html){
        return html.find("h3[class='page-title']").text().replace("收藏","").trim();
    }

    getStills(html){
        let stills = [];

        let imgElement = html.find("a[class='col-6 col-md-4 col-xxl-3 float-start image-item']");
        if (imgElement) {
            for (const element of imgElement) {
                let src = $(element).attr("href");
                if (src) {
                    stills.push(src.trim());
                }
            }
        }

        return stills;
    }
}

class JpmnbExcavator extends BaseExcavator {

    constructor(url) {
        super(url);
    }

    sign(currentUrl, nextUrl){
        $("a[href='" + currentUrl + "']").removeAttr("class");
        $("a[href='" + nextUrl + "']").attr("class", "current");
    }

    getTitle(html){
        return html.find("h1[class='article-title']").text();
    }

    getStills(html){
        let stills = [];

        let imgElement = html.find("img[onload='size(this)']");
        if (imgElement) {
            for (const element of imgElement) {
                let src = $(element).attr("src");
                stills.push(src.trim());
            }
        }

        return stills;
    }
    
    getOtherPageUrls(html){
        let urls = [];

        let pagination = html.find("div[class='pagination1']").first();
        let pageLinks = $(pagination).find("a[class!='current']");

        if (pageLinks && pageLinks.length > 0){
            for(const link of pageLinks){
                let href = $(link).attr("href");
                if (!urls.includes(href)){
                    urls.push(href);
                }
            }
        }

        return urls;
    }
}

class XiannvkuExcavator extends BaseExcavator{

    constructor(url){
        super(url)
    }

    getTitle(html){
        return html.find("h1").text();
    }

    getStills(html){
        let stills = [];

        let imgElement = html.find("img[class='content_img']");
        if (imgElement) {
            for (const element of imgElement) {
                let src = $(element).attr("src");
                stills.push(src.trim());
            }
        }

        return stills;
    }

    getOtherPageUrls(html){
        let urls = [];
        let urlTemplate = this.url.replace("-1.html", "");

        let pageLinks = html.find("div[id='pages']").find("a");
        let maxPageLink = pageLinks.eq(pageLinks.length - 2);
        let maxPageCount = maxPageLink.text();
        for(let i = 2; i <= maxPageCount; i ++){
            urls.push(urlTemplate + "-" + i + ".html");
        }

        return urls;
    }
}

class XiurenbaExcavator extends BaseExcavator{

    constructor(url){
        super(url)
    }

    getTitle(html){
        return html.filter("meta[name='description']").attr("content");
    }

    getStills(html){
        let stills = [];
        let title = this.getTitle(html);

        let imgElement = html.find("img");
        if (imgElement) {
            for (const element of imgElement) {
                let alt = $(element).attr("alt")
                if (alt && alt.includes(title)){
                    let src = $(element).attr("src");
                    stills.push(src.trim());
                }
                
            }
        }

        return stills;
    }

    getOtherPageUrls(html){
        let urls = [];
        let pagination = html.find("div[class='page']").first();
        let pageLinks = $(pagination).find("a[class!='current']");

        if (pageLinks && pageLinks.length > 0){
            for(const link of pageLinks){
                let href = $(link).attr("href");
                if (href && !urls.includes(href)){
                    urls.push(href);
                }
            }
        }

        return urls;
    }
}

class Xrmn01Excavator extends BaseExcavator{

    constructor(url){
        super(url)
    }

    getTitle(html){
        return html.find("h1").text();
    }

    getStills(html){
        let stills = [];
        let title = this.getTitle(html);

        let imgElement = html.find("img");
        if (imgElement) {
            for (const element of imgElement) {
                let alt = $(element).attr("alt")
                if (alt && alt.includes(title)){
                    let src = $(element).attr("src");
                    stills.push(src.trim());
                }
                
            }
        }

        return stills;
    }

    getOtherPageUrls(html){
        let urls = [];
        let pagination = html.find("div[class='page']").first();
        let pageLinks = $(pagination).find("a[class!='current']");

        if (pageLinks && pageLinks.length > 0){
            for(const link of pageLinks){
                let href = $(link).attr("href");
                if (href && !urls.includes(href)){
                    urls.push(href);
                }
            }
        }

        return urls;
    }
}