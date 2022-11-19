import MinecraftServer from "../../abstracts/MinecraftServer";
import cheerio from "cheerio";
import { puppet } from "../../core";

export enum ServerType {
    JAVA = 0,
    BEDROCK = 1,
}

export default class Fetcher_MinecraftServerList {

    public static readonly TAGS = [
        "Anarchy",
        "Creative",
        "Economy",
        "Factions",
        "FTB",
        "HCF",
        "Hunger Games",
        "KitPvP",
        "Lifesteal",
        "Minigames",
        "Parkour",
        "Pixelmon",
        "Prison",
        "PvP",
        "RPG",
        "Skyblock",
        "Skywars",
        "Survival",
        "Towny",
        "Vanilla"
    ]
    
    public static readonly buzzVersionRegex = new RegExp(/ ?Version (?<va>1\.\d+) (to)? ?(?<vb>1\.\d+)?(?<platform>.+)/g);

    public static async fetchList(options?: {
        page?: number,
        tags?: string[], // buzz can only filter by one tag, so it will only use the first tag
        version?: string,
        country?: string,
        buzz_order_by?: "online_players" | "votes" | "server_id",
        buzz_server_type?: ServerType,
    }) {

        const baseUrl = new URL('https://minecraft.buzz');

        baseUrl.pathname = `/java/${options?.page ?? 1}`;

        if (options?.tags) {
            baseUrl.pathname = `/${options.tags[0]}/${options?.page ?? 1}`;
        }

        if (options?.version) {
            baseUrl.pathname = `/version/${options.version}/${options?.page ?? 1}`;
        }

        if (options?.country) {
            baseUrl.searchParams.append("filter_country", options.country);
        }

        if (options?.buzz_order_by) {
            baseUrl.searchParams.append("order_by", options.buzz_order_by);
        }

        if (options?.buzz_server_type) {
            baseUrl.searchParams.append("type", options.buzz_server_type.toString());
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


        const serverList = $(".table-borderless").children("tbody").children("tr");

        serverList.each((i, el) => {

            const ip = $(el).children("td").eq(2).children("div").children("div").children("data").text()

            if (!ip) return;
            const vText = $(el).children("td").eq(3).children("div").children("span").text().trim()
            const vMatches = this.buzzVersionRegex.exec(vText)
            const version = vMatches?.groups?.vb ?? vMatches?.groups?.va ?? "Unknown";
            const platform = vMatches?.groups?.platform ?? "Unknown";
            const tag = $(el).children("td").eq(3).children("div").children("a").text().replace(" Server", "").trim()
            const name = $(el).children("td").eq(1).children("span").children("h3").text()
            const description = $(el).children("td").eq(6).children("p").text()
            
            const server = new MinecraftServer({
                ip,
                name,
                description,
                version: version.trim(),
                tags: [tag],
                from: "minecraft.buzz",
            })

            servers.push(server);
        })


        return servers;

    }

}