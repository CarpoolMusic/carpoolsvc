class SongCache {
    private cache: { [key: string]: string } = {};
    
    public add(key: string, value: string) {
        this.cache[key] = value;
        this.cache[value] = key;
    }
    
    public get(key: string): string | undefined {
        return this.cache[key];
    }
}

export default SongCache;