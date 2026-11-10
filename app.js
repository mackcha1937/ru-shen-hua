const STORAGE_KEY = "ru_shen_hua_mvp_v1";

const defaultState = {
  screen: "home",
  profile: { name: "无名", photo: "", temperament: "尚未选择", gift: "尚未觉醒" },
  chatStep: 0,
  messages: [],
  clues: [],
  selectedClue: null,
  firstChoice: "",
  turtleChoice: "",
  dragonChoice: "",
  finalChoice: "",
  memories: [],
  studioTab: "trailer",
  trailerFrame: 0,
  complete: false
};

let state = loadState();
let trailerTimer = null;

const myths = [
  ["盘古开天", "醒来时，天地还没有名字", "开"],
  ["女娲补天", "天裂之后，你会先救谁？", "娲"],
  ["夸父逐日", "陪一个注定追不上的人奔跑", "日"],
  ["精卫填海", "一粒石子能否改变结局", "海"],
  ["后羿射日", "十个太阳里，谁不该落下", "弓"],
  ["嫦娥奔月", "飞升前的最后一个夜晚", "月"],
  ["大禹治水", "堵与疏之外的第三条路", "水"],
  ["牛郎织女", "替他们改写一年一次的相逢", "星"],
  ["哪吒闹海", "若你先听见龙宫的辩词", "莲"],
  ["大闹天宫", "在齐天大圣之前闯入凌霄殿", "云"]
];

const clues = {
  stone: { name: "五色石", text: "它们不是同一种石头。红石温热，青石却在微微呼吸，仿佛补天要付出的不是材料，而是五种活物的愿望。" },
  dragon: { name: "黑龙鳞", text: "鳞片边缘没有血，只有烧焦的水草。原典说女娲杀黑龙济冀州，可它真是灾祸的源头吗？" },
  ash: { name: "芦灰", text: "灰烬遇水不沉，反而结成薄膜。它能止住洪水，但只能维持一炷香。" },
  turtle: { name: "巨鳌足印", text: "足印朝向裂天，而不是逃离。巨鳌也许一直知道自己将被用来撑天。" }
};

const choiceMeta = {
  history: { label: "追问原典", desc: "寻找被神话删掉的那一页", image: "assets/five-stones.jpg" },
  mercy: { label: "先救眼前的人", desc: "用芦灰为凡人争一炷香", image: "assets/reed-ash.jpg" },
  voice: { label: "让异兽把话说完", desc: "与巨鳌立约，听黑龙开口", image: "assets/giant-turtle.jpg" },
  trust: { label: "相信黑龙", desc: "潜入水眼，寻找第四根天柱", image: "assets/water-eye.jpg" },
  rescue: { label: "先救冀州", desc: "把真相延后，把人命放在眼前", image: "assets/save-village.jpg" },
  verify: { label: "请巨鳌作证", desc: "让盟约代替轻信，验证黑龙的话", image: "assets/broken-pillar.jpg" },
  attack: { label: "向黑龙出手", desc: "原典开始吞回你创造的支线", image: "assets/black-dragon.jpg" }
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...defaultState, ...saved, profile: { ...defaultState.profile, ...saved.profile } } : structuredClone(defaultState);
  } catch { return structuredClone(defaultState); }
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { console.warn("存档失败", error); }
}

function setState(patch, shouldRender = true) {
  state = { ...state, ...patch };
  saveState();
  if (shouldRender) render();
}

function navigate(screen) {
  clearInterval(trailerTimer);
  setState({ screen });
  window.scrollTo(0, 0);
}

function addMemory(title, detail) {
  if (state.memories.some(m => m.title === title)) return;
  state.memories.push({ title, detail });
  saveState();
  toast(`神话记住了：${title}`);
}

function shell(content, options = {}) {
  const memoryCount = state.memories.length;
  return `
    <main class="app-shell">
      <header class="topbar">
        <button class="brand" data-action="home" aria-label="回到首页"><span class="brand-seal">入</span>入神话</button>
        <div class="top-actions">
          ${state.profile.name !== "无名" ? `<span class="memory-pill">${escapeHTML(state.profile.name)} · 穿越者</span>` : ""}
          <button class="memory-pill" data-action="memory">神话记忆 ${memoryCount}</button>
          ${options.showReset ? `<button class="icon-btn" data-action="reset" title="重新开始">↺</button>` : ""}
        </div>
      </header>
      <section class="screen">${content}</section>
    </main>`;
}

function render() {
  const routes = { home: homeScreen, avatar: avatarScreen, library: libraryScreen, explore: exploreScreen, firstChoice: firstChoiceScreen, turtle: turtleScreen, dragon: dragonScreen, continuation: continuationScreen, studio: studioScreen };
  document.querySelector("#app").innerHTML = (routes[state.screen] || homeScreen)();
  bindEvents();
}

