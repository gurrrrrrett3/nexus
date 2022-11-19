import { db } from "..";
import MinecraftServer from "../parser/abstracts/MinecraftServer";

export default class ServerDatabaseManager {
  public static async saveServers(servers: MinecraftServer[]) {
    const oldServers = await db.server.findMany({
      where: {
        ip: {
          in: servers.map((server) => server.ip),
        },
      },
    });

    const newServers = servers.filter((server) => {
      return !oldServers.some((oldServer) => oldServer.ip === server.ip);
    });

    const updatedServers = servers.filter((server) => {
        return oldServers.some((oldServer) => oldServer.ip === server.ip);
        }
    );

    const newServersData = newServers.map((server) => {
        return {
            from: server.from,
            ip: server.ip,
            tags: server.tags,
            name: server.name,
            version: server.version,
            description: server.description,
            estimatedMulti: 1,
        };
        })

    const updatedServersData = updatedServers.map((server) => {
        return {
            from: server.from,
            ip: server.ip,
            tags: server.tags,
            name: server.name,
            version: server.version,
            description: server.description,
        };
        })

    if (newServersData.length > 0) {
      await db.server.createMany({
        data: newServersData,
      });
    }

    
    
  }

  public static async removeDuplicates() {
    const servers = await db.server.findMany();

    const duplicates = servers.filter((server, i) => {
      return servers.some((server2, i2) => {
        return server.ip === server2.ip && server.from === server.from && i !== i2;
      });
    });

    if (duplicates.length > 0) {
      await db.server.deleteMany({
        where: {
          id: {
            in: duplicates.map((server) => server.id),
          },
        },
      });
    }

    return duplicates.length;
  }
}
