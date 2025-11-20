export interface ActorDocType {
    id: string;
    name: string;
    age: number;
    gender: 'male' | 'female';
    // 基础属性 (0-100)
    stats: {
        strength: number; // 武力
        intelligence: number; // 智力
        charm: number; // 魅力
    };
    locationId: string; // 当前所在位置 ID
    createdAt: number;
}