function homeScreen() {
  const continueText = state.complete ? "再次查看我的神话" : state.profile.name !== "无名" ? "继续上次旅程" : "生成我的神话身份";
  return shell(`
    <div class="hero">
      <img class="hero-bg" src="assets/sky-rift.jpg" alt="天幕破裂，女娲立于洪水与群山之间" />
      <div class="hero-content">
        <div class="eyebrow">AI 互动中国神话 · 首章开放</div>
        <h1>入神话</h1>
        <h2>你不是旁观者，你是被原典漏写的人。</h2>
        <p class="hero-copy">用一张照片创造你的动漫化身。进入女娲补天，在画面里寻找线索、与神兽对话、做出选择。AI 会记住你答应过谁、救过谁，也会让后面的世界为此改变。</p>
        <div class="hero-actions">
          <button class="primary-btn" data-action="start">${continueText}　→</button>
          <button class="secondary-btn" data-action="demo">直接试玩故事</button>
        </div>
      </div>
    </div>`, { showReset: state.profile.name !== "无名" });
}

function avatarScreen() {
  if (!state.messages.length) {
    state.messages = [{ role: "ai", text: "你好，我是引路人「白泽」。不填复杂表格，我们聊几句，我来替你塑造一个能进入神话的动漫身份。先让我看看你——上传一张正脸照片，或者跳过也可以。" }];
    saveState();
  }
  const p = state.profile;
  return shell(`
    <div class="section-wrap">
      <button class="back-btn" data-action="home">← 返回</button>
      <div class="section-head">
        <div class="eyebrow">01 · 与 AI 共创角色</div>
        <h1>聊着聊着，你就成了神话里的人</h1>
        <p>白泽每次只问一个问题。照片、名字、性格和天赋都会进入后续剧情。</p>
      </div>
      <div class="chat-layout">
        <section class="chat-panel">
          <div class="chat-header"><span class="ai-orb">泽</span><div><strong>AI 引路人 · 白泽</strong><small>● 正在理解你的角色</small></div></div>
          <div class="messages" id="messages">
            ${state.messages.map(m => `<div class="message ${m.role === "user" ? "user" : ""}"><span class="message-avatar">${m.role === "user" && p.photo ? `<img src="${p.photo}" alt="" />` : m.role === "user" ? "我" : "泽"}</span><div class="bubble">${escapeHTML(m.text)}</div></div>`).join("")}
          </div>
          <div class="reply-zone">${avatarReplies()}</div>
        </section>
        <aside class="preview-card">
          <div class="preview-kicker">角色卷轴 · 实时生成</div>
          <div class="avatar-frame">${p.photo ? `<img src="${p.photo}" alt="你上传的角色照片" />` : `<span class="avatar-initials">${escapeHTML(p.name.slice(0,2))}</span>`}</div>
          <div>
            <div class="profile-line"><span>名字</span><strong>${escapeHTML(p.name)}</strong></div>
            <div class="profile-line"><span>心性</span><strong>${escapeHTML(p.temperament)}</strong></div>
            <div class="profile-line"><span>天赋</span><strong>${escapeHTML(p.gift)}</strong></div>
            <div class="profile-line"><span>身份</span><strong>原典之外的穿越者</strong></div>
          </div>
        </aside>
      </div>
    </div>`, { showReset: true });
}

function avatarReplies() {
  const step = state.chatStep;
  if (step === 0) return `<label class="upload-label">＋ 上传照片（仅在本机预览）<input type="file" id="photoInput" accept="image/*" /></label><div class="button-row"><button class="text-btn" data-avatar="skip-photo">暂时跳过</button></div>`;
  if (step === 1) return `<div class="composer"><input id="nameInput" maxlength="12" placeholder="别人该怎么称呼你？" autocomplete="off" /><button class="primary-btn small" data-avatar="name">发送</button></div>`;
  if (step === 2) return `<div class="quick-replies"><button class="reply-chip" data-avatar="temperament" data-value="嘴硬心软">嘴硬心软</button><button class="reply-chip" data-avatar="temperament" data-value="冷静好奇">冷静好奇</button><button class="reply-chip" data-avatar="temperament" data-value="莽撞仗义">莽撞仗义</button><button class="reply-chip" data-avatar="temperament" data-value="温柔坚定">温柔坚定</button></div>`;
  if (step === 3) return `<div class="quick-replies"><button class="reply-chip" data-avatar="gift" data-value="听见异兽心声">听见异兽心声</button><button class="reply-chip" data-avatar="gift" data-value="触碰遗物见到过去">触碰遗物见到过去</button><button class="reply-chip" data-avatar="gift" data-value="让谎言显出裂纹">让谎言显出裂纹</button></div>`;
  return `<button class="primary-btn" data-action="library">带着这个身份入神话　→</button>`;
}

