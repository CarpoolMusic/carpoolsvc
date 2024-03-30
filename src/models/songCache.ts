class SongCache {
    private cache: Record<string, string> = {};

    public add(key: string, value: string): void {
        this.cache[key] = value;
        this.cache[value] = key;
    }

    public get(key: string): string {
        return this.cache[key] ?? "";
    }
}

export default SongCache;