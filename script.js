const mcColors = [
    { n: "Siyah", c: "&0", hex: "#000000" }, { n: "Koyu Mavi", c: "&1", hex: "#0000AA" },
    { n: "Koyu Yeşil", c: "&2", hex: "#00AA00" }, { n: "Koyu Turkuaz", c: "&3", hex: "#00AAAA" },
    { n: "Koyu Kırmızı", c: "&4", hex: "#AA0000" }, { n: "Mor", c: "&5", hex: "#AA00AA" },
    { n: "Turuncu", c: "&6", hex: "#FFAA00" }, { n: "Gri", c: "&7", hex: "#AAAAAA" },
    { n: "Koyu Gri", c: "&8", hex: "#555555" }, { n: "Mavi", c: "&9", hex: "#5555FF" },
    { n: "Yeşil", c: "&a", hex: "#55FF55" }, { n: "Turkuaz", c: "&b", hex: "#55FFFF" },
    { n: "Kırmızı", c: "&c", hex: "#FF5555" }, { n: "Açık Mor", c: "&d", hex: "#FF55FF" },
    { n: "Sarı", c: "&e", hex: "#FFFF55" }, { n: "Beyaz", c: "&f", hex: "#FFFFFF" }
];

const mcFormats = [
    { n: "Kalın", c: "&l", s: "font-weight:bold" },
    { n: "Üstü Çizili", c: "&m", s: "text-decoration:line-through" },
    { n: "Altı Çizili", c: "&n", s: "text-decoration:underline" },
    { n: "İtalik", c: "&o", s: "font-style:italic" },
    { n: "Sihirli (K)", c: "&k", s: "", magic: true },
    { n: "Sıfırla", c: "&r", s: "" }
];

const input = document.getElementById('input-layer');
const highlight = document.getElementById('highlight-layer');
const wikiContent = document.getElementById('wiki-content');
const fontPopup = document.getElementById('fontPopup');
const fontInput = document.getElementById('fontInput');
const headerLogo = document.getElementById('header-logo');

const translations = {
    tr: {
        logo_title: "Skript Editor",
        btn_copy: "KOPYALA",
        btn_save: "KAYDET",
        btn_font: "FONT",
        tab_editor: "EDİTÖR",
        tab_wiki: "VİKİ",
        tab_color: "RENKLER",
        placeholder: "# Kodlarını Yaz...",
        wiki_war: "🛡️ SAVAŞ",
        wiki_inv: "🎒 ENVANTER",
        wiki_sys: "⚙️ SİSTEM",
        wiki_msg: "💬 MESAJ",
        msg_copied: "Kopyalandı!",
        msg_saved: "Kaydedildi!",
        font_popup_title: "Font Ayarları",
        btn_select_font: "FONT YÜKLE",
        btn_reset_font: "SIFIRLA",
        btn_close: "KAPAT"
    },
    en: {
        logo_title: "Skript Editor",
        btn_copy: "COPY",
        btn_save: "SAVE",
        btn_font: "FONT",
        tab_editor: "EDITOR",
        tab_wiki: "WIKI",
        tab_color: "COLORS",
        placeholder: "# Write Your Code...",
        wiki_war: "🛡️ COMBAT",
        wiki_inv: "🎒 INVENTORY",
        wiki_sys: "⚙️ SYSTEM",
        wiki_msg: "💬 MESSAGE",
        msg_copied: "Copied!",
        msg_saved: "Saved!",
        font_popup_title: "Font Settings",
        btn_select_font: "LOAD FONT",
        btn_reset_font: "RESET",
        btn_close: "CLOSE"
    }
};

let currentLangData = translations.tr;
let rotation = 0;

function spinLogo() {
    if (headerLogo) {
        rotation += 360;
        headerLogo.style.transform = `rotate(${rotation}deg)`;
    }
}

function showToast(msg) {
    const existing = document.querySelector('.toast');
    if(existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style = `position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:var(--accent); color:#000; padding:10px 25px; border-radius:50px; font-weight:bold; z-index:10000; box-shadow:0 5px 15px rgba(0,0,0,0.3); animation:slideUp 0.3s ease;`;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function applyLanguage() {
    let lang = navigator.language.split('-')[0];
    currentLangData = translations[lang] || translations.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (currentLangData[key]) el.innerText = currentLangData[key];
    });
    input.placeholder = currentLangData.placeholder;
    updateWikiData(currentLangData);
    buildColorPalette();
}

function updateWikiData(t) {
    window.wikiRehber = {
        [t.wiki_war]: [{ t:"on damage", d: t.wiki_war, c:"on damage:\n    " }],
        [t.wiki_inv]: [{ t:"open chest", d: t.wiki_inv, c:"open chest inventory..." }],
        [t.wiki_sys]: [{ t:"set", d: t.wiki_sys, c:"set {v} to 1" }],
        [t.wiki_msg]: [{ t:"send", d: t.wiki_msg, c:"send \"Hello\" to player" }]
    };
    buildWiki();
}

