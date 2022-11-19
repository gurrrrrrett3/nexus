import CachedServerData from "./cachedServerData";

export default class ServerLookupCache {

    public cache: Record<string, CachedServerData> = {}

    public async get(ip: string, port = 25565): Promise<CachedServerData> {
        const key = this.getKey(ip, port)
       
        if (Object.hasOwnProperty.call(this.cache, key)) {
            return await this.cache[key].get()
        } else {
            const data = new CachedServerData(ip, port)
            this.set(ip, port, await data.fetch())
            return data
        }
    }

    public set(ip: string, port = 25565, data: CachedServerData): void {
        const key = this.getKey(ip, port)
        this.cache[key] = data
    }

    public getKey(ip: string, port = 25565): string {
        return `${ip}:${port}`
    }
 
    public remove(key: string) {
        delete this.cache[key]
    }

}