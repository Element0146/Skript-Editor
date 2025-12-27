/**
 * Skript Master IDE - Core Script v10.2
 * Updated: Logo spin, Fixed Title, Color Palette
 */

// --- 1. VERİLER (RENKLER VE FORMATLAR) ---
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
        logo_title: "Editor", // İstediğin gibi Editor olarak sabitlendi
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
        logo_title: "Editor",
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

// --- 2. LOGO VE EFEKT SİSTEMİ ---
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

// --- 3. DİL VE WIKI/RENK SİSTEMİ ---
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

// --- 4. EDİTÖR MOTORU (UP) ---
function up() {
    let v = input.value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    v = v.replace(/(#.*)/g, '<span class="h-yorum">$1</span>');
    v = v.replace(/"(.*?)"/g, m => `<span class="h-string">${m.replace(/&amp;k/g, '&k<span class="magic-text"></span>')}</span>`);
    const rules = [
    { r: /(on\s+.*?)(?=:)/gi, c: "h-acikkirmizi" }, // Eventler (on join, on death vb.)
    { r: /(@\w+)/g, c: "h-sari" }, // Ayarlar (@settings)
    { r: /\b(\d+)\b/g, c: "h-acikmavi" }, // Sayılar
    
    // KOŞULLAR VE MANTIKSAL İFADELER
    { r: /\b(if|else|or|and|stop|return|wait|exit|cancel\s+event|continue|is|is\s+not|has|contains|exists|is\s+set|is\s+not\s+set)\b/gi, c: "h-mor" },
    
    // KOMUT SİSTEMİ
    { r: /\b(command|usage|description|permission|permission\s+message|trigger|executable\s+by|aliases|cooldown|cooldown\s+message|cooldown\s+bypass)\b/gi, c: "h-turuncu" },
    
    // DÖNGÜLER VE TOPLULUKLAR
    { r: /\b(loop|while|for|foreach|all\s+players|all\s+entities|all\s+worlds|loop-player|loop-value|loop-index|loop-entity)\b/gi, c: "h-pembe" },
    
    // FONKSİYONLAR VE TANIMLAMALAR
    { r: /\b(function|local\s+function|options|variables)\b/gi, c: "h-yesil" },
    
    // OBJELER VE VERİ KAYNAKLARI
    { r: /\b(player|uuid|victim|attacker|sender|console|message|ip|world|location|event-world|event-location|target\s+player|arg-\d+|arg|argument|metadata|data)\b/gi, c: "h-mavi" },
    
    // EFEKTLER (Aksiyon Komutları)
    { r: /\b(send|broadcast|message|give|set|add|remove|delete|clear|make|execute|teleport|kick|ban|unban|kill|spawn|open|close|enchant|disenchant|apply|play|create|drop|push|strike|lightning|damage|heal|repair|force|load|unload|stop\s+server)\b/gi, c: "h-acikkirmizi" },
    
    // DEĞERLER VE ZAMAN BİRİMLERİ
    { r: /\b(true|false|yes|no|none|seconds|minutes|hours|days|ticks|real\s+time|now)\b/gi, c: "h-sari" }
];

    v = v.replace(/({.*?})/g, '<span class="h-mavi">$1</span>');
    rules.forEach(rule => { v = v.replace(new RegExp(rule.r.source + "(?![^<]*>)", "gi"), `<span class="${rule.c}">$1</span>`); });
    if (v.endsWith('\n') || v === '') v += ' ';
    highlight.innerHTML = v;
    localStorage.setItem('index.sk', input.value);
}

// --- 5. ETKİLEŞİMLER ---
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

// --- 6. KLAVYE VE FONT ---
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

// --- 7. BAŞLATICI ---
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