function buildWiki() {
    let h = ''; 
    for (const [c, it] of Object.entries(window.wikiRehber)) {
        h += `<div class="wiki-category"><div class="category-title">${c}</div>`;
        it.forEach(i => { h += `<div class="wiki-item"><h3>${i.t}</h3><p>${i.d}</p><button class="w-btn" onclick="copyCode(\`${i.c}\`)">AKTAR</button></div>`; });
        h += `</div>`;
    } 
    wikiContent.innerHTML = h;
}

function buildColorPalette() {
    const grid = document.getElementById('color-grid-content');
    if(!grid) return;
    let html = '';
    mcColors.forEach(color => {
        html += `<div class="color-card" style="background:${color.hex}" onclick="copyToClipboardText('${color.c}')"><span>${color.n} (${color.c})</span></div>`;
    });
    mcFormats.forEach(f => {
        const mClass = f.magic ? 'class="magic-text"' : '';
        html += `<div class="color-card format-card" style="${f.s}" onclick="copyToClipboardText('${f.c}')"><span ${mClass}>${f.n} (${f.c})</span></div>`;
    });
    grid.innerHTML = html;
}

function up() {
    let v = input.value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    v = v.replace(/(#.*)/g, '<span class="h-yorum">$1</span>');
    v = v.replace(/"(.*?)"/g, m => `<span class="h-string">${m.replace(/&amp;k/g, '&k<span class="magic-text"></span>')}</span>`);
    const rules = [
    { r: /(on\s+.*?)(?=:)/gi, c: "h-acikkirmizi" }, 
    { r: /(@\w+)/g, c: "h-sari" },
    { r: /\b(\d+)\b/g, c: "h-acikmavi" }, 
    
    { r: /\b(if|else|or|and|stop|return|wait|exit|cancel\s+event|continue|is|is\s+not|has|contains|exists|is\s+set|is\s+not\s+set)\b/gi, c: "h-mor" },
    
    { r: /\b(command|usage|description|permission|permission\s+message|trigger|executable\s+by|aliases|cooldown|cooldown\s+message|cooldown\s+bypass)\b/gi, c: "h-turuncu" },
    
    { r: /\b(loop|while|for|foreach|all\s+players|all\s+entities|all\s+worlds|loop-player|loop-value|loop-index|loop-entity)\b/gi, c: "h-pembe" },
    
    { r: /\b(function|local\s+function|options|variables)\b/gi, c: "h-yesil" },
    
    { r: /\b(player|uuid|victim|attacker|sender|console|message|ip|world|location|event-world|event-location|target\s+player|arg-\d+|arg|argument|metadata|data)\b/gi, c: "h-mavi" },
    
    { r: /\b(send|broadcast|message|give|set|add|remove|delete|clear|make|execute|teleport|kick|ban|unban|kill|spawn|open|close|enchant|disenchant|apply|play|create|drop|push|strike|lightning|damage|heal|repair|force|load|unload|stop\s+server)\b/gi, c: "h-acikkirmizi" },
    
    { r: /\b(true|false|yes|no|none|seconds|minutes|hours|days|ticks|real\s+time|now)\b/gi, c: "h-sari" }
];

    v = v.replace(/({.*?})/g, '<span class="h-mavi">$1</span>');
    rules.forEach(rule => { v = v.replace(new RegExp(rule.r.source + "(?![^<]*>)", "gi"), `<span class="${rule.c}">$1</span>`); });
    if (v.endsWith('\n') || v === '') v += ' ';
    highlight.innerHTML = v;
    localStorage.setItem('index.sk', input.value);
}

function copyCode(c) {
    spinLogo();
    const s = input.selectionStart;
    input.value = input.value.substring(0, s) + c + input.value.substring(input.selectionEnd);
    up(); 
    showTab('editor');
}

function showTab(t) {
    spinLogo();
    document.querySelectorAll('.tab, #editor-page, #wiki-page, #color-page').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('#editor-page, #wiki-page, #color-page').forEach(x => x.style.display = 'none');
    document.getElementById('btn-'+t).classList.add('active');
    const p = document.getElementById(t+'-page'); 
    p.style.display = (t==='editor'?'flex':'block'); 
    p.classList.add('active');
}

function copyToClipboard() { 
    spinLogo();
    navigator.clipboard.writeText(input.value).then(() => showToast(currentLangData.msg_copied)); 
}

function copyToClipboardText(text) {
    spinLogo();
    navigator.clipboard.writeText(text).then(() => showToast(text + " kopyalandı!"));
}

function manualSave() { 
    spinLogo();
    localStorage.setItem('index.sk', input.value); 
    showToast(currentLangData.msg_saved);
}

input.addEventListener('keydown', function(e) {
    spinLogo();
    document.body.classList.add('neon-fast');
    setTimeout(() => document.body.classList.remove('neon-fast'), 300);
    const s = this.selectionStart;
    if (e.key === 'Enter') {
        e.preventDefault();
        const lastLine = this.value.substring(0, s).split('\n').pop();
        let ind = (lastLine.match(/^ */) || [""])[0];
        if (lastLine.trim().endsWith(':')) ind += "    "; 
        this.value = this.value.substring(0, s) + "\n" + ind + this.value.substring(this.selectionEnd);
        this.selectionStart = this.selectionEnd = s + 1 + ind.length;
        up();
    }
    if (e.key === 'Tab') {
        e.preventDefault();
        this.value = this.value.substring(0, s) + "    " + this.value.substring(this.selectionEnd);
        this.selectionStart = this.selectionEnd = s + 4;
        up();
    }
});

input.addEventListener('input', function(e) {
    if (e.inputType === "insertText") {
        const p = { '{': '}', '[': ']', '(': ')', '"': '"', "'": "'", '%': '%' };
        if (p[e.data]) {
            const s = this.selectionStart;
            this.value = this.value.substring(0, s) + p[e.data] + this.value.substring(this.selectionEnd);
            this.selectionStart = this.selectionEnd = s;
        }
    }
    up();
});

function openPopup() { spinLogo(); fontPopup.style.display = 'flex'; }
function closePopup() { fontPopup.style.display = 'none'; }

function loadFont(inputElement) {
    const file = inputElement.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fontFace = new FontFace('CustomUserFont', `url(${e.target.result})`);
            fontFace.load().then((loadedFace) => {
                document.fonts.add(loadedFace);
                document.documentElement.style.setProperty('--main-font', 'CustomUserFont');
                document.documentElement.style.setProperty('--editor-font', 'CustomUserFont');
                showToast("Font yüklendi!");
                closePopup();
            });
        };
        reader.readAsDataURL(file);
    }
}

