export default (map) => Array.from(new Set(Array.from(map.values()).flat(1)));
