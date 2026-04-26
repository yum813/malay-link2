import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ═══════════════════════════════════════════════════════
// Supabase 接続設定
// ═══════════════════════════════════════════════════════
const SUPABASE_URL = "https://clzfalgvbgvcaotmntdm.supabase.co";
const SUPABASE_KEY = "sb_publishable_Z4sKiuDkdh9dLCuekGzHUg_wGJErMAU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ═══════════════════════════════════════════════════════
// ダミーデータ（テスト用）
// ═══════════════════════════════════════════════════════
const DUMMY_BLACKLIST = ["banned@example.com"];

// 永久保存カテゴリー（役立つ情報は古くなっても残す）
const PERMANENT_TAGS = ["薬・病院", "住まい", "勉強", "食"];
// 一時的カテゴリー（30日でアーカイブ）
const TEMPORARY_TAGS = ["交流", "お裾分け"];
const ARCHIVE_DAYS = 30;

// 初期投稿（サンプル）
const INITIAL_POSTS = [
  {
    id: "p1",
    user: "みんと",
    area: "クアラルンプール",
    createdAt: Date.now() - 5 * 60000,
    content: "Jaya Grocerで醤油見つけた！KOKUMANっていうやつ、全然使える味",
    tag: "食",
    likes: 12,
    resolved: false,
    replies: [
      { id: "r1", user: "あやか", content: "情報ありがとう！明日行ってみる🌺", createdAt: Date.now() - 3 * 60000 },
      { id: "r2", user: "けんた", content: "KOKUMAN、僕も愛用してます！", createdAt: Date.now() - 2 * 60000 },
      { id: "r3", user: "さくら", content: "値段はいくらでしたか？", createdAt: Date.now() - 1 * 60000 },
    ],
  },
  {
    id: "p2",
    user: "たくみ",
    area: "サイバージャヤ",
    createdAt: Date.now() - 30 * 60000,
    content: "MMU近くで日本人の友達募集中！理工系1年生、一緒に勉強したり飯行ける人いたら嬉しいです",
    tag: "交流",
    likes: 8,
    resolved: false,
    replies: [
      { id: "r4", user: "ゆうき", content: "私もMMU！連絡しましょう", createdAt: Date.now() - 25 * 60000 },
      { id: "r5", user: "りな", content: "学部は何学部ですか？", createdAt: Date.now() - 20 * 60000 },
    ],
  },
  {
    id: "p3",
    user: "さくら",
    area: "スバン・ジャヤ",
    createdAt: Date.now() - 90 * 60000,
    content: "風邪っぽい…現地の薬局でおすすめの薬ありますか？頭痛と鼻水がつらいです",
    tag: "薬・病院",
    likes: 2,
    resolved: false,
    replies: [
      { id: "r6", user: "みんと", content: "Panadolが定番です！Watsons（ワトソンズ）で買えます", createdAt: Date.now() - 80 * 60000 },
      { id: "r7", user: "けんた", content: "鼻水ならClarityneがおすすめです", createdAt: Date.now() - 70 * 60000 },
      { id: "r8", user: "あやか", content: "お大事に！早く治りますように🌺", createdAt: Date.now() - 60 * 60000 },
    ],
  },
  {
    id: "p4",
    user: "けんた",
    area: "ペタリン・ジャヤ",
    createdAt: Date.now() - 3 * 60 * 60000,
    content: "帰国するので！カレールー(5箱)とインスタント味噌汁、無料で譲ります。受け渡し場所決めましょう🌺",
    tag: "お裾分け",
    likes: 21,
    resolved: false,
    replies: [
      { id: "r9", user: "ゆうき", content: "ぜひ欲しいです！", createdAt: Date.now() - 2 * 60 * 60000 },
    ],
  },
];

// エリア
const AREAS = [
  { name: "クアラルンプール", en: "Kuala Lumpur", emoji: "🏙️" },
  { name: "スバン・ジャヤ", en: "Subang Jaya", emoji: "🎓" },
  { name: "ペタリン・ジャヤ", en: "Petaling Jaya", emoji: "🌿" },
  { name: "サイバージャヤ", en: "Cyberjaya", emoji: "💻" },
  { name: "ジョホール・バル", en: "Johor Bahru", emoji: "🌊" },
  { name: "ペナン", en: "Penang", emoji: "🏝️" },
];

// カテゴリー
const CATEGORIES = [
  { label: "食", color: "#f97316" },
  { label: "薬・病院", color: "#10b981" },
  { label: "お裾分け", color: "#8b5cf6" },
  { label: "交流", color: "#ec4899" },
  { label: "住まい", color: "#3b82f6" },
  { label: "勉強", color: "#f59e0b" },
];

const TAG_COLORS = {
  "食": "#f97316",
  "薬・病院": "#10b981",
  "お裾分け": "#8b5cf6",
  "交流": "#ec4899",
  "住まい": "#3b82f6",
  "勉強": "#f59e0b",
};

// 便利リンク・Grab関連
const USEFUL_LINKS = [
  {
    category: "🚗 配車・移動",
    items: [
      { name: "Grab", url: "https://www.grab.com/my/", desc: "配車・フードデリバリー", icon: "🚖", color: "#10b981" },
      { name: "Rapid KL", url: "https://www.myrapid.com.my/", desc: "KL市内の電車・バス", icon: "🚇", color: "#0ea5e9" },
      { name: "AirAsia", url: "https://www.airasia.com/", desc: "近隣国への格安航空", icon: "✈️", color: "#ef4444" },
    ],
  },
  {
    category: "🍔 食事・買い物",
    items: [
      { name: "Grab Food", url: "https://food.grab.com/my/", desc: "フードデリバリー", icon: "🥡", color: "#f97316" },
      { name: "Foodpanda", url: "https://www.foodpanda.my/", desc: "フードデリバリー", icon: "🐼", color: "#ec4899" },
      { name: "Shopee", url: "https://shopee.com.my/", desc: "ネットショッピング", icon: "🛍️", color: "#f59e0b" },
      { name: "Lazada", url: "https://www.lazada.com.my/", desc: "ネットショッピング", icon: "📦", color: "#8b5cf6" },
    ],
  },
  {
    category: "💰 決済・銀行",
    items: [
      { name: "Touch n Go eWallet", url: "https://www.touchngo.com.my/", desc: "電子マネー(MRT/バス)", icon: "💳", color: "#3b82f6" },
      { name: "Wise (送金)", url: "https://wise.com/jp/", desc: "日本から低手数料で送金", icon: "💸", color: "#10b981" },
    ],
  },
  {
    category: "🏥 緊急・医療",
    items: [
      { name: "在マレーシア日本大使館", url: "https://www.my.emb-japan.go.jp/itprtop_ja/", desc: "緊急時・パスポート相談", icon: "🇯🇵", color: "#ef4444" },
      { name: "外務省 海外安全情報", url: "https://www.anzen.mofa.go.jp/", desc: "渡航情報・安全アラート", icon: "📋", color: "#f59e0b" },
    ],
  },
  {
    category: "🌐 翻訳・コミュニケーション",
    items: [
      { name: "Google翻訳", url: "https://translate.google.com/", desc: "テキスト・音声翻訳", icon: "🔤", color: "#3b82f6" },
      { name: "DeepL", url: "https://www.deepl.com/translator", desc: "高精度翻訳", icon: "🌍", color: "#06b6d4" },
    ],
  },
];

// SIMキャリア情報（最新料金は公式サイト確認）
const SIM_CARRIERS = [
  {
    name: "Hotlink (Maxis)",
    feature: "マレーシア最大手・エリアが広い",
    url: "https://www.hotlink.com.my/",
    color: "#ef4444",
    icon: "📡",
  },
  {
    name: "MyCelcomDigi",
    feature: "学割プランが豊富・若者向け",
    url: "https://www.celcomdigi.com/",
    color: "#f59e0b",
    icon: "📶",
  },
  {
    name: "Yes 5G",
    feature: "5G特化で料金が安い",
    url: "https://www.yes.my/",
    color: "#10b981",
    icon: "🚀",
  },
  {
    name: "U Mobile",
    feature: "若者向け・SNS無制限プランあり",
    url: "https://www.u.com.my/",
    color: "#ec4899",
    icon: "📱",
  },
  {
    name: "Unifi Mobile",
    feature: "TM(国営)系・自宅ネットとセット可",
    url: "https://unifi.com.my/personal/mobile",
    color: "#3b82f6",
    icon: "🌐",
  },
];

// 英語フレーズ集
const SIM_PHRASES = [
  {
    ja: "新しいSIMが欲しいです",
    en: "I'd like to buy a new Prepaid SIM card.",
  },
  {
    ja: "留学生向けのプランはありますか？",
    en: "Do you have any student plans?",
  },
  {
    ja: "5Gで、データ無制限のものがいいです",
    en: "I want a 5G Unlimited data plan.",
  },
  {
    ja: "パスポートで登録をお願いします",
    en: "Here is my passport for registration.",
  },
  {
    ja: "設定までやってもらえますか？",
    en: "Could you help me with the APN settings?",
  },
  {
    ja: "1ヶ月でいくらですか？",
    en: "How much is it per month?",
  },
  {
    ja: "有効期限を1年に延ばしたいです",
    en: "I'd like to extend the validity to 1 year.",
  },
];

// 大学ドメイン（本登録対象）
const UNIVERSITY_DOMAINS = [
  ".edu",        // アメリカ・国際
  ".ac.jp",      // 日本
  ".edu.my",     // マレーシア
  ".ac.uk",      // イギリス
  ".edu.au",     // オーストラリア
  ".ac.nz",      // ニュージーランド
  ".edu.sg",     // シンガポール
  ".ac.kr",      // 韓国
  ".edu.cn",     // 中国
  ".ac.th",      // タイ
  ".edu.vn",     // ベトナム
  ".edu.ph",     // フィリピン
  ".edu.tw",     // 台湾
  ".edu.hk",     // 香港
  ".ac.in",      // インド
  ".edu.in",     // インド
  ".ac.id",      // インドネシア
];