function libraryScreen() {
  return shell(`
    <div class="section-wrap">
      <div class="section-head">
        <div class="eyebrow">02 · 选择一则原典</div>
        <h1>${escapeHTML(state.profile.name)}，你想闯进哪一个故事？</h1>
        <p>首版完整开放《女娲补天》。其余九卷已经建立故事母题，将按“每卷一个不可替代的参与机制”陆续开放。</p>
      </div>
      <div class="myth-grid">
        ${myths.map((m,i) => `<button class="myth-card ${i === 1 ? "" : "locked"}" data-action="${i === 1 ? "explore" : "locked"}" data-mark="${m[2]}"><span class="myth-index">卷 ${String(i+1).padStart(2,"0")}</span><h3>${m[0]}</h3><p>${m[1]}</p><span class="card-status">${i === 1 ? (state.clues.length ? `继续 · 已寻 ${state.clues.length}/4` : "现在进入 →") : "即将开放"}</span></button>`).join("")}
      </div>
    </div>`, { showReset: true });
}

function exploreScreen() {
  const found = state.clues;
  const selected = state.selectedClue && clues[state.selectedClue];
  return shell(`
    <div class="cinema">
      <img class="cinema-bg" src="assets/sky-rift.jpg" alt="天裂洪水场景" />
      <div class="hotspots" aria-label="可探索线索">
        ${[["stone","clue-1"],["dragon","clue-2"],["ash","clue-3"],["turtle","clue-4"]].map(([id,pos],i) => `<button class="hotspot ${pos} ${found.includes(id) ? "found" : ""}" data-clue="${id}" aria-label="探索${clues[id].name}">${found.includes(id) ? "✓" : i+1}</button>`).join("")}
      </div>
      ${selected ? `<aside class="clue-drawer"><h3>${selected.name}</h3><p>${selected.text}</p><button class="text-btn" data-action="close-clue">收起</button></aside>` : ""}
      <div class="cinema-content">
        <span class="chapter-tag">女娲补天 · 第一幕</span>
        <h1>天漏了，原典也漏了一页</h1>
        <p class="narration">赤水倒悬，群山像将熄的炭。女娲正在炼石，却没有回头看你：“别急着帮我。先看看，这场灾难里有什么不对。”点击画面中发光的位置，找出四条被原典轻轻带过的线索。</p>
        <div class="clue-row">${Object.entries(clues).map(([id,c]) => `<span class="clue-token ${found.includes(id) ? "found" : ""}">${found.includes(id) ? "✓ " : "? "}${found.includes(id) ? c.name : "未知线索"}</span>`).join("")}</div>
        <div class="button-row"><button class="primary-btn" data-action="firstChoice" ${found.length < 4 ? "disabled" : ""}>${found.length < 4 ? `还差 ${4-found.length} 条线索` : "告诉女娲，我发现了问题 →"}</button></div>
      </div>
    </div>`, { showReset: true });
}

function firstChoiceScreen() {
  return choiceShell("assets/sky-rift.jpg", "第一处改写", "四条线索，同时指向三个方向", `女娲终于转身。她掌心的五色石映出你的脸：“${escapeHTML(state.profile.name)}，原典只给了我一种做法。你要我先相信哪一种？”`, [
    ["history","追问五色石","补天为何需要五种活物的愿望？先找回被删掉的原典。"],
    ["mercy","先铺芦灰救人","洪水正在淹没村庄，真相可以稍后再问。"],
    ["voice","让异兽把话说完","巨鳌留下足印，黑龙没有逃。也许它们都在等人先开口。"]
  ], "first-choice");
}

function turtleScreen() {
  const memory = state.firstChoice === "voice" ? "你选择听见异兽，而非照抄原典" : `你先选择了“${choiceMeta[state.firstChoice]?.label || "未知"}”，最终仍来到了北海`;
  return choiceShell("assets/giant-turtle.jpg", "第二幕 · 巨鳌之约", "它知道自己在原典里的结局", `北海翻起一座活着的山。巨鳌抬眼看你：“你们来取我的足，撑住四极。”女娲没有否认。风声里，你听见自己的天赋回应——${escapeHTML(state.profile.gift)}。`, [
    ["consent","先问它愿不愿意","如果牺牲不可避免，至少不能把沉默当成同意。女娲将与你共同立约。"],
    ["take","按原典取足","天裂等不起。你允许女娲立即动手，但巨鳌会记住是谁没有问它。"]
  ], "turtle-choice", `<div class="memory-strip"><span class="memory-chip">前情记忆 · ${memory}</span></div><div class="dialogue-quote">“若我答应撑天，你们也答应我：先让黑龙把话说完。”</div>`);
}

