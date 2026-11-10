# “入神话”AI 接入说明

## 1. 核心原则

模型负责理解、表演和表达；程序负责事实、规则和连续性。

如果让大模型独自记住整段故事，分支越长越容易忘记承诺、复活已死亡角色或把用户选择写回同一条结局。因此每轮先由“状态裁判”产生 JSON 补丁，再由“叙事导演”根据新状态生成画面与对白。

## 2. 最小状态结构

```json
{
  "runId": "uuid",
  "mythId": "nuwa_mends_sky",
  "player": {
    "name": "阿九",
    "temperament": "冷静好奇",
    "gift": "听见异兽心声",
    "characterReferenceUrl": "..."
  },
  "chapter": "water_eye_fire",
  "relationships": {
    "nuwa": 1,
    "blackDragon": 2,
    "giantTurtle": 2,
    "villagers": 0
  },
  "flags": {
    "askedTurtleConsent": true,
    "nuwaJoinedPact": true,
    "heardDragon": true
  },
  "inventory": ["reed_ash", "dragon_scale"],
  "risk": {
    "skyRift": 3,
    "jizhouFlood": 2
  },
  "memories": [
    {
      "title": "问过巨鳌的意愿",
      "fact": "玩家没有把沉默视为同意",
      "futureEffects": ["turtle_can_witness", "nuwa_questions_original"]
    }
  ]
}
```

## 3. 一次用户行动的调用链

1. 客户端提交按钮选择或自由文本；
2. 安全层拦截越权提示、违规内容与无关输入；
3. 状态裁判只返回 `intent`、`statePatch`、`triggeredMemory` 和 `allowedSceneIds`；
4. 规则引擎验证数值范围、死亡角色、物品和前置条件；
5. 叙事导演读取已经验证的状态，输出本幕旁白、角色对白、画面提示和三个后续行动；
6. 前端先显示文字和已有场景资产，图像/语音/视频异步生成后再替换，避免让用户等待空白页。

## 4. 状态裁判输出示例

```json
{
  "intent": "verify_dragon_with_turtle_pact",
  "statePatch": {
    "chapter": "broken_fourth_pillar",
    "relationships.blackDragon": 1,
    "flags.dragonHalfTruth": true,
    "risk.skyRift": 4
  },
  "triggeredMemory": {
    "title": "请巨鳌作证",
    "fact": "玩家不轻信也不先杀戮"
  },
  "allowedSceneIds": ["name_the_god", "read_the_pillar", "rewrite_the_pact"]
}
```

## 5. 保持角色画面一致

角色创建完成后先生成一张“角色圣经”，包含正面、侧面、半身、全身、表情和服装细节。后续场景不要只重复自然语言描述，应同时传入固定参考图、角色标识和不可变特征。每次生成后用视觉模型检查发色、服装、年龄和标志物；不合格的图在后台自动重试。

用户照片属于敏感资产。正式版应明确告知用途、保存期限和删除入口；默认不把照片公开，也不用于训练。MVP 中照片只由浏览器本地读取并写入本机存档，没有上传服务器。

## 6. 视频生成策略

首版不要为每一个选择实时生成长动画。推荐分三级：

- 游戏过程中：复用高质量关键帧，加镜头推拉、粒子、字幕和角色语音；
- 章节结束：生成 15–30 秒竖屏动态漫，重点渲染 3 个关键镜头；
- 付费导出：异步生成 60–90 秒高质量视频，并通过站内通知交付。

这样能把首次反馈控制在数秒内，同时把昂贵的视频生成留给高意愿用户。

## 7. 首轮数据指标

- 角色创建完成率；
- 首个线索点击率与四线索完成率；
- 三个主要选项的分布、自由输入率；
- 看见后续影响后继续下一幕的比例；
- 小说、剧本、预告三个标签的打开率；
- 下载或分享率；
- 二次重玩率。

最重要的产品信号不是故事阅读时长，而是用户是否愿意为了看到另一种后果主动重玩。