// 大学アドレス判定（本登録か仮登録か）
const isUniversityEmail = (email) => {
  if (!email) return false;
  const lower = email.toLowerCase();
  return UNIVERSITY_DOMAINS.some((d) => lower.includes(d));
};

// 危険ワード（永久追放）
const CRITICAL_WORDS = [
  "簡単に稼げる", "副業募集", "投資案件", "マルチ", "ねずみ講",
  "パスポート売", "口座売", "送金して",
];

// 軽度の違反ワード（警告）
const MINOR_WORDS = [
  "死ね", "殺す", "バカ", "クソ",
];

// ═══════════════════════════════════════════════════════
// ユーティリティ
// ═══════════════════════════════════════════════════════
const genId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const checkCriticalWords = (text) => CRITICAL_WORDS.filter((w) => text.includes(w));
const checkMinorWords = (text) => MINOR_WORDS.filter((w) => text.includes(w));

const getAgeLabel = (post) => {
  const m = Math.floor((Date.now() - post.createdAt) / 60000);
  if (m < 1) return "たった今";
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}時間前`;
  return `${Math.floor(h / 24)}日前`;
};

// ═══════════════════════════════════════════════════════
// テキスト
// ═══════════════════════════════════════════════════════
const TEXTS = {
  ja: {
    title: "Malay Link",
    subtitle: "留学の絆 / Ryugaku no Kizuna",
    description: "マレーシアに留学中の日本人が\n安心してつながれる場所です",
    badges: ["承認制", "NGワード検知", "通報機能"],
    joinButton: "仲間に入る",
    notice: "🛡️ メールアドレスで本人確認を行います\n🚨 悪意ある投稿は通報・削除されます",
    tierExplain: "🟢 大学アドレスで本登録 → 全機能OK\n🟡 フリーアドレスは仮登録 → 閲覧のみ",
    unverifiedTitle: "🟡 仮登録モード",
    unverifiedBody: "現在は閲覧のみ可能です\n投稿・返信するには大学アドレスでの登録が必要です",
    unverifiedAction: "大学アドレスで登録し直す",
    cantPost: "🔒 仮登録ユーザーは投稿できません\n大学メールアドレスで登録してください",
    cantReply: "🔒 仮登録ユーザーは返信できません",
    langSwitch: "English",

    onboarding: [
      {
        icon: "🛡️",
        title: "安全のためのルール",
        body: "・勧誘や宣伝はしないでください\n・初対面で個人情報を聞き出さないでください\n・嫌がらせや暴言は禁止です\n\n💡 お裾分け・交換のときは\n　受け渡しのための連絡先交換はOKです\n\nみんなが安心して使える場所を\n一緒に守りましょう。",
      },
      {
        icon: "💬",
        title: "使い方",
        body: "・困ったことを気軽に投稿\n・タグで分類（食・薬・お裾分け など）\n・他の人の投稿に「いいね」や返信\n・解決したら「解決済み」マーク\n\nみんなで助け合う場所です🌺",
      },
      {
        icon: "🆘",
        title: "緊急連絡先",
        body: "・警察：999\n・救急・消防：994\n・在マレーシア日本大使館：03-2177-2600\n・日本語ヘルプライン：03-2177-2617\n\nマレくん🤖にいつでも相談できます！",
      },
      {
        icon: "✅",
        title: "コミュニティ規約への同意",
        body: "上記のルールをすべて読みました。\n安全で温かいコミュニティを\n守ることに同意します。\n\n※犯罪や危険な勧誘に関する違反は\n　即座にアカウントが永久停止されます。",
        agreement: true,
      },
    ],

    agreeButton: "同意して進む",
    backButton: "戻る",
    nextButton: "次へ",
    skipNote: "※ 同意なしには利用できません",
    malekunGreeting: "やあ！マレくんだよ🌺\nコミュニティに参加する前に\n大切なことを説明させてね。",

    registerTitle: "メールアドレスで登録",
    registerSubtitle: "本人確認のためメールアドレスが必要です",
    nicknameLabel: "ニックネーム",
    nicknamePh: "例：みんと（本名不要）",
    emailLabel: "メールアドレス",
    emailPh: "例：yourname@gmail.com",
    registerButton: "登録する",
    bannedMessage: "このメールアドレスは\n利用が停止されています",

    homeGreeting: "ようこそ",
    homeSubGreeting: "今日もマレーシアの仲間と繋がろう🌺",
    timeline: "みんなのつぶやき",
    categoriesTitle: "🆘 お助けカテゴリー",
    postButton: "つぶやく",
    allTab: "すべて",

    postModalTitle: "つぶやく",
    postPlaceholder: "今どんなこと？気軽につぶやいてみてください🌙",
    selectArea: "エリアを選ぶ",
    selectTag: "カテゴリーを選ぶ",
    submitPost: "投稿する",
    cancel: "キャンセル",

    criticalWarning: "⚠️ 危険なワードが検出されました\nこの投稿は規約違反のため\nアカウント停止対象です",
    minorWarning: "🛡️ 不適切な言葉が含まれています\nコミュニティのルールを守りましょう",

    likeText: "いいね",
    replyText: "返信",
    resolved: "解決済み",
    markResolved: "解決済みにする",

    logoutButton: "ログアウト",
  },

  en: {
    title: "Malay Link",
    subtitle: "Bonds of Studying Abroad",
    description: "A safe place for Japanese students\nstudying in Malaysia to connect",
    badges: ["Approval", "Word Filter", "Reporting"],
    joinButton: "Join Us",
    notice: "🛡️ We verify identity by email\n🚨 Malicious posts will be reported & removed",
    tierExplain: "🟢 University email = Full access\n🟡 Free email = View-only mode",
    unverifiedTitle: "🟡 Provisional Account",
    unverifiedBody: "View-only mode active\nPosting & replying requires a university email",
    unverifiedAction: "Re-register with university email",
    cantPost: "🔒 Provisional accounts cannot post\nPlease register with a university email",
    cantReply: "🔒 Provisional accounts cannot reply",
    langSwitch: "日本語",

    onboarding: [
      {
        icon: "🛡️",
        title: "Safety Rules",
        body: "- No soliciting or advertising\n- Don't ask for personal info from strangers\n- No harassment or abusive language\n\n💡 For sharing / exchanging items,\n   exchanging contact info is OK\n\nLet's protect a safe place\nfor everyone, together.",
      },
      {
        icon: "💬",
        title: "How to Use",
        body: "- Post freely about your concerns\n- Use tags (Food, Medicine, Sharing, etc.)\n- Like and reply to others' posts\n- Mark as 'Resolved' when solved\n\nA place to help each other 🌺",
      },
      {
        icon: "🆘",
        title: "Emergency Contacts",
        body: "- Police: 999\n- Ambulance & Fire: 994\n- Japan Embassy: 03-2177-2600\n- Japanese Helpline: 03-2177-2617\n\nMalekun 🤖 is always here to help!",
      },
      {
        icon: "✅",
        title: "Community Agreement",
        body: "I have read all the rules above.\nI agree to protect this safe and\nwarm community.\n\n* Crime-related or dangerous solicitation\n  will result in immediate permanent ban.",
        agreement: true,
      },
    ],

    agreeButton: "I Agree & Continue",
    backButton: "Back",
    nextButton: "Next",
    skipNote: "* You cannot proceed without agreement",
    malekunGreeting: "Hi! I'm Malekun 🌺\nLet me explain something\nimportant before you join.",

    registerTitle: "Register with Email",
    registerSubtitle: "Email is required for identity verification",
    nicknameLabel: "Nickname",
    nicknamePh: "e.g., Mike",
    emailLabel: "Email Address",
    emailPh: "e.g., yourname@gmail.com",
    registerButton: "Register",
    bannedMessage: "This email address has been\npermanently banned",

    homeGreeting: "Welcome",
    homeSubGreeting: "Let's connect with friends in Malaysia 🌺",
    timeline: "Latest Posts",
    categoriesTitle: "🆘 Help Categories",
    postButton: "Post",
    allTab: "All",

    postModalTitle: "New Post",
    postPlaceholder: "What's on your mind? 🌙",
    selectArea: "Select Area",
    selectTag: "Select Category",
    submitPost: "Submit",
    cancel: "Cancel",

    criticalWarning: "⚠️ Dangerous words detected\nThis violates community rules\nand will result in account ban",
    minorWarning: "🛡️ Inappropriate language detected\nPlease follow community guidelines",

    likeText: "Like",
    replyText: "Reply",
    resolved: "Resolved",
    markResolved: "Mark as resolved",

    logoutButton: "Log out",
  },
};

// ═══════════════════════════════════════════════════════
// スタイル
// ═══════════════════════════════════════════════════════
const WRAP = {
  minHeight: "100dvh",
  background: "linear-gradient(160deg,#0d1526 0%,#161f3a 45%,#0d1e16 100%)",
  fontFamily: "'Noto Sans JP','Hiragino Sans',sans-serif",
  color: "#e8f0fe",
  maxWidth: 430,
  margin: "0 auto",
  position: "relative",
};

const CARD = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Zen+Kaku+Gothic+New:wght@700&display=swap');
  @keyframes fadeUp  { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
  @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
  @keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
  @keyframes glow    { 0%,100% { box-shadow:0 0 20px rgba(249,115,22,.3) } 50% { box-shadow:0 0 44px rgba(249,115,22,.65) } }
  @keyframes twinkle { 0%,100% { opacity:.15 } 50% { opacity:.7 } }
  @keyframes bounce  { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-6px) } }
  @keyframes spin    { to { transform: rotate(360deg) } }
  @keyframes shake   { 0%,100% { transform:translateX(0) } 25% { transform:translateX(-6px) } 75% { transform:translateX(6px) } }
  .fadein   { animation: fadeUp .42s ease both }
  .slidein  { animation: fadeIn .35s ease both }
  .btn-press { transition: transform .12s ease }
  .btn-press:active { transform: scale(0.97) !important }
  input:focus, textarea:focus {
    outline: none;
    border-color: #fb923c !important;
    box-shadow: 0 0 0 3px rgba(251,146,60,.25), 0 0 16px rgba(249,115,22,.4) !important;
    background: rgba(255,255,255,.09) !important;
  }
  input, textarea {
    caret-color: #fb923c;
  }
`;

