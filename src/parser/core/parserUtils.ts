import MinecraftServer from "../abstracts/MinecraftServer";

export default class ParserUtils {
  public static async fetchServers(
    method: (options: { page: number; [key: string]: any }) => Promise<MinecraftServer[]>,
    setThis: any,
    pages: number
  ) {
    const servers: MinecraftServer[] = [];
    for (let i = 1; i <= pages; i++) {
      const newServers = await method.call(setThis, { page: i });
      servers.push(...newServers);
      console.log(`Fetched ${newServers.length} servers from page ${i}`);
    }
    return servers;
  }
}
