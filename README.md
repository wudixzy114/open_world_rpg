# open_world_rpg

> **Vue 3 + RxDB + Web Worker 的"开放世界回合制"骨架：以年/月为时间单位推进，所有状态保存在浏览器本地 IndexedDB。**

## 项目定位 / 背景

`open_world_rpg` 是一个**回合制开放世界 RPG**的早期骨架：和 `G` 那个"剧情驱动"项目不同，这里走的是"宏观模拟器"路线——世界里有一堆 `actor`（NPC），每个 actor 有 `age / gender / stats{strength, intelligence, charm} / locationId` 等字段；每过一回合（一个月），world 的 `year/month` 推进 1，到 1 月时所有 actor `age += 1`，并以 10% 概率让 actor 切换 location（目前只在洛阳和长安之间随机）。

整个世界状态活在 **RxDB + Dexie storage** 持久化到 IndexedDB，schema 校验用 ajv（dev 模式强制）。`src/core/simulation/worker.ts` 跑在 Web Worker 里，按 `INIT / NEXT_TURN` 消息触发模拟，回合完成后 `postMessage({ type: 'TURN_COMPLETED', payload: { year, month, updatedCount } })`。主线程通过 Pinia store（`gameStore.ts`）拿 snapshot 渲染。整套架构和 `G` 相似，但 schema 是 actor-driven 而非 narrative-driven，时间粒度是"月"而非"tick"。

## 仓库结构

```
open_world_rpg/
├── index.html
├── package.json                # my-rpg-game v0.0.0
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── vite.config.ts
├── uno.config.ts
├── tsconfig.{json,app,node}.json
├── typedoc.json
├── .vscode/extensions.json
├── public/vite.svg
└── src/
    ├── main.ts                 # createApp + Pinia
    ├── App.vue
    ├── core/
    │   ├── db/
    │   │   ├── index.ts        # createDbInstance / getDatabase
    │   │   └── schemas.ts      # actorSchema + worldSchema
    │   ├── simulation/
    │   │   └── worker.ts       # NEXT_TURN 月推进逻辑
    │   └── types/
    │       ├── actor.ts        # ActorDocType
    │       └── world.ts        # WorldStateDocType
    └── ui/
        └── store/
            └── gameStore.ts
```

## 技术栈

| 类别 | 选型 | 版本 |
| --- | --- | --- |
| 前端框架 | Vue | 3.5.24 |
| 状态 | Pinia | 3.0.4 |
| 数据库 | RxDB | 16.20.0 |
| 校验 | ajv | 8.17.1 |
| 异步原语 | RxJS | 7.8.2 |
| 工具 | uuid | 13.0.0 |
| 样式 | UnoCSS | 66.5.7 |
| 构建 | Vite | 7.2.4 |
| TS | TypeScript | 5.9.3 |
| 文档 | TypeDoc + typedoc-plugin-vue | 0.28.14 / 1.5.1 |
| Node 类型 | @types/node | 24.10.1 |
| 包管理 | pnpm | 含 `pnpm-workspace.yaml` |

## 核心模块 / 特性

- **领域类型**（`src/core/types/`）：
  - `WorldStateDocType` — `{ id, year, month, turnCount }`，单例 `id: 'world_main'`
  - `ActorDocType` — `{ id, name, age, gender, stats: { strength, intelligence, charm }, locationId, createdAt }`，stats 是 0-100 标量
- **RxDB 存储层**（`src/core/db/index.ts`）：
  - `createDbInstance` 用 `getRxStorageDexie()` 当底层（IndexedDB），dev 模式加 `wrappedValidateAjvStorage` 强制 schema 校验
  - dev 模式加 `RxDBDevModePlugin`（动态 import，减小 prod 体积）
  - 集合：`actors: RxCollection<ActorDocType>`、`world: RxCollection<WorldStateDocType>`
  - `multiInstance: true` + `ignoreDuplicate: true` 允许多 tab
  - 首次创建时插入 `world_main`，初始 `year: 184, month: 1, turnCount: 0`（东汉末年？184 = 光和七年 / 中平元年，黄巾起义那年）
  - `getDatabase()` 用 promise cache 保证只 init 一次
- **Schema**（`src/core/db/schemas.ts`）：RxDB JSON Schema，`primaryKey` 是 `id`
- **Simulation Worker**（`src/core/simulation/worker.ts`）：
  - `initDB()` 调 `createDbInstance()`
  - `processNextTurn()`：先 `findOne('world_main').exec()` → `month++`，`month > 12` 时回到 1 + `year++`；`turnCount++`
  - 拉所有 actor，每年 1 月 `age += 1`，每回合 10% 概率 `locationId` 在 `loc_luoyang / loc_changan` 之间切换
  - `actorsToUpdate` 收集脏数据，`bulkUpsert` 一次性写回
  - `worldDoc.patch({ year, month, turnCount })` 更新世界
  - 收尾 `self.postMessage({ type: 'TURN_COMPLETED', payload: { year, month, updatedCount } })`
  - `self.onmessage` 处理 `INIT` 与 `NEXT_TURN`
- **Pinia store**（`src/ui/store/gameStore.ts`）：桥接 main ↔ worker，存 `isReady / isRunning / latestSnapshot` 等 reactive 状态
- **UnoCSS**：原子化 CSS，按需生成

## 已完成 / 进行中

- ✅ 完整工程骨架（Vue 3 + Vite 7 + UnoCSS 66）
- ✅ RxDB + Dexie storage + ajv schema 校验
- ✅ Web Worker 月推进模拟
- ✅ 多 actor + 地理位置切换
- ⏳ 真实的"地图路径"（locationId 切换目前是硬编码二选一）
- ⏳ actor 间关系 / 事件 / 死亡判定
- ⏳ 主线程可视化（演员列表 / 地图）
- ❌ TypeDoc 文档（配置已就位）

## 本地开发

```bash
pnpm install
pnpm dev          # Vite dev server
pnpm build        # vue-tsc -b && vite build
pnpm preview      # 预览构建产物
pnpm docs:api     # TypeDoc
```

## 状态

v0.0.0，**模拟器闭环已通**：每个月推进一次，actor age 涨、location 随机切，状态全本地存。**可视化与事件系统**是下一阶段。

## License

未声明 License。
