import { puppet } from "./parser/core";
import { PrismaClient} from "@prisma/client";

import mcsl from "./parser/interfaces/minecraft-server-list/fetcher";
import buzz from "./parser/interfaces/minecraft-buzz/fetcher";

import ServerDatabaseManager from "./database/serverDatabaseManager";
import ParserUtils from "./parser/core/parserUtils";

(async () => {
  await puppet.init();

  const dupeCount = await ServerDatabaseManager.removeDuplicates();

    console.log(`Removed ${dupeCount} duplicates`);

 const data = await ParserUtils.fetchServers(buzz.fetchList, buzz, 100);

 console.log(data.length);

 await ServerDatabaseManager.saveServers(data);

})();


export const db = new PrismaClient();