function dragonScreen() {
  const consent = state.turtleChoice === "consent";
  const relation = consent ? "巨鳌与你并肩而立；女娲也将自己的名字刻入盟约。" : "巨鳌拖着受伤的身体追来，它不再称你为盟友。";
  return choiceShell("assets/black-dragon.jpg", "第三幕 · 黑龙为什么不能死", "原典写下“杀黑龙以济冀州”", `${relation} 黑龙从沸水中抬头，第一句话却不是求饶：“现在补上天，冀州会变成一口盖紧的沸锅。水眼下，第四根天柱早就断了。”`, [
    ["trust","相信它，潜入水眼","让黑龙领路。你可能找到灾祸的根，但也可能被它拖入深渊。"],
    ["rescue","先用芦灰救人","争取一炷香疏散冀州，再回来处理水眼。天空会继续裂开。"],
    ["verify","请巨鳌验证真相","不轻信，也不杀戮。让巨鳌以盟约作证，逼黑龙说出完整真相。"]
  ], "dragon-choice", `<div class="memory-strip"><span class="memory-chip">${consent ? "✓ 问过巨鳌的意愿" : "⚠ 未经同意取足"}</span><span class="memory-chip">${consent ? "✓ 女娲共同立约" : "⚠ 巨鳌不再信任你"}</span><span class="memory-chip">✓ 给黑龙开口的机会</span></div><div class="free-choice"><small>也可以不按选项来</small><div class="composer"><input id="freeChoice" placeholder="例如：我拔剑刺向黑龙 / 我问它是谁折断天柱……" /><button class="secondary-btn small" data-action="free-dragon">行动</button></div></div>`);
}

function continuationScreen() {
  const data = continuationData();
  return choiceShell(data.image, `第四幕 · ${data.title}`, data.kicker, data.narration, data.choices, "final-choice", `<div class="memory-strip">${state.memories.slice(-4).map(m => `<span class="memory-chip">${escapeHTML(m.title)}</span>`).join("")}</div><div class="impact-preview"><div><small>女娲</small><strong>${data.nuwa}</strong></div><div><small>黑龙</small><strong>${data.dragon}</strong></div><div><small>巨鳌</small><strong>${data.turtle}</strong></div></div>`);
}

function continuationData() {
  if (state.dragonChoice === "trust") return {
    image: "assets/water-eye.jpg", title: "水眼下的火", kicker: "相信一个被写成恶兽的声音，也要承担代价",
    narration: `黑龙衔住你潜入地底。水越深越滚烫，断裂的天柱根部竟锁着一个发光的孩子。它睁眼时，整座冀州都震了一下：“不是龙撞断天柱，是天上的人怕我醒来。”${state.turtleChoice === "consent" ? "巨鳌依约替你们托住水眼，只够撑三次呼吸。" : "巨鳌没有跟来，你只剩一次呼吸。"}`,
    nuwa: "担心，但开始怀疑原典", dragon: "信任你，愿替你挡一次火", turtle: state.turtleChoice === "consent" ? "履行盟约" : "缺席",
    choices: [["break-chain","斩断锁链，唤醒火种","真相可能摧毁旧秩序，也可能烧穿冀州。"],["seal-child","先封住火种","救下眼前的人，但让秘密继续沉睡。"],["call-nuwa","让女娲亲眼决定","把决定权交还给被原典写成唯一英雄的人。"]]
  };
  if (state.dragonChoice === "rescue") return {
    image: "assets/save-village.jpg", title: "一炷香之后", kicker: "救人不是暂停剧情，而是一场与时间的交易",
    narration: `芦灰铺上水面，洪流像被一只无形的手托住。孩子、老人、牲畜都在往高处跑，可灰膜已经出现裂纹。黑龙没有离开，它盘在堤外：“${escapeHTML(state.profile.name)}，你救人的次序，决定谁来得及活。”`,
    nuwa: "认可你的慈悲，补天延迟", dragon: "尊重你的次序", turtle: state.turtleChoice === "consent" ? "替你驮走伤者" : "冷眼旁观",
    choices: [["save-children","先送孩子与老人","活下来的村民会记住你的选择，也有人失去家中壮劳力。"],["open-granary","先保粮仓和种子","保住来年，却要承受眼前的哭喊。"],["ask-dragon-help","请黑龙分洪","拿刚建立的信任做一次豪赌。"]]
  };
  if (state.dragonChoice === "verify") return {
    image: "assets/broken-pillar.jpg", title: "谁折断第四根天柱", kicker: "证词互相矛盾时，选择相信谁也是一种行动",
    narration: `巨鳌把盟约按进水中，谎言会在水面结冰。黑龙说“我没有撞断天柱”，水没有结冰；它又说“我知道凶手”，半片水面骤然冻结。女娲盯着那道冰纹：“它没说谎，但只说了一半。”`,
    nuwa: "开始质问旧神", dragon: "被迫交出半个秘密", turtle: state.turtleChoice === "consent" ? "是你的证人" : "只为真相作证，不为你",
    choices: [["name-god","逼黑龙说出神名","把幕后者拖进故事，但你将被天庭注视。"],["read-pillar","触碰断柱看见过去","使用你的天赋亲自取证，代价是失去一段现实记忆。"],["rewrite-pact","把完整真相写进盟约","谁再隐瞒，谁就替巨鳌撑天一千年。"]]
  };
  return {
    image: "assets/black-dragon.jpg", title: "原典正在吞回支线", kicker: "暴力也是选择，世界不会替你忘记",
    narration: `剑刃碰到龙鳞的一刻，所有新生的文字开始倒流。巨鳌沉入海底，黑龙重新变成原典里没有台词的恶兽。女娲握住你的手腕：“你可以杀它。但从此以后，别再说自己没有选择。”`,
    nuwa: "夺回主导权", dragon: "永久敌对", turtle: "对你失望",
    choices: [["lower-weapon","收起武器道歉","承认冲动，支线仍有一线恢复的机会。"],["finish-attack","完成原典的杀戮","获得最安全、也最熟悉的结局。"],["take-blow","替黑龙挡下女娲一击","用受伤证明你改变了决定。"]]
  };
}

