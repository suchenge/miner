class Excavator {
    constructor(url) {
        this.url = url;
    }
    sign(currentUrl, nextUrl){
        $("a[href='" + currentUrl + "']").removeAttr("class");
        $("a[href='" + nextUrl + "']").attr("class", "current");
    }
    async get() {
        let response = await request(this.url);
        let html = $(response);
        let title = null;
        let nextLink = null;
        let stills = [];

        title = html.find("h1[class='article-title']").text();
        let imgElement = html.find("img[onload='size(this)']");
        if (imgElement) {
            for (const element of imgElement) {
                let src = $(element).attr("src");
                stills.push(src.trim());
            }
        }

        let pagination = html.find("div[class='pagination1']").first();
        let currentLinkElement = $(pagination).find("a[class='current']");
        
        let nextLinkElement = currentLinkElement.next();
        if (nextLinkElement) {
            nextLink = nextLinkElement.attr("href");
            if (nextLink) {
                this.sign(currentLinkElement.attr("href"), nextLink);

                let page = new Excavator(nextLink);
                let result = await page.get();
                if (result && result.stills && result.stills.length > 0) {
                    for (const still of result.stills) {
                        stills.push(still.trim());
                    }
                }
            }
        }

        return {
            title: title.trim(),
            stills: FileInfo.getFiles(stills, title.trim(), file => (file.index + "").padStart(5, "0")),
            path: title.trim()
        }
    }
}

