import MinecraftServer from "../parser/abstracts/MinecraftServer";
import CachedServerData from "./cachedServerData";
import ServerLookupCache from "./serverLookupCache";

export default class ServerLookupManager {
  public cache: ServerLookupCache = new ServerLookupCache();

  constructor() {}

  public async lookup(url: string): Promise<CachedServerData>;
  public async lookup(ip: string, port = 25565): Promise<CachedServerData> {
    if (ip.includes(":")) {
      let strPort: string;
      [ip, strPort] = ip.split(":");
      port = parseInt(strPort);

      if (isNaN(port)) {
        throw new Error(`Invalid port: ${strPort}`);
      }
    }

    return await this.cache.get(ip, port);
  }

  public async addServers(servers: MinecraftServer[]) {
    servers.forEach((server) => {
      this.lookup(server.ip);
    });
  }
}