function choiceShell(image, tag, title, narration, options, action, extra = "") {
  return shell(`
    <div class="choice-sheet">
      <div class="choice-layout">
        <div class="choice-image"><img src="${image}" alt="${escapeHTML(title)}" /></div>
        <div class="choice-content">
          <div class="eyebrow">${tag}</div><h1>${title}</h1><p>${narration}</p>${extra}
          <div class="choices">${options.map((o,i) => `<button class="choice-card" data-${action}="${o[0]}"><strong><span class="choice-number">${i+1}</span>${o[1]}</strong><span>${o[2]}</span></button>`).join("")}</div>
        </div>
      </div>
    </div>`, { showReset: true });
}

function studioScreen() {
  const output = generateOutput();
  return shell(`
    <div class="studio">
      <div class="studio-hero"><div class="eyebrow">你的第一卷 · 已生成</div><h1>${escapeHTML(state.profile.name)}的《补天异闻》</h1><p>同一份“神话记忆”，AI 已改写为三种可分享的内容形态。</p></div>
      <div class="studio-body">
        <div class="ai-note">这是可运行 MVP：故事编排、选择记忆与个性化成稿已在本机完成；动态漫以可播放分镜预告呈现。接入正式多模态模型后，可将照片动漫化、对白扩写和视频渲染替换为实时 AI 生成。</div>
        <div class="tabs"><button class="tab ${state.studioTab === "trailer" ? "active" : ""}" data-tab="trailer">动态漫预告</button><button class="tab ${state.studioTab === "novel" ? "active" : ""}" data-tab="novel">我的小说</button><button class="tab ${state.studioTab === "script" ? "active" : ""}" data-tab="script">动画剧本</button><button class="tab ${state.studioTab === "record" ? "active" : ""}" data-tab="record">选择档案</button></div>
        <div class="output-grid"><div class="output-main">${renderOutputTab(output)}</div><aside class="side-panel"><div class="side-box"><h4>神话已经记住</h4><p>${state.memories.map(m => `· ${escapeHTML(m.title)}`).join("<br>")}</p></div><div class="side-box"><h4>带走你的故事</h4><button class="primary-btn small" data-action="download-text">下载小说 TXT</button><button class="secondary-btn small" data-action="download-json">下载选择档案</button><button class="secondary-btn small" data-action="copy-output">复制当前内容</button></div><div class="side-box"><h4>继续体验</h4><button class="secondary-btn small" data-action="library">返回神话书架</button><button class="text-btn" data-action="reset">换一种选择重玩</button></div></aside></div>
      </div>
    </div>`, { showReset: true });
}

function renderOutputTab(output) {
  if (state.studioTab === "novel") return `<article class="paper-card" id="exportContent"><h2>${output.title}</h2><div class="byline">一篇由 ${escapeHTML(state.profile.name)} 的选择生成的短篇小说</div>${output.novel.map(s => `<h3>${s.heading}</h3><p>${escapeHTML(s.body)}</p>`).join("")}</article>`;
  if (state.studioTab === "script") return `<div class="paper-card" id="exportContent"><h2>《补天异闻》动画剧本</h2><div class="byline">90 秒概念短片 · ${output.logline}</div><div class="storyboard">${output.shots.map((s,i) => `<article class="shot"><img src="${s.image}" alt="分镜 ${i+1}" /><div class="shot-copy"><strong>镜头 ${String(i+1).padStart(2,"0")} · ${s.time}</strong><p>${escapeHTML(s.text)}</p></div></article>`).join("")}</div></div>`;
  if (state.studioTab === "record") return `<div class="paper-card" id="exportContent"><h2>原典之外的选择档案</h2><p>${state.memories.map((m,i) => `${i+1}. ${m.title}\n${m.detail}`).join("\n\n")}</p><h3>角色参数</h3><p>名字：${escapeHTML(state.profile.name)}\n心性：${escapeHTML(state.profile.temperament)}\n天赋：${escapeHTML(state.profile.gift)}\n结局印记：${output.ending}</p></div>`;
  const frames = output.shots;
  const current = frames[state.trailerFrame % frames.length];
  return `<div id="exportContent"><div class="trailer"><img id="trailerImage" src="${current.image}" alt="动态漫预告画面" /><div class="trailer-overlay"><button class="play-btn" data-action="play-trailer" aria-label="播放预告">▶</button><div class="trailer-caption" id="trailerCaption">${escapeHTML(current.caption)}</div></div></div><div class="button-row"><button class="primary-btn" data-action="play-trailer">播放 20 秒概念预告</button><button class="secondary-btn" data-tab="script">查看完整分镜</button></div></div>`;
}