// ═══════════════════════════════════════════════════════
// 星空
// ═══════════════════════════════════════════════════════
function Stars() {
  const stars = Array.from({ length: 24 }, (_, i) => ({
    size: i % 6 === 0 ? 3 : 2,
    top: `${(i * 37 + 11) % 100}%`,
    left: `${(i * 53 + 7) % 100}%`,
    dur: 2 + (i % 4),
    delay: (i * 0.3) % 4,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {stars.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "white",
            opacity: 0.15 + (i % 5) * 0.06,
            top: s.top,
            left: s.left,
            animation: `twinkle ${s.dur}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 投稿カード
// ═══════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════
// SIMガイド画面
// ═══════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════
// 便利リンク・Grab画面
// ═══════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════
// マレくんチャット画面
// ═══════════════════════════════════════════════════════
function MalekunChat({ onBack, lang, currentUser }) {
  const greeting = lang === "ja"
    ? `こんにちは、${currentUser?.name || "あなた"}さん！🌺\nマレくんだよ。\n\nマレーシア生活で困ったこと、\n何でも相談してね！`
    : `Hi, ${currentUser?.name || "friend"}! 🌺\nI'm Malekun.\n\nFeel free to ask me anything\nabout life in Malaysia!`;

  const [messages, setMessages] = useState([
    { id: "init", role: "malekun", text: greeting, time: Date.now() },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // よくある質問のサンプル回答
  const SAMPLE_RESPONSES = lang === "ja" ? {
    "sim": "📱 SIMの質問だね!\n\nおすすめは:\n・Hotlink (最大手・安心)\n・Yes 5G (安くて速い)\n\n詳しくはホーム画面の「SIMガイド」を見てね🌺",
    "薬": "💊 薬についてだね。\n\n一般的な薬はWatsons(ワトソンズ)やGuardianで買えるよ。日本人スタッフがいる店もあるから安心!\n\n症状がひどい時は病院に行こう。在マレーシア日本大使館(03-2177-2600)に相談すれば日本語OK病院を教えてくれるよ🏥",
    "食": "🍜 食事の質問!\n\n日本食材はJaya GrocerやIsetanで買えるよ。Mid Valleyの「ISETAN The Japan Store」は品揃え豊富!\n\nハラル対応のお店も多いから、ムスリムの友達と一緒に食事する時も安心🌺",
    "病院": "🏥 病院について。\n\n日本語対応の病院:\n・Pantai Hospital KL (日本人医師あり)\n・Subang Jaya Medical Centre\n・Gleneagles KL\n\n緊急時は救急車994、警察999、日本大使館03-2177-2600に連絡してね!",
    "grab": "🚖 Grabは超便利!\n\nアプリをDLしてクレジットカード登録すれば即使える。料金は事前に表示されるからぼったくり心配なし!\n\nGrab Foodもおすすめ。マレーシアの色んな料理が試せるよ🌺",
    "天気": "☀️ マレーシアは年中暑い!\n\n平均30度前後、湿度高め。スコール(突然の大雨)に注意⛈️\n\n室内はクーラー効きすぎな場所も多いから、薄手の上着を持ち歩くといいよ。",
    "default": "ありがとう、質問してくれて🌺\n\nマレーシアの生活で困ったことがあったら、もっと具体的に聞いてみて!\n\n例えば「SIMの選び方」「日本語OK病院」「Grabの使い方」「日本食材どこで買える?」とか聞いてくれたら、しっかり答えるよ!",
  } : {
    "sim": "📱 SIM question!\n\nRecommended:\n- Hotlink (largest carrier)\n- Yes 5G (cheap & fast)\n\nCheck the SIM Guide on the home screen for details 🌺",
    "default": "Thanks for asking 🌺\n\nFeel free to ask me about anything in Malaysia! For example: SIM cards, Japanese-friendly hospitals, how to use Grab, where to buy Japanese food, etc.",
  };

  const findResponse = (input) => {
    const lower = input.toLowerCase();
    for (const key of Object.keys(SAMPLE_RESPONSES)) {
      if (key === "default") continue;
      if (lower.includes(key)) return SAMPLE_RESPONSES[key];
    }
    return SAMPLE_RESPONSES["default"];
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      time: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = findResponse(text);
      const malekunMsg = {
        id: `m-${Date.now()}`,
        role: "malekun",
        text: reply,
        time: Date.now(),
      };
      setMessages((prev) => [...prev, malekunMsg]);
      setIsTyping(false);
    }, 1100);
  };

  // 自動スクロール
  const messagesEndRef = useRef(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // クイック質問ボタン
  const QUICK_QUESTIONS = lang === "ja"
    ? ["SIMはどう選ぶ?", "日本語OK病院は?", "Grabの使い方", "日本食材どこ?", "天気は?"]
    : ["How to choose SIM?", "Japanese hospitals?", "How to use Grab?", "Japanese food?", "Weather?"];

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* ヘッダー */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(13,21,38,.95)",
          backdropFilter: "blur(20px)",
          padding: "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,.07)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,.07)",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 8,
            width: 32,
            height: 32,
            color: "rgba(255,255,255,.7)",
            fontSize: 16,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ←
        </button>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#10b981,#3b82f6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          🤖
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Malekun</div>
          <div style={{ fontSize: 10, color: "#34d399" }}>
            ● {lang === "ja" ? "オンライン" : "Online"}
          </div>
        </div>
      </div>

      {/* メッセージリスト */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              gap: 8,
              flexDirection: m.role === "user" ? "row-reverse" : "row",
              animation: "fadeUp .3s ease both",
            }}
          >
            {m.role === "malekun" && (
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#10b981,#3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                  flexShrink: 0,
                }}
              >
                🤖
              </div>
            )}
            <div
              style={{
                maxWidth: "75%",
                padding: "10px 13px",
                borderRadius: 14,
                background: m.role === "user"
                  ? "linear-gradient(135deg,#f97316,#ec4899)"
                  : "rgba(255,255,255,.07)",
                border: m.role === "user"
                  ? "none"
                  : "1px solid rgba(16,185,129,.25)",
                color: m.role === "user" ? "#fff" : "rgba(255,255,255,.92)",
                fontSize: 13,
                lineHeight: 1.7,
                whiteSpace: "pre-line",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div
            style={{
              display: "flex",
              gap: 8,
              animation: "fadeUp .3s ease both",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#10b981,#3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
              }}
            >
              🤖
            </div>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                background: "rgba(255,255,255,.07)",
                border: "1px solid rgba(16,185,129,.25)",
                color: "rgba(255,255,255,.6)",
                fontSize: 13,
              }}
            >
              <span style={{ animation: "twinkle 1.2s ease infinite" }}>● ● ●</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* クイック質問 */}
      {messages.length <= 2 && (
        <div
          style={{
            padding: "8px 14px",
            display: "flex",
            gap: 6,
            overflowX: "auto",
          }}
        >
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => {
                setInputText(q);
                setTimeout(() => {
                  const text = q;
                  const userMsg = { id: `u-${Date.now()}`, role: "user", text, time: Date.now() };
                  setMessages((prev) => [...prev, userMsg]);
                  setInputText("");
                  setIsTyping(true);
                  setTimeout(() => {
                    const reply = findResponse(text);
                    setMessages((prev) => [...prev, { id: `m-${Date.now()}`, role: "malekun", text: reply, time: Date.now() }]);
                    setIsTyping(false);
                  }, 1100);
                }, 50);
              }}
              style={{
                flexShrink: 0,
                background: "rgba(16,185,129,.12)",
                border: "1px solid rgba(16,185,129,.3)",
                borderRadius: 16,
                padding: "5px 12px",
                fontSize: 11,
                color: "#34d399",
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* 入力欄 */}
      <div
        style={{
          background: "rgba(13,21,38,.97)",
          borderTop: "1px solid rgba(255,255,255,.08)",
          padding: "10px 14px 16px",
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
        }}
      >
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={lang === "ja" ? "マレくんに聞いてみる..." : "Ask Malekun..."}
          rows={1}
          maxLength={300}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.05)",
            color: "#e8f0fe",
            fontSize: 13,
            fontFamily: "inherit",
            resize: "none",
            maxHeight: 80,
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isTyping}
          className="btn-press"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            cursor: inputText.trim() && !isTyping ? "pointer" : "default",
            background: inputText.trim() && !isTyping
              ? "linear-gradient(135deg,#10b981,#3b82f6)"
              : "rgba(255,255,255,.1)",
            color: inputText.trim() && !isTyping ? "white" : "rgba(255,255,255,.3)",
            fontSize: 16,
            fontFamily: "inherit",
            flexShrink: 0,
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

function UsefulLinks({ onBack, lang }) {
  return (
    <div style={{ minHeight: "100dvh", paddingBottom: 40 }}>
      {/* ヘッダー */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(13,21,38,.95)",
          backdropFilter: "blur(20px)",
          padding: "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,.07)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,.07)",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 8,
            width: 32,
            height: 32,
            color: "rgba(255,255,255,.7)",
            fontSize: 16,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ←
        </button>
        <div
          style={{
            fontFamily: "'Zen Kaku Gothic New',sans-serif",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          🚗 {lang === "ja" ? "便利リンク集" : "Useful Links"}
        </div>
      </div>

      <div style={{ padding: "16px 14px", position: "relative", zIndex: 1 }} className="fadein">
        <div
          style={{
            background: "linear-gradient(135deg,rgba(16,185,129,.13),rgba(59,130,246,.08))",
            border: "1px solid rgba(16,185,129,.3)",
            borderRadius: 14,
            padding: "13px 16px",
            marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: "#34d399", marginBottom: 5 }}>
            {lang === "ja" ? "💡 マレーシア生活で必須のリンク集" : "💡 Essential Links for Life in Malaysia"}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,.7)",
              lineHeight: 1.7,
            }}
          >
            {lang === "ja"
              ? "タップで公式サイト・アプリページへ移動します"
              : "Tap to open official sites and app pages"}
          </div>
        </div>

        {USEFUL_LINKS.map((cat) => (
          <div key={cat.category} style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,.8)",
                marginBottom: 8,
              }}
            >
              {cat.category}
            </div>

            {cat.items.map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  textDecoration: "none",
                  background: "rgba(255,255,255,.04)",
                  border: `1px solid ${item.color}40`,
                  borderRadius: 12,
                  padding: "12px 14px",
                  marginBottom: 7,
                  color: "inherit",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      fontSize: 22,
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: `${item.color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.55)", marginTop: 2 }}>
                      {item.desc}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: item.color, fontWeight: 600 }}>→</div>
                </div>
              </a>
            ))}
          </div>
        ))}

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

function SimGuide({ onBack, lang }) {
  const [expandedPhrase, setExpandedPhrase] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const handleCopy = (text, idx) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 1500);
      });
    }
  };

  return (
    <div style={{ minHeight: "100dvh", paddingBottom: 40 }}>
      {/* ヘッダー */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(13,21,38,.95)",
          backdropFilter: "blur(20px)",
          padding: "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,.07)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,.07)",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 8,
            width: 32,
            height: 32,
            color: "rgba(255,255,255,.7)",
            fontSize: 16,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ←
        </button>
        <div
          style={{
            fontFamily: "'Zen Kaku Gothic New',sans-serif",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          📱 {lang === "ja" ? "SIMガイド" : "SIM Guide"}
        </div>
      </div>

      <div style={{ padding: "16px 14px", position: "relative", zIndex: 1 }} className="fadein">

        {/* ⚠️ 重要警告バナー */}
        <div
          style={{
            background: "linear-gradient(135deg,rgba(239,68,68,.18),rgba(245,158,11,.12))",
            border: "1px solid rgba(239,68,68,.4)",
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fca5a5", marginBottom: 6 }}>
            ⚠️ {lang === "ja" ? "とても大事な注意" : "Very Important Warning"}
          </div>
          <div
            style={{
              fontSize: 12,
              lineHeight: 1.7,
              color: "rgba(255,255,255,.85)",
            }}
          >
            {lang === "ja"
              ? "マレーシアのプリペイドSIMは、チャージ(Top Up)しないと\n有効期限が切れて電話番号が消えてしまいます！\n\n月に1回は必ず残高チャージを忘れずに🌺"
              : "Malaysian Prepaid SIM expires if you don't Top Up.\nYour phone number will disappear!\n\nRemember to recharge at least once a month 🌺"}
          </div>
        </div>

        {/* 主要キャリア5社 */}
        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.8)", marginBottom: 4 }}>
          📡 {lang === "ja" ? "主要キャリア5社" : "Top 5 Carriers"}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 12 }}>
          {lang === "ja"
            ? "最新の料金は各社の公式サイトで確認してください"
            : "Check official sites for latest pricing"}
        </div>

        {SIM_CARRIERS.map((c) => (
          <a
            key={c.name}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              textDecoration: "none",
              background: "rgba(255,255,255,.04)",
              border: `1px solid ${c.color}40`,
              borderRadius: 12,
              padding: "12px 14px",
              marginBottom: 8,
              color: "inherit",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  fontSize: 22,
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: `${c.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {c.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{c.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.55)", marginTop: 2 }}>
                  {c.feature}
                </div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: c.color,
                  fontWeight: 600,
                }}
              >
                {lang === "ja" ? "公式 →" : "Official →"}
              </div>
            </div>
          </a>
        ))}

        {/* チャージ手順 */}
        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.8)", marginTop: 24, marginBottom: 12 }}>
          🔄 {lang === "ja" ? "チャージ手順（4ステップ）" : "Top Up Steps"}
        </div>

        {[
          {
            num: "1",
            title: lang === "ja" ? "専用アプリを入れる" : "Install official app",
            body: lang === "ja"
              ? "Hotlinkアプリ・MyCelcomDigiなど。\nログインすると有効期限が大きく見えます。"
              : "Hotlink app, MyCelcomDigi, etc.\nLogin to see your expiry date.",
          },
          {
            num: "2",
            title: lang === "ja" ? "Top Up（チャージ）" : "Top Up your balance",
            body: lang === "ja"
              ? "クレジットカードやGrabPayで残高を追加。"
              : "Add balance with credit card or GrabPay.",
          },
          {
            num: "3",
            title: lang === "ja" ? "プランを購入" : "Buy a plan",
            body: lang === "ja"
              ? "残高を追加しただけではダメ。\n「1ヶ月無制限プラン」などを必ず購入。"
              : "Just topping up isn't enough.\nBuy a plan like 'Unlimited Monthly'.",
          },
          {
            num: "4",
            title: lang === "ja" ? "【裏技】有効期限延長" : "[Tip] Extend Validity",
            body: lang === "ja"
              ? "「RM30で1年延長」のメニューがある会社も。\nこれをしておけば失効を防げます。"
              : "Some carriers offer 'RM30 for 1-year extension'.\nThis prevents accidental expiry.",
          },
        ].map((step) => (
          <div
            key={step.num}
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 12,
              padding: "12px 14px",
              marginBottom: 8,
              display: "flex",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#f97316,#ec4899)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "white",
                flexShrink: 0,
              }}
            >
              {step.num}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                {step.title}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,.6)",
                  lineHeight: 1.7,
                  whiteSpace: "pre-line",
                }}
              >
                {step.body}
              </div>
            </div>
          </div>
        ))}

        {/* 指差し英語フレーズ */}
        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.8)", marginTop: 24, marginBottom: 4 }}>
          🗣️ {lang === "ja" ? "指差し英語フレーズ" : "Point-and-Show Phrases"}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 12 }}>
          {lang === "ja"
            ? "店員さんに見せるだけでOK！タップで拡大表示"
            : "Just show this to the staff. Tap to enlarge."}
        </div>

        {SIM_PHRASES.map((p, idx) => (
          <div
            key={idx}
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 12,
              padding: "12px 14px",
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 11, color: "rgba(251,146,60,.85)", marginBottom: 6 }}>
              🇯🇵 {p.ja}
            </div>
            <div
              onClick={() => setExpandedPhrase(idx)}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                background: "rgba(96,165,250,.1)",
                border: "1px solid rgba(96,165,250,.25)",
                borderRadius: 8,
                padding: "10px 12px",
                marginBottom: 8,
                cursor: "pointer",
                lineHeight: 1.5,
              }}
            >
              🇬🇧 {p.en}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => handleCopy(p.en, idx)}
                style={{
                  flex: 1,
                  padding: "6px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,.12)",
                  background: copiedIdx === idx ? "rgba(16,185,129,.2)" : "rgba(255,255,255,.04)",
                  color: copiedIdx === idx ? "#34d399" : "rgba(255,255,255,.55)",
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {copiedIdx === idx
                  ? (lang === "ja" ? "✅ コピーしました" : "✅ Copied!")
                  : (lang === "ja" ? "📋 コピー" : "📋 Copy")}
              </button>
              <button
                onClick={() => setExpandedPhrase(idx)}
                style={{
                  flex: 1,
                  padding: "6px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,.12)",
                  background: "rgba(255,255,255,.04)",
                  color: "rgba(255,255,255,.55)",
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                🔍 {lang === "ja" ? "拡大表示" : "Enlarge"}
              </button>
            </div>
          </div>
        ))}

        <div style={{ height: 24 }} />
      </div>

      {/* 拡大表示モーダル */}
      {expandedPhrase !== null && (
        <div
          onClick={() => setExpandedPhrase(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,.92)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: "rgba(251,146,60,.85)",
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            🇯🇵 {SIM_PHRASES[expandedPhrase].ja}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#fff",
              textAlign: "center",
              lineHeight: 1.5,
              padding: "30px 20px",
              background: "rgba(96,165,250,.15)",
              border: "2px solid rgba(96,165,250,.4)",
              borderRadius: 18,
              maxWidth: 400,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {SIM_PHRASES[expandedPhrase].en}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 11,
              color: "rgba(255,255,255,.4)",
            }}
          >
            {lang === "ja" ? "タップで閉じる" : "Tap to close"}
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, liked, onLike, onResolve, onOpenPost }) {
  const color = TAG_COLORS[post.tag] || "#f97316";
  const replyCount = post.replies?.length || 0;

  return (
    <div
      style={{
        ...CARD,
        padding: "13px 14px",
        marginBottom: 8,
        animation: "fadeUp .4s ease both",
        opacity: post.resolved ? 0.65 : 1,
        border: post.resolved
          ? "1px solid rgba(16,185,129,.3)"
          : "1px solid rgba(255,255,255,.08)",
      }}
    >
      {post.resolved && (
        <div
          style={{
            fontSize: 10,
            color: "#34d399",
            background: "rgba(16,185,129,.12)",
            border: "1px solid rgba(16,185,129,.25)",
            borderRadius: 6,
            padding: "3px 10px",
            marginBottom: 8,
            display: "inline-flex",
          }}
        >
          ✅ 解決済み
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: `linear-gradient(135deg,${color}80,${color}28)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {post.user[0]}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{post.user}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.35)" }}>
            {post.area} · {getAgeLabel(post)}
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            padding: "2px 8px",
            borderRadius: 8,
            background: `${color}20`,
            color,
            fontSize: 9,
          }}
        >
          {post.tag}
        </div>
      </div>

      <div
        onClick={() => onOpenPost(post.id)}
        style={{
          fontSize: 13,
          lineHeight: 1.7,
          color: "rgba(255,255,255,.85)",
          whiteSpace: "pre-wrap",
          cursor: "pointer",
        }}
      >
        {post.content}
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 10,
          alignItems: "center",
        }}
      >
        <button
          onClick={() => onLike(post.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: liked ? "#f97316" : "rgba(255,255,255,.4)",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 3,
            fontFamily: "inherit",
            padding: 0,
          }}
        >
          {liked ? "❤️" : "🤍"} {post.likes + (liked ? 1 : 0)}
        </button>
        <button
          onClick={() => onOpenPost(post.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: replyCount > 0 ? "#60a5fa" : "rgba(255,255,255,.4)",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 3,
            fontFamily: "inherit",
            padding: 0,
            fontWeight: replyCount > 0 ? 600 : 400,
          }}
        >
          💬 {replyCount} {replyCount > 0 ? "返信を見る →" : "返信"}
        </button>
        {["お裾分け", "薬・病院", "交流"].includes(post.tag) && (
          <button
            onClick={() => onResolve(post.id)}
            style={{
              marginLeft: "auto",
              fontSize: 10,
              padding: "3px 9px",
              borderRadius: 8,
              border: `1px solid ${
                post.resolved ? "rgba(16,185,129,.4)" : "rgba(255,255,255,.12)"
              }`,
              background: post.resolved ? "rgba(16,185,129,.12)" : "transparent",
              color: post.resolved ? "#34d399" : "rgba(255,255,255,.35)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {post.resolved ? "✅ 解決済み" : "解決済みにする"}
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// メイン App
// ═══════════════════════════════════════════════════════
export default function App() {
  const [lang, setLang] = useState("ja");
  const [screen, setScreen] = useState("entry");
  const [step, setStep] = useState(0);

  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // ステップ3: 投稿関連
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [liked, setLiked] = useState({});
  const [filterTag, setFilterTag] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postText, setPostText] = useState("");
  const [postArea, setPostArea] = useState("");
  const [postTag, setPostTag] = useState("食");
  const [postWarning, setPostWarning] = useState(null);
  const [postSuccess, setPostSuccess] = useState(false);

  // 投稿詳細・返信
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyWarning, setReplyWarning] = useState(null);
  const [showArchive, setShowArchive] = useState(false);
  const [showSimGuide, setShowSimGuide] = useState(false);
  const [showUsefulLinks, setShowUsefulLinks] = useState(false);
  const [showMalekun, setShowMalekun] = useState(false);

  const t = TEXTS[lang];

  const toggleLang = () => setLang(lang === "ja" ? "en" : "ja");

  const handleJoin = () => {
    setScreen("onboarding");
    setStep(0);
  };

  const handleNext = () => {
    if (step < t.onboarding.length) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else setScreen("entry");
  };

  const handleAgree = () => {
    setScreen("register");
    setRegisterError("");
  };

  // ── 登録処理 ──
  // ── Supabaseから投稿を取得 ──
  const fetchPosts = async () => {
    setPostsLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Fetch posts error:", error);
        // エラー時はサンプルデータを表示
        setPosts(INITIAL_POSTS);
      } else if (data && data.length > 0) {
        // Supabaseのデータをアプリの形式に変換
        const formatted = data.map((p) => ({
          id: p.id,
          user: p.user_name,
          area: p.area || "未設定",
          createdAt: new Date(p.created_at).getTime(),
          content: p.content,
          tag: p.tag,
          likes: p.likes_count || 0,
          resolved: p.resolved || false,
          replies: p.replies_data || [],
        }));
        setPosts(formatted);
      } else {
        // データがない場合はサンプル表示
        setPosts(INITIAL_POSTS);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setPosts(INITIAL_POSTS);
    } finally {
      setPostsLoading(false);
    }
  };

  // ホーム画面に来たら投稿を読み込む
  useEffect(() => {
    if (screen === "home") {
      fetchPosts();
    }
  }, [screen]);

  const handleRegister = async () => {
    setRegisterError("");

    if (!nameInput.trim()) {
      setRegisterError(lang === "ja" ? "ニックネームを入力してください" : "Please enter a nickname");
      return;
    }
    if (nameInput.trim().length < 2) {
      setRegisterError(lang === "ja" ? "ニックネームは2文字以上で" : "Nickname must be 2+ characters");
      return;
    }
    if (nameInput.length > 15) {
      setRegisterError(lang === "ja" ? "ニックネームは15文字以内で" : "Nickname must be under 15");
      return;
    }

    const hasFullWidth = /[\uFF00-\uFFEF]/.test(emailInput);
    if (hasFullWidth) {
      setRegisterError(
        lang === "ja"
          ? "全角文字が含まれているようです🌺\n半角英数字で入力してください\n（キーボード左下の🌐で英語に切替）"
          : "Full-width characters detected 🌺\nPlease use half-width characters"
      );
      return;
    }
    if (!emailInput.includes("@")) {
      setRegisterError(
        lang === "ja"
          ? "メールアドレスに「@」が含まれていません"
          : "Email must contain '@'"
      );
      return;
    }
    const parts = emailInput.split("@");
    if (parts.length !== 2 || !parts[1].includes(".")) {
      setRegisterError(
        lang === "ja" ? "メールアドレスの形式が正しくありません" : "Invalid email format"
      );
      return;
    }

    setLoading(true);
    const email = emailInput.toLowerCase();

    try {
      // ① Supabaseでブラックリストチェック
      const { data: banned, error: banErr } = await supabase
        .from("blacklist")
        .select("user_email")
        .eq("user_email", email)
        .maybeSingle();

      if (banErr) {
        console.error("Blacklist check error:", banErr);
      } else if (banned) {
        setRegisterError(t.bannedMessage);
        setLoading(false);
        return;
      }

      // ② Supabaseに同意を記録（既存なら更新）
      const { error: agreeErr } = await supabase
        .from("agreements")
        .upsert(
          {
            user_email: email,
            user_name: nameInput.trim(),
            language: lang,
            agreed_at: new Date().toISOString(),
          },
          { onConflict: "user_email" }
        );

      if (agreeErr) {
        console.error("Agreement save error:", agreeErr);
      }

      // ③ ログイン完了
      setCurrentUser({
        name: nameInput.trim(),
        email,
        verified: isUniversityEmail(email),
      });
      setScreen("home");
    } catch (err) {
      console.error("Register failed:", err);
      setRegisterError(
        lang === "ja"
          ? "登録に失敗しました。もう一度お試しください。"
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── 投稿処理 ──
  const handleSubmitPost = async () => {
    setPostWarning(null);

    if (!postText.trim()) {
      setPostWarning(lang === "ja" ? "投稿内容を入力してください" : "Please enter content");
      return;
    }

    // 危険ワードチェック（永久追放対象）
    const critical = checkCriticalWords(postText);
    if (critical.length > 0) {
      setPostWarning(t.criticalWarning + `\n\n検出: 「${critical[0]}」`);
      // ブラックリストに自動追加
      try {
        await supabase.from("blacklist").upsert(
          { user_email: currentUser.email, reason: `危険ワード検出: ${critical[0]}` },
          { onConflict: "user_email" }
        );
      } catch (e) { console.error("Blacklist add error:", e); }
      return;
    }

    // 軽度の違反ワード
    const minor = checkMinorWords(postText);
    if (minor.length > 0) {
      setPostWarning(t.minorWarning + `\n\n検出: 「${minor[0]}」`);
      // 違反記録
      try {
        await supabase.from("violations").insert({
          user_email: currentUser.email,
          violation_type: "minor",
          content: postText,
          severity: "minor",
        });
      } catch (e) { console.error("Violation log error:", e); }
      return;
    }

    // Supabaseに保存
    try {
      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_name: currentUser.name,
          user_email: currentUser.email,
          area: postArea || "未設定",
          content: postText.trim(),
          tag: postTag,
          likes_count: 0,
          resolved: false,
          approved: true,
        })
        .select()
        .single();

      if (error) throw error;

      // ローカル表示にも追加
      const newPost = {
        id: data.id,
        user: data.user_name,
        area: data.area || "未設定",
        createdAt: new Date(data.created_at).getTime(),
        content: data.content,
        tag: data.tag,
        likes: 0,
        replies: [],
        resolved: false,
      };
      setPosts([newPost, ...posts]);
    } catch (err) {
      console.error("Post save error:", err);
      setPostWarning(
        lang === "ja"
          ? "投稿の保存に失敗しました。もう一度お試しください。"
          : "Failed to save post. Please try again."
      );
      return;
    }

    setPostText("");
    setPostArea("");
    setPostTag("食");
    setShowPostModal(false);
    setPostSuccess(true);
    setTimeout(() => setPostSuccess(false), 2500);
  };

  const toggleLike = (id) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleResolved = (id) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, resolved: !p.resolved } : p))
    );
  };

  // ── 返信を送信 ──
  const handleSubmitReply = () => {
    setReplyWarning(null);
    if (!replyText.trim()) return;

    // 危険ワードチェック
    const critical = checkCriticalWords(replyText);
    if (critical.length > 0) {
      setReplyWarning(t.criticalWarning + `\n\n検出: 「${critical[0]}」`);
      return;
    }
    const minor = checkMinorWords(replyText);
    if (minor.length > 0) {
      setReplyWarning(t.minorWarning + `\n\n検出: 「${minor[0]}」`);
      return;
    }

    const newReply = {
      id: genId(),
      user: currentUser.name,
      content: replyText.trim(),
      createdAt: Date.now(),
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === selectedPostId
          ? { ...p, replies: [...(p.replies || []), newReply] }
          : p
      )
    );
    setReplyText("");
  };

  const handleLogout = () => {
    setScreen("entry");
    setStep(0);
    setNameInput("");
    setEmailInput("");
    setCurrentUser(null);
    setFilterTag(null);
  };

  // ── 投稿のフィルタリング（アーカイブ対応） ──
  const isArchived = (post) => {
    if (!post.resolved) return false;
    if (PERMANENT_TAGS.includes(post.tag)) return false;
    if (TEMPORARY_TAGS.includes(post.tag)) {
      const ageInDays = (Date.now() - post.createdAt) / (1000 * 60 * 60 * 24);
      return ageInDays > ARCHIVE_DAYS;
    }
    return false;
  };

  const visiblePosts = posts.filter((p) => showArchive || !isArchived(p));
  const filteredPosts = filterTag
    ? visiblePosts.filter((p) => p.tag === filterTag)
    : visiblePosts;

  const selectedPost = selectedPostId
    ? posts.find((p) => p.id === selectedPostId)
    : null;

  // ════════════════════════════════════════
  // 画面: 入り口
  // ════════════════════════════════════════
  if (screen === "entry") {
    return (
      <div
        style={{
          ...WRAP,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <style>{CSS}</style>
        <Stars />

        <button
          onClick={toggleLang}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 5,
            background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.15)",
            borderRadius: 20,
            padding: "5px 14px",
            color: "rgba(255,255,255,.7)",
            fontSize: 11,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          🌐 {t.langSwitch}
        </button>

        <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 22,
              background: "linear-gradient(135deg,#f97316,#ec4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 38,
              margin: "0 auto 24px",
              animation: "glow 3s ease infinite",
            }}
          >
            🌺
          </div>

          <div
            style={{
              fontFamily: "'Zen Kaku Gothic New',sans-serif",
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            {t.title}
          </div>
          <div
            style={{
              fontSize: 14,
              color: "rgba(251,146,60,.85)",
              marginBottom: 12,
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            {t.subtitle}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,.7)",
              marginBottom: 36,
              lineHeight: 1.8,
              whiteSpace: "pre-line",
              fontWeight: 400,
            }}
          >
            {t.description}
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 32,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              { icon: "🔐", text: t.badges[0] },
              { icon: "🛡️", text: t.badges[1] },
              { icon: "🚨", text: t.badges[2] },
            ].map((b) => (
              <div
                key={b.text}
                style={{
                  background: "rgba(255,255,255,.07)",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: 20,
                  padding: "5px 12px",
                  fontSize: 11,
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                }}
              >
                {b.icon}{" "}
                <span style={{ color: "rgba(255,255,255,.6)" }}>{b.text}</span>
              </div>
            ))}
          </div>

          <button
            className="btn-press"
            onClick={handleJoin}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg,#f97316,#ec4899)",
              color: "white",
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "inherit",
              boxShadow: "0 4px 24px rgba(249,115,22,.4)",
            }}
          >
            {t.joinButton} 🌺
          </button>

          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              borderRadius: 12,
              background: "linear-gradient(135deg,rgba(249,115,22,.10),rgba(236,72,153,.06))",
              border: "1px solid rgba(249,115,22,.25)",
              fontSize: 12,
              color: "rgba(255,255,255,.85)",
              lineHeight: 1.8,
              whiteSpace: "pre-line",
              fontWeight: 500,
            }}
          >
            {t.notice}
          </div>

          <div
            style={{
              marginTop: 8,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(96,165,250,.08)",
              border: "1px solid rgba(96,165,250,.2)",
              fontSize: 11,
              color: "rgba(255,255,255,.7)",
              lineHeight: 1.7,
              whiteSpace: "pre-line",
            }}
          >
            {t.tierExplain}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // 画面: オンボーディング
  // ════════════════════════════════════════
  if (screen === "onboarding") {
    if (step === 0) {
      return (
        <div
          style={{
            ...WRAP,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 24px",
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          <style>{CSS}</style>
          <Stars />
          <div style={{ position: "relative", zIndex: 1, width: "100%" }} className="slidein">
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#10b981,#3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 50,
                margin: "0 auto 24px",
                animation: "bounce 2s ease infinite",
                boxShadow: "0 8px 32px rgba(16,185,129,.4)",
              }}
            >
              🤖
            </div>

            <div style={{ fontSize: 18, fontWeight: 700, color: "#34d399", marginBottom: 8 }}>
              Malekun
            </div>

            <div
              style={{
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(16,185,129,.3)",
                borderRadius: 18,
                padding: "20px 24px",
                marginBottom: 24,
                fontSize: 15,
                lineHeight: 1.8,
                whiteSpace: "pre-line",
              }}
            >
              {t.malekunGreeting}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn-press"
                onClick={handleBack}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,.15)",
                  background: "transparent",
                  color: "rgba(255,255,255,.6)",
                  fontSize: 13,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                ← {t.backButton}
              </button>
              <button
                className="btn-press"
                onClick={handleNext}
                style={{
                  flex: 2,
                  padding: "12px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg,#10b981,#3b82f6)",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                {t.nextButton} →
              </button>
            </div>
          </div>
        </div>
      );
    }

    const slide = t.onboarding[step - 1];
    const totalSlides = t.onboarding.length;

    return (
      <div style={{ ...WRAP, padding: "40px 24px 32px", overflow: "hidden" }}>
        <style>{CSS}</style>
        <Stars />

        <div style={{ position: "relative", zIndex: 1 }} className="slidein">
          <div
            style={{
              display: "flex",
              gap: 6,
              justifyContent: "center",
              marginBottom: 32,
            }}
          >
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step - 1 ? 24 : 8,
                  height: 4,
                  borderRadius: 2,
                  background:
                    i <= step - 1
                      ? "linear-gradient(90deg,#10b981,#3b82f6)"
                      : "rgba(255,255,255,.15)",
                  transition: "width .3s ease",
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#10b981,#3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              🤖
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>Malekun</div>
            <div style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,.35)" }}>
              {step} / {totalSlides}
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 18,
              padding: "32px 24px",
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 56, textAlign: "center", marginBottom: 16 }}>
              {slide.icon}
            </div>
            <div
              style={{
                fontFamily: "'Zen Kaku Gothic New',sans-serif",
                fontSize: 20,
                fontWeight: 700,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              {slide.title}
            </div>
            <div
              style={{
                fontSize: 14,
                lineHeight: 1.9,
                color: "rgba(255,255,255,.85)",
                whiteSpace: "pre-line",
              }}
            >
              {slide.body}
            </div>
          </div>

          {slide.agreement ? (
            <>
              <button
                className="btn-press"
                onClick={handleAgree}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 14,
                  border: "none",
                  cursor: "pointer",
                  background: "linear-gradient(135deg,#10b981,#3b82f6)",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  boxShadow: "0 4px 24px rgba(16,185,129,.4)",
                  marginBottom: 10,
                }}
              >
                ✅ {t.agreeButton}
              </button>
              <button
                className="btn-press"
                onClick={handleBack}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,.15)",
                  background: "transparent",
                  color: "rgba(255,255,255,.5)",
                  fontSize: 12,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  marginBottom: 10,
                }}
              >
                ← {t.backButton}
              </button>
              <div style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,.3)" }}>
                {t.skipNote}
              </div>
            </>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn-press"
                onClick={handleBack}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,.15)",
                  background: "transparent",
                  color: "rgba(255,255,255,.6)",
                  fontSize: 13,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                ← {t.backButton}
              </button>
              <button
                className="btn-press"
                onClick={handleNext}
                style={{
                  flex: 2,
                  padding: "12px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg,#10b981,#3b82f6)",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                {t.nextButton} →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // 画面: 登録
  // ════════════════════════════════════════
  if (screen === "register") {
    return (
      <div style={{ ...WRAP, padding: "48px 24px", overflow: "hidden" }}>
        <style>{CSS}</style>
        <Stars />

        <div style={{ position: "relative", zIndex: 1 }} className="slidein">
          <button
            onClick={() => setScreen("onboarding")}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,.4)",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "inherit",
              marginBottom: 24,
              padding: 0,
            }}
          >
            ← {t.backButton}
          </button>

          <div
            style={{
              fontFamily: "'Zen Kaku Gothic New',sans-serif",
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            📧 {t.registerTitle}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,.4)",
              marginBottom: 28,
              lineHeight: 1.7,
            }}
          >
            {t.registerSubtitle}
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 6 }}>
              😊 {t.nicknameLabel}
            </div>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={t.nicknamePh}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,.12)",
                background: "rgba(255,255,255,.06)",
                color: "#e8f0fe",
                fontSize: 14,
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 6 }}>
              📧 {t.emailLabel}
            </div>
            <input
              type="email"
              inputMode="email"
              autoCapitalize="off"
              autoCorrect="off"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder={t.emailPh}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,.12)",
                background: "rgba(255,255,255,.06)",
                color: "#e8f0fe",
                fontSize: 14,
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            {emailInput && /[\uFF00-\uFFEF]/.test(emailInput) && (
              <div
                style={{
                  marginTop: 6,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "rgba(245,158,11,.15)",
                  border: "1px solid rgba(245,158,11,.35)",
                  fontSize: 11,
                  color: "#fbbf24",
                  lineHeight: 1.5,
                }}
              >
                💡 {lang === "ja"
                  ? "全角文字が混じっています。キーボード左下の🌐で英語に切替してください"
                  : "Full-width chars detected. Switch to English keyboard"}
              </div>
            )}
          </div>

          {registerError && (
            <div
              style={{
                background: "rgba(239,68,68,.18)",
                border: "1px solid rgba(239,68,68,.3)",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 12,
                color: "#fca5a5",
                marginBottom: 12,
                lineHeight: 1.6,
                whiteSpace: "pre-line",
              }}
            >
              ⚠️ {registerError}
            </div>
          )}

          <button
            className="btn-press"
            onClick={handleRegister}
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 12,
              border: "none",
              cursor: loading ? "wait" : "pointer",
              background: loading
                ? "rgba(255,255,255,.1)"
                : "linear-gradient(135deg,#f97316,#ec4899)",
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                {lang === "ja" ? "登録中..." : "Registering..."}
              </>
            ) : (
              <>{t.registerButton} 🌺</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // 画面: SIMガイド
  // ════════════════════════════════════════
  if (showSimGuide) {
    return (
      <div style={{ ...WRAP }}>
        <style>{CSS}</style>
        <Stars />
        <SimGuide onBack={() => setShowSimGuide(false)} lang={lang} />
      </div>
    );
  }

  // ════════════════════════════════════════
  // 画面: 便利リンク
  // ════════════════════════════════════════
  if (showUsefulLinks) {
    return (
      <div style={{ ...WRAP }}>
        <style>{CSS}</style>
        <Stars />
        <UsefulLinks onBack={() => setShowUsefulLinks(false)} lang={lang} />
      </div>
    );
  }

  // ════════════════════════════════════════
  // 画面: マレくんチャット
  // ════════════════════════════════════════
  if (showMalekun) {
    return (
      <div style={{ ...WRAP }}>
        <style>{CSS}</style>
        <Stars />
        <MalekunChat onBack={() => setShowMalekun(false)} lang={lang} currentUser={currentUser} />
      </div>
    );
  }

  // ════════════════════════════════════════
  // 画面: ホーム（投稿一覧）
  // ════════════════════════════════════════
  return (
    <div style={{ ...WRAP, paddingBottom: 100 }}>
      <style>{CSS}</style>
      <Stars />

      {/* ヘッダー */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(13,21,38,.92)",
          backdropFilter: "blur(20px)",
          padding: "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,.07)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg,#f97316,#ec4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            🌺
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'Zen Kaku Gothic New',sans-serif",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {t.title}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", display: "flex", alignItems: "center", gap: 5 }}>
              <span>{t.homeGreeting}, {currentUser?.name} さん</span>
              <span
                style={{
                  fontSize: 9,
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: currentUser?.verified ? "rgba(16,185,129,.2)" : "rgba(245,158,11,.2)",
                  color: currentUser?.verified ? "#34d399" : "#fbbf24",
                  fontWeight: 600,
                }}
              >
                {currentUser?.verified ? "🟢 本登録" : "🟡 仮登録"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 8,
              padding: "5px 10px",
              color: "rgba(255,255,255,.5)",
              fontSize: 10,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {t.logoutButton}
          </button>
        </div>
      </div>

      {/* 投稿成功トースト */}
      {postSuccess && (
        <div
          style={{
            position: "fixed",
            top: 80,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            background: "rgba(16,185,129,.92)",
            borderRadius: 10,
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 600,
            color: "#fff",
            animation: "fadeUp .3s ease",
          }}
        >
          ✅ {lang === "ja" ? "投稿しました！" : "Posted!"}
        </div>
      )}

      <div style={{ padding: "16px 14px", position: "relative", zIndex: 1 }} className="fadein">
        {/* 仮登録バナー - unverified user only */}
        {currentUser && !currentUser.verified && (
          <div
            style={{
              background: "linear-gradient(135deg,rgba(245,158,11,.18),rgba(251,191,36,.08))",
              border: "1px solid rgba(245,158,11,.4)",
              borderRadius: 14,
              padding: "13px 16px",
              marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", marginBottom: 6 }}>
              {t.unverifiedTitle}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,.75)",
                lineHeight: 1.7,
                whiteSpace: "pre-line",
                marginBottom: 10,
              }}
            >
              {t.unverifiedBody}
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: "rgba(245,158,11,.25)",
                border: "1px solid rgba(245,158,11,.5)",
                borderRadius: 8,
                padding: "6px 12px",
                color: "#fbbf24",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {t.unverifiedAction} →
            </button>
          </div>
        )}

        {/* ウェルカムカード */}
        <div
          style={{
            ...CARD,
            background:
              "linear-gradient(135deg,rgba(249,115,22,.13),rgba(236,72,153,.08))",
            border: "1px solid rgba(249,115,22,.2)",
            padding: "16px 18px",
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 18, marginBottom: 4 }}>🌙 {t.homeGreeting}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>
            {t.homeSubGreeting}
          </div>
        </div>

        {/* クイックアクセス - SIMガイド + 便利リンク + マレくん */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
          <button
            onClick={() => setShowSimGuide(true)}
            className="btn-press"
            style={{
              background: "linear-gradient(135deg,rgba(59,130,246,.15),rgba(139,92,246,.1))",
              border: "1px solid rgba(96,165,250,.3)",
              borderRadius: 14,
              padding: "12px 8px",
              cursor: "pointer",
              fontFamily: "inherit",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 20,
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(96,165,250,.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              📱
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>
              {lang === "ja" ? "SIMガイド" : "SIM"}
            </div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,.5)", lineHeight: 1.4 }}>
              {lang === "ja" ? "通信会社" : "Carriers"}
            </div>
          </button>

          <button
            onClick={() => setShowUsefulLinks(true)}
            className="btn-press"
            style={{
              background: "linear-gradient(135deg,rgba(16,185,129,.15),rgba(59,130,246,.08))",
              border: "1px solid rgba(16,185,129,.3)",
              borderRadius: 14,
              padding: "12px 8px",
              cursor: "pointer",
              fontFamily: "inherit",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 20,
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(16,185,129,.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🚗
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>
              {lang === "ja" ? "便利リンク" : "Links"}
            </div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,.5)", lineHeight: 1.4 }}>
              {lang === "ja" ? "Grab・送金" : "Grab · etc"}
            </div>
          </button>

          <button
            onClick={() => setShowMalekun(true)}
            className="btn-press"
            style={{
              background: "linear-gradient(135deg,rgba(16,185,129,.18),rgba(34,197,94,.1))",
              border: "1px solid rgba(52,211,153,.4)",
              borderRadius: 14,
              padding: "12px 8px",
              cursor: "pointer",
              fontFamily: "inherit",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 20,
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg,#10b981,#3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🤖
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>
              {lang === "ja" ? "マレくん" : "Malekun"}
            </div>
            <div style={{ fontSize: 8, color: "#34d399", lineHeight: 1.4 }}>
              {lang === "ja" ? "● いつでも相談" : "● Always here"}
            </div>
          </button>
        </div>

        {/* カテゴリーフィルター */}
        <div
          style={{
            display: "flex",
            gap: 5,
            overflowX: "auto",
            paddingBottom: 8,
            marginBottom: 12,
          }}
        >
          <button
            onClick={() => setFilterTag(null)}
            style={{
              flexShrink: 0,
              whiteSpace: "nowrap",
              padding: "5px 14px",
              borderRadius: 16,
              border: "none",
              background: !filterTag
                ? "rgba(249,115,22,.25)"
                : "rgba(255,255,255,.06)",
              color: !filterTag ? "#fb923c" : "rgba(255,255,255,.4)",
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "inherit",
            }}
          >
            {t.allTab}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setFilterTag(cat.label === filterTag ? null : cat.label)}
              style={{
                flexShrink: 0,
                whiteSpace: "nowrap",
                padding: "5px 14px",
                borderRadius: 16,
                border: "none",
                background:
                  filterTag === cat.label
                    ? `${cat.color}28`
                    : "rgba(255,255,255,.06)",
                color: filterTag === cat.label ? cat.color : "rgba(255,255,255,.4)",
                cursor: "pointer",
                fontSize: 11,
                fontFamily: "inherit",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 投稿一覧 */}
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 8 }}>
          💬 {t.timeline}
        </div>
        {filteredPosts.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "rgba(255,255,255,.4)",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>🌺</div>
            <div style={{ fontSize: 13 }}>
              {lang === "ja"
                ? "まだ投稿がありません\n最初の1人になりませんか？"
                : "No posts yet\nBe the first to post!"}
            </div>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              liked={!!liked[post.id]}
              onLike={toggleLike}
              onResolve={toggleResolved}
              onOpenPost={(id) => setSelectedPostId(id)}
            />
          ))
        )}
      </div>

      {/* 投稿ボタン (FAB) - 本登録ユーザーのみ */}
      <button
        className="btn-press"
        onClick={() => {
          if (currentUser?.verified) {
            setShowPostModal(true);
          } else {
            alert(t.cantPost);
          }
        }}
        title={currentUser?.verified ? "" : t.cantPost}
        style={{
          position: "fixed",
          bottom: 24,
          right: 20,
          zIndex: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: currentUser?.verified
            ? "linear-gradient(135deg,#f97316,#ec4899)"
            : "rgba(100,100,100,.5)",
          border: "none",
          cursor: currentUser?.verified ? "pointer" : "not-allowed",
          fontSize: 24,
          color: "white",
          boxShadow: currentUser?.verified
            ? "0 4px 22px rgba(249,115,22,.5)"
            : "0 4px 16px rgba(0,0,0,.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: currentUser?.verified ? 1 : 0.5,
        }}
      >
        {currentUser?.verified ? "✏️" : "🔒"}
      </button>

      {/* 投稿詳細・返信モーダル */}
      {selectedPost && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 35,
            background: "rgba(0,0,0,.85)",
            backdropFilter: "blur(4px)",
            display: "flex",
            flexDirection: "column",
            animation: "fadeIn .2s ease",
          }}
        >
          {/* 詳細ヘッダー */}
          <div
            style={{
              position: "sticky",
              top: 0,
              background: "rgba(13,21,38,.97)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255,255,255,.08)",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              zIndex: 5,
            }}
          >
            <button
              onClick={() => {
                setSelectedPostId(null);
                setReplyText("");
                setReplyWarning(null);
              }}
              style={{
                background: "rgba(255,255,255,.07)",
                border: "1px solid rgba(255,255,255,.12)",
                borderRadius: 8,
                width: 32,
                height: 32,
                color: "rgba(255,255,255,.7)",
                fontSize: 16,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ←
            </button>
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              💬 {lang === "ja" ? "返信スレッド" : "Replies"}
            </div>
          </div>

          {/* 詳細本体 - スクロール可能 */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 14px 100px",
              maxWidth: 430,
              margin: "0 auto",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* 元の投稿 */}
            <div
              style={{
                ...CARD,
                padding: "14px 16px",
                marginBottom: 16,
                border: `1px solid ${TAG_COLORS[selectedPost.tag] || "#f97316"}40`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg,${TAG_COLORS[selectedPost.tag]}80,${TAG_COLORS[selectedPost.tag]}28)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {selectedPost.user[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedPost.user}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>
                    {selectedPost.area} · {getAgeLabel(selectedPost)}
                  </div>
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    padding: "3px 10px",
                    borderRadius: 8,
                    background: `${TAG_COLORS[selectedPost.tag]}25`,
                    color: TAG_COLORS[selectedPost.tag],
                    fontSize: 10,
                  }}
                >
                  {selectedPost.tag}
                </div>
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,.9)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {selectedPost.content}
              </div>
              {PERMANENT_TAGS.includes(selectedPost.tag) && (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 10,
                    color: "rgba(96,165,250,.7)",
                    background: "rgba(59,130,246,.1)",
                    border: "1px solid rgba(59,130,246,.2)",
                    borderRadius: 6,
                    padding: "4px 8px",
                    display: "inline-block",
                  }}
                >
                  📚 {lang === "ja" ? "永久保存される情報です" : "Permanently saved info"}
                </div>
              )}
            </div>

            {/* 返信一覧 */}
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,.4)",
                marginBottom: 10,
                fontWeight: 500,
              }}
            >
              💬 {selectedPost.replies?.length || 0} {lang === "ja" ? "件の返信" : "replies"}
            </div>
            {(selectedPost.replies || []).map((reply) => (
              <div
                key={reply.id}
                style={{
                  ...CARD,
                  padding: "10px 14px",
                  marginBottom: 7,
                  marginLeft: 16,
                  background: "rgba(255,255,255,.03)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#60a5fa,#3b82f6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {reply.user[0]}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{reply.user}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,.35)" }}>
                    {getAgeLabel(reply)}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,.8)",
                    whiteSpace: "pre-wrap",
                    paddingLeft: 31,
                  }}
                >
                  {reply.content}
                </div>
              </div>
            ))}
          </div>

          {/* 返信入力欄 */}
          <div
            style={{
              position: "sticky",
              bottom: 0,
              background: "rgba(13,21,38,.97)",
              borderTop: "1px solid rgba(255,255,255,.08)",
              padding: "12px 14px 16px",
              maxWidth: 430,
              margin: "0 auto",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {!currentUser?.verified ? (
              <div
                style={{
                  background: "rgba(245,158,11,.12)",
                  border: "1px solid rgba(245,158,11,.3)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  fontSize: 12,
                  color: "#fbbf24",
                  textAlign: "center",
                  lineHeight: 1.7,
                  whiteSpace: "pre-line",
                }}
              >
                {t.cantReply}
              </div>
            ) : (
              <>
            {replyWarning && (
              <div
                style={{
                  background: replyWarning.includes("⚠️")
                    ? "rgba(239,68,68,.18)"
                    : "rgba(245,158,11,.15)",
                  border: replyWarning.includes("⚠️")
                    ? "1px solid rgba(239,68,68,.4)"
                    : "1px solid rgba(245,158,11,.35)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 11,
                  color: replyWarning.includes("⚠️") ? "#fca5a5" : "#fbbf24",
                  marginBottom: 8,
                  lineHeight: 1.5,
                  whiteSpace: "pre-line",
                }}
              >
                {replyWarning}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <textarea
                value={replyText}
                onChange={(e) => {
                  setReplyText(e.target.value);
                  setReplyWarning(null);
                }}
                placeholder={lang === "ja" ? "返信を入力..." : "Write a reply..."}
                rows={1}
                maxLength={200}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,.12)",
                  background: "rgba(255,255,255,.05)",
                  color: "#e8f0fe",
                  fontSize: 13,
                  fontFamily: "inherit",
                  resize: "none",
                  maxHeight: 80,
                  boxSizing: "border-box",
                }}
              />
              <button
                onClick={handleSubmitReply}
                disabled={!replyText.trim()}
                className="btn-press"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "none",
                  cursor: replyText.trim() ? "pointer" : "default",
                  background: replyText.trim()
                    ? "linear-gradient(135deg,#f97316,#ec4899)"
                    : "rgba(255,255,255,.1)",
                  color: replyText.trim() ? "white" : "rgba(255,255,255,.3)",
                  fontSize: 16,
                  fontFamily: "inherit",
                  flexShrink: 0,
                }}
              >
                ➤
              </button>
            </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 投稿モーダル */}
      {showPostModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 30,
            background: "rgba(0,0,0,.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "flex-end",
          }}
          onClick={() => {
            setShowPostModal(false);
            setPostWarning(null);
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 430,
              margin: "0 auto",
              background: "#161f3a",
              borderRadius: "18px 18px 0 0",
              padding: "20px 18px 32px",
              animation: "slideUp .3s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
              ✏️ {t.postModalTitle}
            </div>

            {/* 警告メッセージ */}
            {postWarning && (
              <div
                style={{
                  background: postWarning.includes("⚠️")
                    ? "rgba(239,68,68,.18)"
                    : "rgba(245,158,11,.15)",
                  border: postWarning.includes("⚠️")
                    ? "1px solid rgba(239,68,68,.4)"
                    : "1px solid rgba(245,158,11,.35)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 12,
                  color: postWarning.includes("⚠️") ? "#fca5a5" : "#fbbf24",
                  marginBottom: 12,
                  lineHeight: 1.6,
                  whiteSpace: "pre-line",
                  animation: "shake .3s ease",
                }}
              >
                {postWarning}
              </div>
            )}

            {/* 入力欄 */}
            <textarea
              value={postText}
              onChange={(e) => {
                setPostText(e.target.value);
                setPostWarning(null);
              }}
              placeholder={t.postPlaceholder}
              maxLength={300}
              style={{
                width: "100%",
                minHeight: 80,
                padding: "11px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,.12)",
                background: "rgba(255,255,255,.05)",
                color: "#e8f0fe",
                fontSize: 13,
                fontFamily: "inherit",
                resize: "none",
                boxSizing: "border-box",
                marginBottom: 4,
              }}
            />
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,.3)",
                textAlign: "right",
                marginBottom: 10,
              }}
            >
              {postText.length} / 300
            </div>

            {/* エリア選択 */}
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginBottom: 6 }}>
              📍 {t.selectArea}
            </div>
            <div
              style={{
                display: "flex",
                gap: 5,
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              {AREAS.map((a) => (
                <button
                  key={a.name}
                  onClick={() => setPostArea(a.name)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 14,
                    border: "none",
                    background:
                      postArea === a.name
                        ? "rgba(59,130,246,.3)"
                        : "rgba(255,255,255,.06)",
                    color: postArea === a.name ? "#93c5fd" : "rgba(255,255,255,.5)",
                    fontSize: 10,
                    fontFamily: "inherit",
                    cursor: "pointer",
                  }}
                >
                  {a.emoji} {a.name}
                </button>
              ))}
            </div>

            {/* タグ選択 */}
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginBottom: 6 }}>
              🏷️ {t.selectTag}
            </div>
            <div
              style={{
                display: "flex",
                gap: 5,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => setPostTag(cat.label)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 14,
                    border: "none",
                    background:
                      postTag === cat.label
                        ? `${cat.color}32`
                        : "rgba(255,255,255,.06)",
                    color:
                      postTag === cat.label ? cat.color : "rgba(255,255,255,.45)",
                    fontSize: 11,
                    fontFamily: "inherit",
                    cursor: "pointer",
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* 投稿ボタン */}
            <button
              className="btn-press"
              onClick={handleSubmitPost}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                border: "none",
                cursor: postText.trim() ? "pointer" : "default",
                background: postText.trim()
                  ? "linear-gradient(135deg,#f97316,#ec4899)"
                  : "rgba(255,255,255,.1)",
                color: postText.trim() ? "white" : "rgba(255,255,255,.3)",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "inherit",
              }}
            >
              {t.submitPost} 🌺
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