function resetFont() {
    document.documentElement.style.setProperty('--main-font', "'Inter', sans-serif");
    document.documentElement.style.setProperty('--editor-font', "'Fira Code', monospace");
    showToast("Sıfırlandı!");
    closePopup();
}

input.addEventListener('scroll', () => {
    highlight.scrollTop = input.scrollTop;
    highlight.scrollLeft = input.scrollLeft;
});


window.onload = () => {
    applyLanguage(); 
    if(localStorage.getItem('index.sk')) input.value = localStorage.getItem('index.sk');
    up(); 
    
    setInterval(() => {
        document.querySelectorAll('.magic-text').forEach(el => {
            let r = ""; const chars = "ABCDEFGHJKLMNOPQRSTUVWXYZ0123456789§$%#";
            for(let i=0; i<5; i++) r += chars.charAt(Math.floor(Math.random()*chars.length));
            el.innerText = r;
        });
    }, 100);

    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            splash.style.visibility = 'hidden';
            setTimeout(() => splash.remove(), 1000);
        }
    }, 2500);
};

const staticSnippets = {
  "on": "on",
  "join": "join",
  "quit": "quit",
  "chat": "chat",
  "break": "break",
  "place": "place",
  "damage": "damage",
  "kill": "kill",
  "death": "death",
  "respawn": "respawn",
  "click": "click",
  "drop": "drop",
  "pickup": "pickup",
  "if": "if",
  "else": "else",
  "while": "while",
  "for": "for",
  "foreach": "foreach",
  "loop": "loop",
  "command": "command",
  "usage": "usage",
  "description": "description",
  "permission": "permission",
  "trigger": "trigger",
  "send": "send",
  "broadcast": "broadcast",
  "give": "give",
  "take": "take",
  "teleport": "teleport",
  "heal": "heal",
  "kick": "kick",
  "ban": "ban",
  "unban": "unban",
  "variables": "variables",
  "set": "set",
  "add": "add",
  "remove": "remove",
  "delete": "delete",
  "clear": "clear",
  "reset": "reset",
  "function": "function",
  "local": "local",
  "true": "true",
  "false": "false",
  "is": "is",
  "not": "not",
  "has": "has",
  "contains": "contains",
  "equals": "equals",
  "player": "player",
  "sender": "sender",
  "victim": "victim",
  "attacker": "attacker",
  "uuid": "uuid",
  "location": "location",
  "world": "world",
  "block": "block",
  "item": "item",
  "inventory": "inventory",
  "wait": "wait",
  "seconds": "seconds",
  "minutes": "minutes",
  "hours": "hours",
  "days": "days",
  "stop": "stop",
  "cancel": "cancel",
  "return": "return",
  "execute": "execute",
  "sound": "sound",
  "message": "message",
  "title": "title",
  "actionbar": "actionbar",
  "permissionmessage": "permissionmessage",
  "cooldown": "cooldown",
  "alias": "alias",

  "on join": "on join",
  "on quit": "on quit",
  "on chat": "on chat",
  "on break": "on break",
  "on place": "on place",
  "on damage": "on damage",
  "on death": "on death",
  "on respawn": "on respawn",
  "on click": "on click",
  "on drop": "on drop",
  "on pickup": "on pickup",
  "loop players": "loop players",
  "loop blocks": "loop blocks",
  "all players": "all players",
  "all blocks": "all blocks",
  "open inventory": "open inventory",
  "close inventory": "close inventory",
  "play sound": "play sound",
  "stop sound": "stop sound",
  "cancel event": "cancel event",
  "send message": "send message",
  "broadcast message": "broadcast message",
  "give item": "give item",
  "take item": "take item",
  "teleport player": "teleport player",
  "heal player": "heal player",
  "kill player": "kill player",
  "kick player": "kick player",
  "ban player": "ban player",
  "unban player": "unban player",
  "set variable": "set variable",
  "add variable": "add variable",
  "remove variable": "remove variable",
  "delete variable": "delete variable",
  "clear variable": "clear variable",
  "reset variable": "reset variable",
  "permission check": "permission check",
  "permission message": "permission message",
  "command trigger": "command trigger",
  "command usage": "command usage",
  "command description": "command description",
  "world name": "world name",
  "player name": "player name",
  "player uuid": "player uuid",
  "player world": "player world",
  "block type": "block type",
  "item type": "item type",
  "wait seconds": "wait seconds",
  "wait minutes": "wait minutes",
  "wait hours": "wait hours",

  "loop all players": "loop all players",
  "loop all blocks": "loop all blocks",
  "send action bar": "send action bar",
  "send title message": "send title message",
  "play sound player": "play sound player",
  "stop sound player": "stop sound player",
  "open player inventory": "open player inventory",
  "close player inventory": "close player inventory",
  "teleport all players": "teleport all players",
  "heal all players": "heal all players",
  "kill all players": "kill all players",
  "kick all players": "kick all players",
  "ban all players": "ban all players",
  "unban all players": "unban all players",
  "set player variable": "set player variable",
  "add player variable": "add player variable",
  "remove player variable": "remove player variable",
  "delete player variable": "delete player variable",
  "clear player variable": "clear player variable",
  "reset player variable": "reset player variable",
  "wait some seconds": "wait some seconds",
  "wait some minutes": "wait some minutes",
  "wait some hours": "wait some hours",
  "execute console command": "execute console command",
  "cancel current event": "cancel current event"
};

