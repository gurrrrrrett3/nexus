export default class MinecraftServer {

    public from: string;
    public ip: string;
    public tags: string[];
    public name: string;
    public version: string;
    public description: string;
    public website?: string;

    constructor(data: {
        from: string,
        ip: string,
        tags: string[],
        name: string,
        version: string,
        description: string,
        website?: string,
    }) {
        this.from = data.from;
        this.ip = data.ip;
        this.tags = data.tags;
        this.name = data.name;
        this.version = data.version;
        this.description = data.description;
        this.website = data.website;   
    }
}