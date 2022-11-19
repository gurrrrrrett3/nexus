import puppeteer from 'puppeteer'

export default class Puppet {

    private browser?: puppeteer.Browser;
    private page?: puppeteer.Page;

    public async init() {
        console.log("Initializing puppeteer");
        this.browser = await puppeteer.launch({ headless: true });
        this.page = await this.browser.newPage();
        console.log("Puppeteer initialized");
    }

    public async close() {
        await this.browser?.close();
    }

    public async get(url: string) {
        await this.page?.goto(url);
        return await this.page?.content();
    }
    
}