function generateOutput() {
  const p = state.profile;
  const first = choiceMeta[state.firstChoice]?.label || "听见异兽";
  const dragon = choiceMeta[state.dragonChoice]?.label || "追问真相";
  const data = continuationData();
  const finalLabels = Object.fromEntries(data.choices.map(c => [c[0], c[1]]));
  const final = finalLabels[state.finalChoice] || "把答案留给下一卷";
  const ending = endingName(state.dragonChoice, state.finalChoice);
  const consentLine = state.turtleChoice === "consent" ? "你问巨鳌是否愿意，并与女娲共同在鳌甲上刻下盟约。" : "你让补天先于询问发生，巨鳌的沉默从此跟在身后。";
  return {
    title: `补天异闻：${ending}`,
    logline: `${p.temperament}的穿越者以“${p.gift}”闯入女娲补天，并让一头本该死去的黑龙说完了话。`,
    ending,
    novel: [
      { heading: "一、裂天", body: `天裂开的那天，${p.name}先闻到一股潮湿的焦味。赤水从云端倒灌，女娲站在火边炼五色石，像是早已重复过无数次这个结局。\n\n“别急着帮我。”她说，“看看这故事漏掉了什么。”\n\n${p.name}在石头的呼吸、烧焦的龙鳞、浮在水上的芦灰和巨鳌朝向裂天的足印之间，第一次怀疑：所谓原典，也许只是胜利者写下的最短答案。` },
      { heading: "二、约", body: `${p.name}选择了“${first}”。这一步没有让灾难停止，却让沉默的异兽获得了位置。${consentLine}\n\n巨鳌只提了一个条件：“先让黑龙把话说完。”\n\n于是，当女娲的剑悬在黑龙头顶时，${p.name}没有催促它落下。黑龙吐出的不是求饶，而是一句警告：补上天空，冀州会成为一口盖紧的沸锅。` },
      { heading: `三、${data.title}`, body: `${p.name}决定“${dragon}”。世界立刻改变了态度：女娲${data.nuwa}，黑龙${data.dragon}，巨鳌${data.turtle}。\n\n在${data.title}的最后一刻，${p.name}又做了一个无法撤回的决定——${final}。没有金光宣布对错，只有洪水改道、鳞片开合，以及原典上慢慢长出的一行新字。` },
      { heading: `尾声、${ending}`, body: `许多年后，人间仍在讲女娲补天。只有极少数残卷提到，当日还有一个名叫${p.name}的人，心性${p.temperament}，拥有“${p.gift}”的奇异天赋。\n\n那个人没有取代女娲，也没有把神话改成一个完美结局。${p.name}只是让故事里的每一种生命，在被决定之前，多说完了一句话。` }
    ],
    shots: buildShots(data, ending)
  };
}

function buildShots(data, ending) {
  const images = ["assets/sky-rift.jpg", "assets/five-stones.jpg", "assets/giant-turtle.jpg", "assets/black-dragon.jpg", data.image, "assets/broken-pillar.jpg"];
  const captions = ["天漏了，原典也漏了一页。", `${state.profile.name}发现：灾难里有四件事不对。`, "巨鳌：先问我愿不愿意。", "黑龙：现在补天，冀州会变成沸锅。", `你的选择：${choiceMeta[state.dragonChoice]?.label || "改变原典"}`, `结局印记 · ${ending}`];
  const texts = [
    "大全景。破裂天幕下，洪水倒悬。镜头俯冲向炼石火焰。",
    `特写。${state.profile.name}触碰五色石，石中闪过陌生生灵的眼睛。`,
    `中景。巨鳌浮出北海。${state.turtleChoice === "consent" ? "主角放下武器，先伸出空手。" : "女娲的剑光落下，巨鳌闭眼。"}`,
    "仰拍。黑龙冲出沸水，剑尖停在它眉心一寸。环境声突然归零。",
    `${data.title}。动作与场景依据用户的第三次选择生成，NPC关系状态显示在对白间。`,
    `卷轴上的旧字褪去，新结局“${ending}”浮现。角色回望镜头，切黑。`
  ];
  return images.map((image,i) => ({ image, caption: captions[i], text: texts[i], time: `${i*15}–${(i+1)*15}秒` }));
}

function endingName(dragonChoice, finalChoice) {
  const endings = {
    "break-chain": "唤火者", "seal-child": "守秘人", "call-nuwa": "共写者",
    "save-children": "众生之序", "open-granary": "留种者", "ask-dragon-help": "龙河新盟",
    "name-god": "问天者", "read-pillar": "失忆证人", "rewrite-pact": "第四盟约",
    "lower-weapon": "迟来的倾听", "finish-attack": "原典执行者", "take-blow": "逆鳞之伤"
  };
  return endings[finalChoice] || (dragonChoice === "trust" ? "水眼来客" : "补天异闻");
}

