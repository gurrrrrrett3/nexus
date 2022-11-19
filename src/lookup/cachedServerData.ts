import fetch from "node-fetch"
import { db, lookup } from ".."

export default class CachedServerData {

    public cachedAt: Date
    public cacheTime: number = 300000 // 5 minutes 
    public ip: string
    public port: number
    
    public online?: boolean
    public motd?: string
    public motd_json?: {
        text: string
        extra: {
            text: string
            color: string
        }[]
    }
    public favicon?: string
    public error: any = null
    public players?: {
        max: number
        online: number
        sample: {
            name: string
            id: string
        }[]
    }
    public server?: {
        name: string
        protocol: number
    }
    public last_updated?: Date
    public duration?: number

    public timer: NodeJS.Timeout

    constructor(ip: string, port = 25565, cacheTime = 300000) {
        this.ip = ip
        this.port = port
        this.cachedAt = new Date()
        this.cacheTime = cacheTime

        this.timer = setTimeout(this.monitor, this.cacheTime)

        console.log(`${this.ip} cached`)
    }

    public async fetch(): Promise<this> {

        const url = new URL(`https://mcapi.us/server/status`)
        url.searchParams.set("ip", this.ip)
        url.searchParams.set("port", this.port.toString())

        console.log(url.href)
        const res = await fetch(url.href)

        if (res.status !== 200) {
            this.error = new Error(`Server returned status code ${res.status}`)
            return this
        }

        const data = await res.json() as {
            online: boolean
            motd: string
            motd_json: {
                text: string
                extra: {
                    text: string
                    color: string
                }[]
            }
            favicon: string
            error: any
            players: {
                max: number
                online: number
                sample: {
                    name: string
                    id: string
                }[]
            }
            server: {
                name: string
                protocol: number
            }
            last_updated: number
            duration: number
        }

        this.online = data.online
        this.motd = data.motd
        this.motd_json = data.motd_json
        this.favicon = data.favicon
        this.error = data.error
        this.players = data.players
        this.server = data.server
        this.last_updated = new Date(data.last_updated)
        this.duration = data.duration

        this.cachedAt = new Date()

        return this
    } 

    public async get(): Promise<this> {
        if (this.cachedAt.getTime() + this.cacheTime < Date.now()) {
            await this.fetch()
        }
        return this
    }

    public async monitor(): Promise<void> {
        await this.fetch()
        const serverId = await this.getMyServerId()

        if (serverId) {
            await db.playercount.create({
                data: {
                    count: this.onlinePlayers,
                    server: {
                        connect: {
                            id: serverId
                        }
                    }
                }
            })

        } else {
            console.log(`Server ${this.ip} not found in database, deleting cache entry`)
            lookup.cache.remove(lookup.cache.getKey(this.ip, this.port))
        }
       

    }

    private async getMyServerId(): Promise<string | null> {
        return await db.server.findFirst({
            where: {
                ip: this.ip,
            }
        }).then(res => res?.id ?? null)
    }

    get onlinePlayers(): number {
        return this.players?.online ?? 0
    }

    get maxPlayers(): number {
        return this.players?.max ?? 0
    }

    get nextUpdate(): Date {
        return new Date(this.cachedAt.getTime() + this.cacheTime)
    }

    get isOnline(): boolean {
        return this.online ?? false
    }

}