const inputLayer = document.getElementById('input-layer');
const suggestionList = document.getElementById('suggestion-list');

inputLayer.addEventListener('input', () => {
    const value = inputLayer.value;
    const cursorPos = inputLayer.selectionStart;
    
    const dynamicMatches = value.match(/\{_.*?\}/g) || [];
    const uniqueVariables = [...new Set(dynamicMatches)]; 

    const textBeforeCursor = value.substring(0, cursorPos);
    const lastWord = textBeforeCursor.split(/\s|\n/).pop();

    if (lastWord.length > 0) {
        let matches = [];

        Object.keys(staticSnippets).forEach(key => {
            if (key.startsWith(lastWord)) matches.push({display: key, insert: staticSnippets[key]});
        });

        uniqueVariables.forEach(v => {
            if (v.startsWith(lastWord) && v !== lastWord) {
                matches.push({display: v, insert: v});
            }
        });

        renderSuggestions(matches, lastWord);
    } else {
        suggestionList.style.display = 'none';
    }
});

function renderSuggestions(matches, lastWord) {
    if (matches.length === 0) {
        suggestionList.style.display = 'none';
        return;
    }

    suggestionList.innerHTML = '';
    matches.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.display;
        
        li.onmousedown = (e) => {
            e.preventDefault(); 
            
            const fullText = inputLayer.value;
            const cursorPos = inputLayer.selectionStart;
            
            const startPos = cursorPos - lastWord.length;
            
            const before = fullText.substring(0, startPos);
            const after = fullText.substring(cursorPos);
            
            inputLayer.value = before + item.insert + after;
            
            const newCursorPos = startPos + item.insert.length;
            inputLayer.setSelectionRange(newCursorPos, newCursorPos);
            
            suggestionList.style.display = 'none';
            inputLayer.focus();
            
            if(typeof up === "function") up();
        };
        suggestionList.appendChild(li);
    });

    suggestionList.style.display = 'block';
}