function bindEvents() {
  document.querySelectorAll("[data-action]").forEach(el => el.addEventListener("click", handleAction));
  document.querySelectorAll("[data-avatar]").forEach(el => el.addEventListener("click", handleAvatar));
  document.querySelectorAll("[data-clue]").forEach(el => el.addEventListener("click", handleClue));
  document.querySelectorAll("[data-first-choice]").forEach(el => el.addEventListener("click", e => selectFirst(e.currentTarget.dataset.firstChoice)));
  document.querySelectorAll("[data-turtle-choice]").forEach(el => el.addEventListener("click", e => selectTurtle(e.currentTarget.dataset.turtleChoice)));
  document.querySelectorAll("[data-dragon-choice]").forEach(el => el.addEventListener("click", e => selectDragon(e.currentTarget.dataset.dragonChoice)));
  document.querySelectorAll("[data-final-choice]").forEach(el => el.addEventListener("click", e => selectFinal(e.currentTarget.dataset.finalChoice)));
  document.querySelectorAll("[data-tab]").forEach(el => el.addEventListener("click", e => setState({ studioTab: e.currentTarget.dataset.tab })));
  const input = document.querySelector("#photoInput");
  if (input) input.addEventListener("change", handlePhoto);
  const name = document.querySelector("#nameInput");
  if (name) name.addEventListener("keydown", e => { if (e.key === "Enter") submitName(); });
  const messages = document.querySelector("#messages");
  if (messages) messages.scrollTop = messages.scrollHeight;
}

function handleAction(e) {
  const action = e.currentTarget.dataset.action;
  if (["home","avatar","library","explore","firstChoice","turtle","dragon","continuation","studio"].includes(action)) return navigate(action);
  if (action === "start") return navigate(state.complete ? "studio" : state.profile.name !== "无名" ? "library" : "avatar");
  if (action === "demo") {
    if (state.profile.name === "无名") state.profile = { name: "阿九", photo: "", temperament: "冷静好奇", gift: "听见异兽心声" };
    state.chatStep = 4; saveState(); return navigate("library");
  }
  if (action === "locked") return toast("这一卷正在苏醒，首版先体验《女娲补天》");
  if (action === "close-clue") return setState({ selectedClue: null });
  if (action === "memory") return showMemory();
  if (action === "reset") return resetStory();
  if (action === "free-dragon") return handleFreeDragon();
  if (action === "play-trailer") return playTrailer();
  if (action === "download-text") return downloadText();
  if (action === "download-json") return downloadRecord();
  if (action === "copy-output") return copyOutput();
}

function handleAvatar(e) {
  const action = e.currentTarget.dataset.avatar;
  if (action === "skip-photo") return advanceChat("先不上传，给我留一点神秘感。", "当然。真正塑造你的不是脸，而是你在故事里会怎么选。先告诉我，别人该怎么称呼你？", { chatStep: 1 });
  if (action === "name") return submitName();
  if (action === "temperament") {
    const value = e.currentTarget.dataset.value;
    return advanceChat(value, `我记住了：${value}。最后一个问题——如果神话允许你带走一种不用于战斗的能力，你想要哪一种？`, { chatStep: 3, profile: { ...state.profile, temperament: value } });
  }
  if (action === "gift") {
    const value = e.currentTarget.dataset.value;
    return advanceChat(value, `角色完成。你是${state.profile.temperament}的「${state.profile.name}」，天赋是“${value}”。从现在开始，你的性格会影响旁人如何回应，你的天赋会打开原典里不存在的线索。`, { chatStep: 4, profile: { ...state.profile, gift: value } });
  }
}

function handlePhoto(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) return toast("照片请控制在 5MB 以内");
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const maxSide = 900;
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const context = canvas.getContext("2d");
      context.fillStyle = "#d8c9ad";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      const photo = canvas.toDataURL("image/jpeg", .82);
      advanceChat("我把照片交给你了。", "看见了。首版会先保留你的轮廓作为角色卡；接入图像模型后，这一步会直接生成水墨国漫形象。现在告诉我，你希望神话里的人怎么称呼你？", { chatStep: 1, profile: { ...state.profile, photo } });
    };
    img.onerror = () => toast("这张照片无法读取，请换一张试试");
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function submitName() {
  const input = document.querySelector("#nameInput");
  const value = input?.value.trim();
  if (!value) return toast("先给穿越者取一个名字吧");
  advanceChat(value, `${value}，这个名字已经写进卷轴。遇到无法两全的选择时，你更像下面哪一种人？`, { chatStep: 2, profile: { ...state.profile, name: value } });
}

function advanceChat(userText, aiText, patch) {
  const messages = [...state.messages, { role: "user", text: userText }, { role: "ai", text: aiText }];
  setState({ ...patch, messages });
}

function handleClue(e) {
  const id = e.currentTarget.dataset.clue;
  const found = state.clues.includes(id) ? state.clues : [...state.clues, id];
  setState({ clues: found, selectedClue: id });
  if (found.length === 4) setTimeout(() => toast("四条线索已集齐：新的选择出现了"), 180);
}

function selectFirst(id) {
  state.firstChoice = id;
  addMemory(choiceMeta[id].label, choiceMeta[id].desc);
  navigate("turtle");
}

