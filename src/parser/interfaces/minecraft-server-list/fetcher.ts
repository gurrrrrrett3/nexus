import MinecraftServer from "../../abstracts/MinecraftServer";
import cheerio from "cheerio";
import { puppet } from "../../core";

export default class Fetcher_MinecraftServerList {

    public static async fetchList(options?: {
        page?: number,
        tags?: string[],
        version?: string,
        country?: string,
    }) {

        const baseUrl = new URL('https://minecraft-server-list.com');

        baseUrl.pathname = `/filter/page/${options?.page ?? 1}`;

        if (options?.tags) {
            options.tags.forEach(tag => {
                baseUrl.searchParams.append(tag, "on");
            })
        }

        if (options?.version) {
            baseUrl.searchParams.append("ver", options.version);
        }

        if (options?.country) {
            baseUrl.searchParams.append("country", options.country);
        }

        const data = await puppet.get(baseUrl.href)

        if (!data) {
            throw new Error("No data");
        }

        return await this.parseList(data);
    }

    public static async parseList(html: string) {
        let servers: MinecraftServer[] = [];

        const $ = cheerio.load(html);

        const serverList = $(".serverdatadiv1").children("table").children("tbody").children("tr");

        serverList.each((i, el) => {
            const ip = $(el).children(".n2").children(".copyip").children(".copylinkinput").val() as string | undefined;

            if (!ip) return;

            const version = $(el).children(".n2").children("span").eq(0).text().replace("Version: ", "");
            const tags = $(el).children(".n2").children("span").map((i, el) => {
                return $(el).text();  
            }).get().slice(1).slice(0, -1);

            const description = $(el).children(".n2").children(".serverListing").text();
            const name = $(el).children(".n2").children(".column-heading").text();

            const server = new MinecraftServer({
                from: "minecraft-server-list.com",
                ip: ip,
                tags: tags,
                name: name,
                version: version,
                description: description,
                website: "https://minecraft-server-list.com/"
            });

            servers.push(server);
        })

        return servers;

    }

}