function selectTurtle(id) {
  state.turtleChoice = id;
  if (id === "consent") addMemory("问过巨鳌的意愿", "你没有把沉默当成同意；女娲与你共同许下先听黑龙说完的盟约。");
  else addMemory("未经同意取足", "你选择让补天先发生。巨鳌活了下来，却不再称你为盟友。");
  navigate("dragon");
}

function selectDragon(id) {
  state.dragonChoice = id;
  addMemory(choiceMeta[id].label, choiceMeta[id].desc);
  navigate("continuation");
}

function handleFreeDragon() {
  const text = document.querySelector("#freeChoice")?.value.trim();
  if (!text) return toast("说出你打算怎么做");
  const attackWords = /杀|刺|砍|斩|打|射|攻击|拔剑/;
  const verifyWords = /问|证|真假|谁|原因|真相/;
  const rescueWords = /救|村|人|芦|灰|疏散/;
  const id = attackWords.test(text) ? "attack" : rescueWords.test(text) ? "rescue" : verifyWords.test(text) ? "verify" : "trust";
  state.dragonChoice = id;
  addMemory(`自由行动：${text}`, id === "attack" ? "你率先使用暴力，原典开始吞回新生的支线。" : `AI 将这次自由输入理解为“${choiceMeta[id].label}”，后续场景据此改变。`);
  navigate("continuation");
}

function selectFinal(id) {
  state.finalChoice = id;
  const data = continuationData();
  const label = data.choices.find(c => c[0] === id)?.[1] || id;
  addMemory(label, `你在《${data.title}》中选择了“${label}”，它成为本卷的结局印记。`);
  state.complete = true;
  state.studioTab = "trailer";
  saveState();
  navigate("studio");
}

function showMemory() {
  const modal = document.createElement("div");
  modal.className = "memory-modal";
  modal.innerHTML = `<div class="memory-book"><div style="display:flex;justify-content:space-between;gap:15px"><div><div class="eyebrow">持续影响剧情</div><h2>神话记忆</h2></div><button class="icon-btn" aria-label="关闭">×</button></div>${state.memories.length ? state.memories.map(m => `<div class="memory-entry"><small>已写入世界</small><strong>　${escapeHTML(m.title)}</strong><p>${escapeHTML(m.detail)}</p></div>`).join("") : `<div class="empty">你还没有留下选择。<br>进入故事后，这里会记录世界对你的记忆。</div>`}</div>`;
  modal.addEventListener("click", e => { if (e.target === modal || e.target.closest(".icon-btn")) modal.remove(); });
  document.body.appendChild(modal);
}

function resetStory() {
  const keepProfile = state.profile;
  state = { ...structuredClone(defaultState), profile: keepProfile, chatStep: keepProfile.name === "无名" ? 0 : 4, screen: keepProfile.name === "无名" ? "home" : "library" };
  saveState(); render(); window.scrollTo(0,0); toast("故事选择已清空，角色身份已保留");
}

function playTrailer() {
  clearInterval(trailerTimer);
  const output = generateOutput();
  let i = 0;
  const button = document.querySelector(".play-btn");
  if (button) button.textContent = "Ⅱ";
  const show = () => {
    const frame = output.shots[i % output.shots.length];
    const img = document.querySelector("#trailerImage");
    const caption = document.querySelector("#trailerCaption");
    if (!img || !caption) return clearInterval(trailerTimer);
    img.style.opacity = "0";
    setTimeout(() => { img.src = frame.image; img.onload = () => img.style.opacity = "1"; caption.textContent = frame.caption; }, 220);
    i++;
    if (i > output.shots.length) { clearInterval(trailerTimer); if (button) button.textContent = "↻"; }
  };
  show(); trailerTimer = setInterval(show, 2700);
}

function downloadText() {
  const out = generateOutput();
  const text = `${out.title}\n\n${out.novel.map(s => `${s.heading}\n${s.body}`).join("\n\n")}`;
  downloadBlob(`${safeFileName(state.profile.name)}-补天异闻.txt`, text, "text/plain;charset=utf-8");
}

function downloadRecord() {
  const record = { product: "入神话", myth: "女娲补天", character: state.profile, route: { first: state.firstChoice, turtle: state.turtleChoice, dragon: state.dragonChoice, final: state.finalChoice }, ending: generateOutput().ending, memories: state.memories };
  downloadBlob(`${safeFileName(state.profile.name)}-神话选择档案.json`, JSON.stringify(record, null, 2), "application/json;charset=utf-8");
}

function downloadBlob(filename, content, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 800);
}

async function copyOutput() {
  const text = document.querySelector("#exportContent")?.innerText || "";
  try { await navigator.clipboard.writeText(text); toast("已复制当前内容"); }
  catch { toast("浏览器未开放剪贴板权限，可直接选中文本复制"); }
}

function toast(message) {
  const el = document.querySelector("#toast");
  if (!el) return;
  el.textContent = message; el.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2200);
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
}
function safeFileName(value) { return String(value || "我的").replace(/[\\/:*?"<>|]/g, "-"); }

render();
