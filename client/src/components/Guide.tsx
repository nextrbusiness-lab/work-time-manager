import { useLocation } from "wouter";
import { useMemo } from "react";

const STORAGE_KEY = 'wtm_v1';
const NEXTR_LANG_KEY = 'nextr.language';

function getLang(): string {
  // Language priority: nextr.language (shared) > this app's saved language > 'ja'
  try {
    const shared = localStorage.getItem(NEXTR_LANG_KEY);
    if (shared && translations[shared]) return shared;
  } catch {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d.lang && translations[d.lang]) return d.lang;
    }
  } catch {}
  return 'ja';
}

type GuideT = {
  back: string;
  title: string;
  subtitle: string;
  faq_title: string;
  cta: string;
  steps: { title: string; points: string[] }[];
  faqs: { q: string; a: string }[];
};

const translations: Record<string, GuideT> = {
  ja: {
    back: "← 戻る",
    title: "使い方ガイド",
    subtitle: "3分で分かる Work Time Manager の使い方",
    faq_title: "❓ よくある質問",
    cta: "さっそく使ってみる →",
    steps: [
      { title: "勤務先を登録する", points: ["「＋ 勤務先を追加」をタップ", "勤務先名を入力（例：コンビニA）", "時給を入力（例：1100円）", "交通費を入力（1日あたり）"] },
      { title: "カレンダーへ勤務を入力する", points: ["週間スケジュールで曜日ごとに入力", "開始時間・終了時間を入力", "休憩時間があれば入力", "中抜けがある場合は「＋」で追加"] },
      { title: "勤務時間を確認する", points: ["週間合計が自動計算される", "月間合計も自動で表示", "28時間制限のチェックが一目でわかる", "オーバーすると赤く警告表示"] },
      { title: "概算給与を確認する", points: ["勤務先ごとの予想給与を表示", "深夜手当（22時〜5時）も自動計算", "交通費も含めた合計を表示", "「▼ 詳細を見る」で内訳を確認"] },
      { title: "データを保存する", points: ["入力データは自動で保存される", "「データエクスポート」でJSONバックアップ", "「データインポート」で復元可能", "端末を変えてもデータを引き継げる"] },
      { title: "パスワードを設定する", points: ["初回起動時にパスワードを設定", "次回からパスワード入力でログイン", "ページ下部から変更も可能", "5回間違えると一時ロック"] },
    ],
    faqs: [
      { q: "データはどこに保存されますか？", a: "お使いのブラウザ内（端末内）に保存されます。サーバーには送信されません。" },
      { q: "パスワードを忘れたらどうすればいいですか？", a: "「全データを削除」ボタンで初期化できます。ただし、入力データも全て消えるため、事前にJSONバックアップを取ることをおすすめします。" },
      { q: "28時間を超えたらどうなりますか？", a: "警告が赤く表示されます。ツール上で制限されることはありませんが、留学生の方は在留資格に注意してください。" },
      { q: "深夜手当はどう計算されますか？", a: "22:00〜5:00の勤務時間に対して、時給の25%が自動で加算されます。" },
      { q: "複数の端末で使えますか？", a: "JSONエクスポート/インポート機能を使えば、別の端末にデータを移行できます。" },
      { q: "勤務先は何件まで登録できますか？", a: "制限はありません。掛け持ちの数だけ自由に追加できます。" },
    ],
  },
  ja_easy: {
    back: "← もどる",
    title: "つかいかた ガイド",
    subtitle: "3ぷん で わかる Work Time Manager の つかいかた",
    faq_title: "❓ よくある しつもん",
    cta: "さっそく つかってみる →",
    steps: [
      { title: "きんむさき を とうろくする", points: ["「＋ きんむさき を ついか」を タップ", "きんむさきめい を にゅうりょく（れい：コンビニA）", "じきゅう を にゅうりょく（れい：1100えん）", "こうつうひ を にゅうりょく（1にち あたり）"] },
      { title: "カレンダー へ きんむ を にゅうりょく", points: ["しゅうかん スケジュール で ようび ごと に にゅうりょく", "かいし じかん・しゅうりょう じかん を にゅうりょく", "きゅうけい じかん が あれば にゅうりょく", "なかぬけ が ある ばあい は「＋」で ついか"] },
      { title: "きんむ じかん を かくにん する", points: ["しゅうかん ごうけい が じどう けいさん される", "げっかん ごうけい も じどう で ひょうじ", "28じかん せいげん の チェック が ひとめ で わかる", "オーバー すると あかく けいこく ひょうじ"] },
      { title: "がいさん きゅうよ を かくにん する", points: ["きんむさき ごと の よそう きゅうよ を ひょうじ", "しんや てあて（22じ〜5じ）も じどう けいさん", "こうつうひ も ふくめた ごうけい を ひょうじ", "「▼ しょうさい を みる」で うちわけ を かくにん"] },
      { title: "データ を ほぞん する", points: ["にゅうりょく データ は じどう で ほぞん される", "「データ エクスポート」で JSON バックアップ", "「データ インポート」で ふくげん かのう", "たんまつ を かえても データ を ひきつげる"] },
      { title: "パスワード を せってい する", points: ["しょかい きどうじ に パスワード を せってい", "じかい から パスワード にゅうりょく で ログイン", "ページ かぶ から へんこう も かのう", "5かい まちがえると いちじ ロック"] },
    ],
    faqs: [
      { q: "データ は どこ に ほぞん されますか？", a: "おつかい の ブラウザない（たんまつない）に ほぞん されます。サーバー には そうしん されません。" },
      { q: "パスワード を わすれたら？", a: "「ぜんデータ を さくじょ」ボタン で しょきか できます。にゅうりょく データ も きえるので、じぜん に JSON バックアップ を とってください。" },
      { q: "28じかん を こえたら？", a: "けいこく が あかく ひょうじ されます。りゅうがくせい の かた は ざいりゅう しかく に ちゅうい してください。" },
      { q: "しんや てあて は どう けいさん されますか？", a: "22:00〜5:00 の きんむ じかん に たいして、じきゅう の 25% が じどう で かさん されます。" },
      { q: "ふくすう の たんまつ で つかえますか？", a: "JSON エクスポート／インポート きのう を つかえば、べつ の たんまつ に データ を いこう できます。" },
      { q: "きんむさき は なんけん まで とうろく できますか？", a: "せいげん は ありません。かけもち の かず だけ じゆう に ついか できます。" },
    ],
  },
  en: {
    back: "← Back",
    title: "User Guide",
    subtitle: "Learn how to use Work Time Manager in 3 minutes",
    faq_title: "❓ FAQ",
    cta: "Get Started →",
    steps: [
      { title: "Register Your Workplace", points: ["Tap '+ Add Workplace'", "Enter workplace name (e.g., Convenience Store A)", "Enter hourly wage (e.g., ¥1100)", "Enter transport cost (per day)"] },
      { title: "Enter Work Shifts", points: ["Enter shifts by day in the weekly schedule", "Input start time & end time", "Add break time if applicable", "Use '+' for split shifts"] },
      { title: "Check Work Hours", points: ["Weekly total is auto-calculated", "Monthly total is also displayed", "28-hour limit check at a glance", "Red warning when exceeded"] },
      { title: "Check Estimated Salary", points: ["View estimated salary per workplace", "Night premium (22:00-5:00) auto-calculated", "Transport costs included in total", "Tap '▼ Details' for breakdown"] },
      { title: "Save Your Data", points: ["Data is saved automatically", "Export to JSON for backup", "Import JSON to restore", "Transfer data between devices"] },
      { title: "Set Password", points: ["Set password on first launch", "Login with password next time", "Change password from page bottom", "Locked after 5 wrong attempts"] },
    ],
    faqs: [
      { q: "Where is my data stored?", a: "Data is stored in your browser (on your device). It is never sent to a server." },
      { q: "What if I forget my password?", a: "Use 'Delete All Data' to reset. All data will be lost, so export a JSON backup first." },
      { q: "What happens if I exceed 28 hours?", a: "A red warning is displayed. The tool won't restrict you, but international students should check visa regulations." },
      { q: "How is the night premium calculated?", a: "25% of hourly wage is added for work between 22:00-5:00." },
      { q: "Can I use it on multiple devices?", a: "Yes, use JSON export/import to transfer data between devices." },
      { q: "How many workplaces can I register?", a: "There's no limit. Add as many as you need." },
    ],
  },
  vi: {
    back: "← Quay lại",
    title: "Hướng dẫn sử dụng",
    subtitle: "Tìm hiểu cách sử dụng Work Time Manager trong 3 phút",
    faq_title: "❓ Câu hỏi thường gặp",
    cta: "Bắt đầu ngay →",
    steps: [
      { title: "Đăng ký nơi làm việc", points: ["Nhấn '+ Thêm nơi làm việc'", "Nhập tên nơi làm việc (VD: Cửa hàng A)", "Nhập lương theo giờ (VD: 1100 yên)", "Nhập chi phí đi lại (mỗi ngày)"] },
      { title: "Nhập ca làm việc", points: ["Nhập ca theo ngày trong lịch tuần", "Nhập giờ bắt đầu & kết thúc", "Thêm giờ nghỉ nếu có", "Dùng '+' cho ca chia đôi"] },
      { title: "Kiểm tra giờ làm", points: ["Tổng tuần được tính tự động", "Tổng tháng cũng hiển thị", "Kiểm tra giới hạn 28 giờ dễ dàng", "Cảnh báo đỏ khi vượt quá"] },
      { title: "Xem lương dự kiến", points: ["Xem lương dự kiến theo nơi làm", "Phụ cấp đêm (22h-5h) tự động tính", "Chi phí đi lại tính vào tổng", "Nhấn '▼ Chi tiết' để xem"] },
      { title: "Lưu dữ liệu", points: ["Dữ liệu được lưu tự động", "Xuất JSON để sao lưu", "Nhập JSON để khôi phục", "Chuyển dữ liệu giữa các thiết bị"] },
      { title: "Đặt mật khẩu", points: ["Đặt mật khẩu lần đầu khởi động", "Đăng nhập bằng mật khẩu lần sau", "Đổi mật khẩu ở cuối trang", "Khóa sau 5 lần sai"] },
    ],
    faqs: [
      { q: "Dữ liệu được lưu ở đâu?", a: "Dữ liệu được lưu trong trình duyệt (trên thiết bị). Không gửi lên máy chủ." },
      { q: "Quên mật khẩu thì sao?", a: "Dùng nút 'Xóa tất cả dữ liệu' để đặt lại. Hãy sao lưu JSON trước." },
      { q: "Vượt quá 28 giờ thì sao?", a: "Cảnh báo đỏ hiển thị. Du học sinh cần chú ý quy định visa." },
      { q: "Phụ cấp đêm tính thế nào?", a: "25% lương theo giờ được cộng thêm cho ca 22:00-5:00." },
      { q: "Dùng trên nhiều thiết bị được không?", a: "Được, dùng xuất/nhập JSON để chuyển dữ liệu." },
      { q: "Đăng ký được bao nhiêu nơi làm?", a: "Không giới hạn. Thêm bao nhiêu cũng được." },
    ],
  },
  ne: {
    back: "← फिर्ता",
    title: "प्रयोग गाइड",
    subtitle: "Work Time Manager को प्रयोग ३ मिनेटमा सिक्नुहोस्",
    faq_title: "❓ बारम्बार सोधिने प्रश्नहरू",
    cta: "सुरु गर्नुहोस् →",
    steps: [
      { title: "कार्यस्थल दर्ता गर्नुहोस्", points: ["'+ कार्यस्थल थप्नुहोस्' थिच्नुहोस्", "कार्यस्थलको नाम लेख्नुहोस्", "प्रति घण्टा तलब लेख्नुहोस्", "यातायात खर्च लेख्नुहोस् (प्रतिदिन)"] },
      { title: "काम समय प्रविष्ट गर्नुहोस्", points: ["साप्ताहिक तालिकामा दिनअनुसार प्रविष्ट गर्नुहोस्", "सुरु र अन्त्य समय लेख्नुहोस्", "विश्राम समय थप्नुहोस्", "बिचमा छुट्टी भए '+' थिच्नुहोस्"] },
      { title: "काम घण्टा जाँच गर्नुहोस्", points: ["साप्ताहिक जम्मा स्वचालित गणना", "मासिक जम्मा पनि देखिन्छ", "२८ घण्टा सीमा जाँच", "बढी भएमा रातो चेतावनी"] },
      { title: "अनुमानित तलब हेर्नुहोस्", points: ["कार्यस्थलअनुसार अनुमानित तलब", "रात्रि भत्ता (२२:००-५:००) स्वचालित", "यातायात खर्च समावेश", "'▼ विवरण' मा विवरण हेर्नुहोस्"] },
      { title: "डाटा बचत गर्नुहोस्", points: ["डाटा स्वचालित बचत हुन्छ", "JSON मा निर्यात गर्नुहोस्", "JSON बाट पुनर्स्थापना गर्नुहोस्", "उपकरणहरू बीच डाटा सार्नुहोस्"] },
      { title: "पासवर्ड सेट गर्नुहोस्", points: ["पहिलो पटक पासवर्ड सेट गर्नुहोस्", "अर्को पटक पासवर्डले लगइन", "पृष्ठको तलबाट परिवर्तन गर्नुहोस्", "५ पटक गलत भएमा लक"] },
    ],
    faqs: [
      { q: "डाटा कहाँ बचत हुन्छ?", a: "तपाईंको ब्राउजरमा (उपकरणमा) बचत हुन्छ। सर्भरमा पठाइँदैन।" },
      { q: "पासवर्ड बिर्सेमा?", a: "'सबै डाटा मेटाउनुहोस्' बटन प्रयोग गर्नुहोस्। पहिले JSON ब्याकअप लिनुहोस्।" },
      { q: "२८ घण्टा नाघेमा?", a: "रातो चेतावनी देखिन्छ। विदेशी विद्यार्थीले भिसा नियम जाँच गर्नुहोस्।" },
      { q: "रात्रि भत्ता कसरी गणना हुन्छ?", a: "२२:००-५:०० को कामको लागि तलबको २५% थपिन्छ।" },
      { q: "धेरै उपकरणमा प्रयोग गर्न सकिन्छ?", a: "JSON निर्यात/आयात प्रयोग गरेर डाटा सार्न सकिन्छ।" },
      { q: "कति कार्यस्थल दर्ता गर्न सकिन्छ?", a: "सीमा छैन। जतिसुकै थप्न सकिन्छ।" },
    ],
  },
  zh: {
    back: "← 返回",
    title: "使用指南",
    subtitle: "3分钟学会使用 Work Time Manager",
    faq_title: "❓ 常见问题",
    cta: "开始使用 →",
    steps: [
      { title: "注册工作单位", points: ["点击「+ 添加工作单位」", "输入单位名称（例：便利店A）", "输入时薪（例：1100日元）", "输入交通费（每天）"] },
      { title: "输入排班信息", points: ["在周计划中按天输入", "输入开始和结束时间", "有休息时间则填写", "中途休息用「+」添加"] },
      { title: "查看工时", points: ["周合计自动计算", "月合计也自动显示", "28小时限制一目了然", "超时红色警告"] },
      { title: "查看预估工资", points: ["按单位显示预估工资", "深夜补贴（22-5点）自动计算", "交通费包含在总额中", "点击「▼ 详情」查看明细"] },
      { title: "保存数据", points: ["数据自动保存", "「导出数据」进行JSON备份", "「导入数据」恢复", "可在设备间转移数据"] },
      { title: "设置密码", points: ["首次启动设置密码", "下次用密码登录", "页面底部可修改", "错误5次临时锁定"] },
    ],
    faqs: [
      { q: "数据保存在哪里？", a: "保存在您的浏览器中（设备内）。不会发送到服务器。" },
      { q: "忘记密码怎么办？", a: "使用「删除所有数据」按钮重置。请先导出JSON备份。" },
      { q: "超过28小时会怎样？", a: "显示红色警告。留学生请注意签证规定。" },
      { q: "深夜补贴怎么计算？", a: "22:00-5:00的工作时间自动加算时薪的25%。" },
      { q: "能在多台设备上使用吗？", a: "可以，使用JSON导出/导入功能转移数据。" },
      { q: "最多能注册几个工作单位？", a: "没有限制，可以自由添加。" },
    ],
  },
  ko: {
    back: "← 뒤로",
    title: "사용 가이드",
    subtitle: "3분 만에 배우는 Work Time Manager 사용법",
    faq_title: "❓ 자주 묻는 질문",
    cta: "시작하기 →",
    steps: [
      { title: "근무지 등록하기", points: ["'+ 근무지 추가' 탭하기", "근무지명 입력 (예: 편의점A)", "시급 입력 (예: 1100엔)", "교통비 입력 (1일당)"] },
      { title: "근무 입력하기", points: ["주간 스케줄에서 요일별 입력", "시작·종료 시간 입력", "휴식 시간 입력", "중간 휴식은 '+'로 추가"] },
      { title: "근무시간 확인", points: ["주간 합계 자동 계산", "월간 합계도 자동 표시", "28시간 제한 한눈에 확인", "초과 시 빨간 경고 표시"] },
      { title: "예상 급여 확인", points: ["근무지별 예상 급여 표시", "야간수당 (22시~5시) 자동 계산", "교통비 포함 합계 표시", "'▼ 상세보기'로 내역 확인"] },
      { title: "데이터 저장", points: ["입력 데이터 자동 저장", "'데이터 내보내기'로 JSON 백업", "'데이터 가져오기'로 복원", "기기 간 데이터 이동 가능"] },
      { title: "비밀번호 설정", points: ["최초 실행 시 비밀번호 설정", "다음부터 비밀번호로 로그인", "페이지 하단에서 변경 가능", "5회 오류 시 일시 잠금"] },
    ],
    faqs: [
      { q: "데이터는 어디에 저장되나요?", a: "브라우저 내(기기 내)에 저장됩니다. 서버로 전송되지 않습니다." },
      { q: "비밀번호를 잊으면?", a: "'전체 데이터 삭제' 버튼으로 초기화할 수 있습니다. 먼저 JSON 백업을 해두세요." },
      { q: "28시간을 초과하면?", a: "빨간 경고가 표시됩니다. 유학생은 비자 규정을 확인하세요." },
      { q: "야간수당은 어떻게 계산되나요?", a: "22:00~5:00 근무시간에 시급의 25%가 자동 가산됩니다." },
      { q: "여러 기기에서 사용 가능한가요?", a: "JSON 내보내기/가져오기로 데이터를 이동할 수 있습니다." },
      { q: "근무지는 몇 개까지 등록 가능한가요?", a: "제한 없습니다. 원하는 만큼 추가할 수 있습니다." },
    ],
  },
  tl: {
    back: "← Bumalik",
    title: "Gabay sa Paggamit",
    subtitle: "Matuto gamitin ang Work Time Manager sa 3 minuto",
    faq_title: "❓ Mga Madalas Itanong",
    cta: "Magsimula →",
    steps: [
      { title: "Irehistro ang Trabaho", points: ["I-tap ang '+ Magdagdag ng Trabaho'", "Ilagay ang pangalan ng trabaho", "Ilagay ang sahod bawat oras", "Ilagay ang pamasahe (bawat araw)"] },
      { title: "Ilagay ang Shift", points: ["Ilagay ayon sa araw sa weekly schedule", "Ilagay ang oras ng simula at tapos", "Ilagay ang break time kung meron", "Gamitin ang '+' para sa split shift"] },
      { title: "Tingnan ang Oras ng Trabaho", points: ["Weekly total ay auto-calculate", "Monthly total din ay ipinapakita", "28-hour limit check sa isang tingin", "Pula ang warning kapag lumampas"] },
      { title: "Tingnan ang Estimated na Sahod", points: ["Estimated sahod bawat trabaho", "Night premium (22:00-5:00) auto-calculate", "Kasama ang pamasahe sa total", "I-tap ang '▼ Details' para sa breakdown"] },
      { title: "I-save ang Data", points: ["Auto-save ang data", "I-export sa JSON para sa backup", "I-import ang JSON para i-restore", "Ilipat ang data sa ibang device"] },
      { title: "Mag-set ng Password", points: ["Mag-set ng password sa unang pagbukas", "Mag-login gamit ang password sa susunod", "Palitan ang password sa ibaba ng page", "Naka-lock pagkatapos ng 5 maling attempt"] },
    ],
    faqs: [
      { q: "Saan naka-save ang data?", a: "Naka-save sa browser mo (sa device). Hindi ipinapadala sa server." },
      { q: "Paano kung nakalimutan ang password?", a: "Gamitin ang 'Delete All Data' button para i-reset. Mag-backup muna ng JSON." },
      { q: "Ano ang mangyayari kapag lumampas sa 28 oras?", a: "Magpapakita ng pula na warning. Mag-ingat sa visa regulations ang mga international student." },
      { q: "Paano kino-compute ang night premium?", a: "25% ng hourly wage ang idinadagdag para sa trabaho mula 22:00-5:00." },
      { q: "Pwede bang gamitin sa maraming device?", a: "Oo, gamitin ang JSON export/import para ilipat ang data." },
      { q: "Ilan ang pwedeng i-register na trabaho?", a: "Walang limit. Magdagdag ng kahit ilan." },
    ],
  },
  id: {
    back: "← Kembali",
    title: "Panduan Penggunaan",
    subtitle: "Pelajari cara menggunakan Work Time Manager dalam 3 menit",
    faq_title: "❓ Pertanyaan Umum",
    cta: "Mulai Sekarang →",
    steps: [
      { title: "Daftarkan Tempat Kerja", points: ["Ketuk '+ Tambah Tempat Kerja'", "Masukkan nama tempat kerja", "Masukkan upah per jam", "Masukkan biaya transportasi (per hari)"] },
      { title: "Masukkan Jadwal Kerja", points: ["Masukkan per hari di jadwal mingguan", "Masukkan waktu mulai & selesai", "Tambahkan waktu istirahat jika ada", "Gunakan '+' untuk shift terpisah"] },
      { title: "Cek Jam Kerja", points: ["Total mingguan dihitung otomatis", "Total bulanan juga ditampilkan", "Cek batas 28 jam dengan mudah", "Peringatan merah jika melebihi"] },
      { title: "Cek Perkiraan Gaji", points: ["Perkiraan gaji per tempat kerja", "Tunjangan malam (22:00-5:00) otomatis", "Biaya transportasi termasuk total", "Ketuk '▼ Detail' untuk rincian"] },
      { title: "Simpan Data", points: ["Data disimpan otomatis", "Ekspor ke JSON untuk backup", "Impor JSON untuk memulihkan", "Transfer data antar perangkat"] },
      { title: "Atur Password", points: ["Atur password saat pertama kali", "Login dengan password selanjutnya", "Ubah password di bagian bawah", "Terkunci setelah 5 kali salah"] },
    ],
    faqs: [
      { q: "Data disimpan di mana?", a: "Disimpan di browser Anda (di perangkat). Tidak dikirim ke server." },
      { q: "Bagaimana jika lupa password?", a: "Gunakan tombol 'Hapus Semua Data' untuk reset. Backup JSON terlebih dahulu." },
      { q: "Apa yang terjadi jika melebihi 28 jam?", a: "Peringatan merah ditampilkan. Mahasiswa asing perlu memperhatikan aturan visa." },
      { q: "Bagaimana tunjangan malam dihitung?", a: "25% dari upah per jam ditambahkan untuk kerja antara 22:00-5:00." },
      { q: "Bisa digunakan di banyak perangkat?", a: "Ya, gunakan ekspor/impor JSON untuk transfer data." },
      { q: "Berapa banyak tempat kerja yang bisa didaftarkan?", a: "Tidak ada batasan. Tambahkan sebanyak yang diperlukan." },
    ],
  },
  my: {
    back: "← နောက်သို့",
    title: "အသုံးပြုနည်း",
    subtitle: "Work Time Manager ကို ၃ မိနစ်အတွင်း သင်ယူပါ",
    faq_title: "❓ မေးလေ့ရှိသောမေးခွန်းများ",
    cta: "စတင်အသုံးပြုမည် →",
    steps: [
      { title: "အလုပ်နေရာ မှတ်ပုံတင်ပါ", points: ["'+ အလုပ်နေရာ ထည့်ပါ' နှိပ်ပါ", "အလုပ်နေရာအမည် ထည့်ပါ", "နာရီလုပ်ခ ထည့်ပါ", "သယ်ယူစရိတ် ထည့်ပါ (တစ်ရက်)"] },
      { title: "အလုပ်ချိန် ထည့်ပါ", points: ["အပတ်စဉ်ဇယားတွင် ရက်အလိုက် ထည့်ပါ", "စတင်/ပြီးဆုံးချိန် ထည့်ပါ", "အနားချိန် ထည့်ပါ", "ကြားခြား '+' နှင့် ထည့်ပါ"] },
      { title: "အလုပ်ချိန် စစ်ဆေးပါ", points: ["အပတ်စုစုပေါင်း အလိုအလျောက်", "လစုစုပေါင်း လည်း ပြသည်", "၂၈ နာရီ ကန့်သတ်ချက် စစ်ဆေးပါ", "ကျော်လွန်ပါက အနီရောင် သတိပေး"] },
      { title: "ခန့်မှန်းလစာ ကြည့်ပါ", points: ["အလုပ်နေရာအလိုက် ခန့်မှန်းလစာ", "ညဘက်ထပ်ဆောင်း (22-5) အလိုအလျောက်", "သယ်ယူစရိတ် စုစုပေါင်းတွင် ပါဝင်", "'▼ အသေးစိတ်' နှိပ်ပါ"] },
      { title: "ဒေတာ သိမ်းပါ", points: ["ဒေတာ အလိုအလျောက် သိမ်းသည်", "JSON သို့ တင်ပို့ပါ", "JSON မှ ပြန်လည်ရယူပါ", "စက်များကြား ဒေတာ ရွှေ့ပါ"] },
      { title: "စကားဝှက် သတ်မှတ်ပါ", points: ["ပထမဆုံးအကြိမ် စကားဝှက် သတ်မှတ်ပါ", "နောက်တစ်ကြိမ် စကားဝှက်ဖြင့် ဝင်ပါ", "စာမျက်နှာ အောက်ခြေမှ ပြောင်းပါ", "၅ ကြိမ် မှားပါက ခေတ္တပိတ်"] },
    ],
    faqs: [
      { q: "ဒေတာ ဘယ်မှာ သိမ်းထားသလဲ?", a: "သင့်ဘရောက်ဇာထဲ (စက်ထဲ) တွင် သိမ်းထားသည်။ ဆာဗာသို့ မပို့ပါ။" },
      { q: "စကားဝှက် မေ့သွားရင်?", a: "'ဒေတာအားလုံး ဖျက်ပါ' ခလုတ်ကို သုံးပါ။ JSON အရန်ကူးယူပါ။" },
      { q: "၂၈ နာရီ ကျော်ရင်?", a: "အနီရောင် သတိပေးချက် ပြသည်။ နိုင်ငံခြားကျောင်းသားများ ဗီဇာစည်းမျဉ်း စစ်ဆေးပါ။" },
      { q: "ညဘက်ထပ်ဆောင်း ဘယ်လို တွက်သလဲ?", a: "22:00-5:00 အလုပ်ချိန်အတွက် နာရီလုပ်ခ၏ 25% ထပ်ပေါင်းသည်။" },
      { q: "စက်အများအပြား သုံးနိုင်သလား?", a: "ရပါတယ်။ JSON တင်ပို့/သွင်းယူ သုံးပါ။" },
      { q: "အလုပ်နေရာ ဘယ်နှစ်ခု မှတ်ပုံတင်နိုင်သလဲ?", a: "ကန့်သတ်ချက် မရှိပါ။ လိုသလောက် ထည့်နိုင်သည်။" },
    ],
  },
  th: {
    back: "← กลับ",
    title: "คู่มือการใช้งาน",
    subtitle: "เรียนรู้การใช้ Work Time Manager ใน 3 นาที",
    faq_title: "❓ คำถามที่พบบ่อย",
    cta: "เริ่มใช้งาน →",
    steps: [
      { title: "ลงทะเบียนที่ทำงาน", points: ["แตะ '+ เพิ่มที่ทำงาน'", "ใส่ชื่อที่ทำงาน (เช่น ร้านสะดวกซื้อ A)", "ใส่ค่าจ้างรายชั่วโมง (เช่น 1100 เยน)", "ใส่ค่าเดินทาง (ต่อวัน)"] },
      { title: "ใส่กะทำงาน", points: ["ใส่ตามวันในตารางสัปดาห์", "ใส่เวลาเริ่ม & สิ้นสุด", "เพิ่มเวลาพักถ้ามี", "ใช้ '+' สำหรับกะแยก"] },
      { title: "ตรวจสอบชั่วโมงทำงาน", points: ["รวมสัปดาห์คำนวณอัตโนมัติ", "รวมเดือนก็แสดงด้วย", "ตรวจสอบขีดจำกัด 28 ชม. ได้ง่าย", "แจ้งเตือนสีแดงเมื่อเกิน"] },
      { title: "ดูเงินเดือนโดยประมาณ", points: ["แสดงเงินเดือนโดยประมาณต่อที่ทำงาน", "ค่ากะดึก (22:00-5:00) คำนวณอัตโนมัติ", "ค่าเดินทางรวมในยอดรวม", "แตะ '▼ รายละเอียด' ดูรายการ"] },
      { title: "บันทึกข้อมูล", points: ["ข้อมูลบันทึกอัตโนมัติ", "ส่งออก JSON สำหรับสำรอง", "นำเข้า JSON เพื่อกู้คืน", "ย้ายข้อมูลระหว่างอุปกรณ์ได้"] },
      { title: "ตั้งรหัสผ่าน", points: ["ตั้งรหัสผ่านครั้งแรก", "ล็อกอินด้วยรหัสผ่านครั้งต่อไป", "เปลี่ยนรหัสผ่านที่ด้านล่าง", "ล็อกหลังผิด 5 ครั้ง"] },
    ],
    faqs: [
      { q: "ข้อมูลเก็บไว้ที่ไหน?", a: "เก็บในเบราว์เซอร์ (ในอุปกรณ์) ไม่ส่งไปเซิร์ฟเวอร์" },
      { q: "ลืมรหัสผ่านทำอย่างไร?", a: "ใช้ปุ่ม 'ลบข้อมูลทั้งหมด' เพื่อรีเซ็ต สำรอง JSON ก่อน" },
      { q: "เกิน 28 ชม. จะเป็นอย่างไร?", a: "แสดงคำเตือนสีแดง นักศึกษาต่างชาติควรตรวจสอบกฎวีซ่า" },
      { q: "ค่ากะดึกคำนวณอย่างไร?", a: "เพิ่ม 25% ของค่าจ้างรายชั่วโมงสำหรับงาน 22:00-5:00" },
      { q: "ใช้หลายอุปกรณ์ได้ไหม?", a: "ได้ ใช้ส่งออก/นำเข้า JSON เพื่อย้ายข้อมูล" },
      { q: "ลงทะเบียนที่ทำงานได้กี่แห่ง?", a: "ไม่จำกัด เพิ่มได้ตามต้องการ" },
    ],
  },
  si: {
    back: "← ආපසු",
    title: "භාවිත මාර්ගෝපදේශය",
    subtitle: "Work Time Manager භාවිතය මිනිත්තු 3කින් ඉගෙන ගන්න",
    faq_title: "❓ නිතර අසන ප්‍රශ්න",
    cta: "ආරම්භ කරන්න →",
    steps: [
      { title: "සේවා ස්ථානය ලියාපදිංචි කරන්න", points: ["'+ සේවා ස්ථානය එකතු කරන්න' ඔබන්න", "සේවා ස්ථාන නම ඇතුළත් කරන්න", "පැය වේතනය ඇතුළත් කරන්න", "ප්‍රවාහන වියදම ඇතුළත් කරන්න"] },
      { title: "වැඩ කාලය ඇතුළත් කරන්න", points: ["සතිපතා කාලසටහනේ දිනය අනුව ඇතුළත් කරන්න", "ආරම්භ/අවසන් වේලාව ඇතුළත් කරන්න", "විවේක කාලය එකතු කරන්න", "බෙදුණු මුර සඳහා '+' භාවිතා කරන්න"] },
      { title: "වැඩ පැය පරීක්ෂා කරන්න", points: ["සතිපතා එකතුව ස්වයංක්‍රීයව", "මාසික එකතුව ද පෙන්වයි", "පැය 28 සීමාව පරීක්ෂා කරන්න", "ඉක්මවූ විට රතු අනතුරු ඇඟවීම"] },
      { title: "ඇස්තමේන්තු වැටුප බලන්න", points: ["සේවා ස්ථානය අනුව ඇස්තමේන්තු වැටුප", "රාත්‍රී දීමනාව (22-5) ස්වයංක්‍රීය", "ප්‍රවාහන වියදම එකතුවේ ඇතුළත්", "'▼ විස්තර' ඔබන්න"] },
      { title: "දත්ත සුරකින්න", points: ["දත්ත ස්වයංක්‍රීයව සුරැකේ", "JSON වෙත අපනයනය කරන්න", "JSON වලින් ප්‍රතිසාධනය කරන්න", "උපාංග අතර දත්ත මාරු කරන්න"] },
      { title: "මුරපදය සකසන්න", points: ["පළමු වරට මුරපදය සකසන්න", "ඊළඟ වරට මුරපදයෙන් පිවිසෙන්න", "පිටුවේ පහළින් වෙනස් කරන්න", "වරක් 5 වැරදුණොත් අගුළු"] },
    ],
    faqs: [
      { q: "දත්ත කොහේ සුරැකෙනවද?", a: "ඔබේ බ්‍රවුසරයේ (උපාංගයේ) සුරැකේ. සර්වරයට යවන්නේ නැත." },
      { q: "මුරපදය අමතක වුණොත්?", a: "'සියලු දත්ත මකන්න' බොත්තම භාවිතා කරන්න. JSON උපස්ථ ගන්න." },
      { q: "පැය 28 ඉක්මවුවොත්?", a: "රතු අනතුරු ඇඟවීමක් පෙන්වයි. විදේශ සිසුන් වීසා නීති පරීක්ෂා කරන්න." },
      { q: "රාත්‍රී දීමනාව ගණනය කරන්නේ කෙසේද?", a: "22:00-5:00 වැඩ කාලයට පැය වේතනයෙන් 25% එකතු වේ." },
      { q: "උපාංග කිහිපයක භාවිතා කළ හැකිද?", a: "ඔව්, JSON අපනයනය/ආයාතය භාවිතා කරන්න." },
      { q: "සේවා ස්ථාන කීයක් ලියාපදිංචි කළ හැකිද?", a: "සීමාවක් නැත. අවශ්‍ය තරම් එකතු කරන්න." },
    ],
  },
  bn: {
    back: "← ফিরে যান",
    title: "ব্যবহার নির্দেশিকা",
    subtitle: "৩ মিনিটে Work Time Manager ব্যবহার শিখুন",
    faq_title: "❓ সচরাচর জিজ্ঞাসা",
    cta: "শুরু করুন →",
    steps: [
      { title: "কর্মস্থল নিবন্ধন করুন", points: ["'+ কর্মস্থল যোগ করুন' ট্যাপ করুন", "কর্মস্থলের নাম লিখুন", "ঘণ্টা প্রতি বেতন লিখুন", "যাতায়াত খরচ লিখুন (প্রতিদিন)"] },
      { title: "শিফট প্রবেশ করান", points: ["সাপ্তাহিক সময়সূচিতে দিন অনুযায়ী প্রবেশ করান", "শুরু ও শেষ সময় লিখুন", "বিরতি সময় যোগ করুন", "বিভক্ত শিফটের জন্য '+' ব্যবহার করুন"] },
      { title: "কাজের সময় পরীক্ষা করুন", points: ["সাপ্তাহিক মোট স্বয়ংক্রিয়ভাবে গণনা", "মাসিক মোটও দেখানো হয়", "২৮ ঘণ্টা সীমা এক নজরে", "অতিক্রম করলে লাল সতর্কতা"] },
      { title: "আনুমানিক বেতন দেখুন", points: ["কর্মস্থল অনুযায়ী আনুমানিক বেতন", "রাতের ভাতা (২২-৫টা) স্বয়ংক্রিয়", "যাতায়াত খরচ মোটে অন্তর্ভুক্ত", "'▼ বিস্তারিত' ট্যাপ করুন"] },
      { title: "ডেটা সংরক্ষণ করুন", points: ["ডেটা স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়", "JSON-এ রপ্তানি করুন ব্যাকআপের জন্য", "JSON আমদানি করে পুনরুদ্ধার করুন", "ডিভাইসের মধ্যে ডেটা স্থানান্তর করুন"] },
      { title: "পাসওয়ার্ড সেট করুন", points: ["প্রথমবার পাসওয়ার্ড সেট করুন", "পরবর্তীতে পাসওয়ার্ড দিয়ে লগইন", "পৃষ্ঠার নিচ থেকে পরিবর্তন করুন", "৫ বার ভুল হলে সাময়িক লক"] },
    ],
    faqs: [
      { q: "ডেটা কোথায় সংরক্ষিত হয়?", a: "আপনার ব্রাউজারে (ডিভাইসে) সংরক্ষিত হয়। সার্ভারে পাঠানো হয় না।" },
      { q: "পাসওয়ার্ড ভুলে গেলে?", a: "'সমস্ত ডেটা মুছুন' বোতাম ব্যবহার করুন। আগে JSON ব্যাকআপ নিন।" },
      { q: "২৮ ঘণ্টা অতিক্রম করলে?", a: "লাল সতর্কতা দেখায়। আন্তর্জাতিক ছাত্ররা ভিসা নিয়ম পরীক্ষা করুন।" },
      { q: "রাতের ভাতা কীভাবে গণনা হয়?", a: "২২:০০-৫:০০ কাজের জন্য ঘণ্টা বেতনের ২৫% যোগ হয়।" },
      { q: "একাধিক ডিভাইসে ব্যবহার করা যায়?", a: "হ্যাঁ, JSON রপ্তানি/আমদানি ব্যবহার করুন।" },
      { q: "কতটি কর্মস্থল নিবন্ধন করা যায়?", a: "কোনো সীমা নেই। যত খুশি যোগ করুন।" },
    ],
  },
  hi: {
    back: "← वापस",
    title: "उपयोग गाइड",
    subtitle: "3 मिनट में Work Time Manager का उपयोग सीखें",
    faq_title: "❓ अक्सर पूछे जाने वाले प्रश्न",
    cta: "शुरू करें →",
    steps: [
      { title: "कार्यस्थल पंजीकृत करें", points: ["'+ कार्यस्थल जोड़ें' टैप करें", "कार्यस्थल का नाम दर्ज करें", "प्रति घंटा वेतन दर्ज करें", "परिवहन लागत दर्ज करें (प्रतिदिन)"] },
      { title: "शिफ्ट दर्ज करें", points: ["साप्ताहिक शेड्यूल में दिन के अनुसार दर्ज करें", "शुरू और समाप्ति समय दर्ज करें", "ब्रेक टाइम जोड़ें", "स्प्लिट शिफ्ट के लिए '+' उपयोग करें"] },
      { title: "कार्य घंटे जांचें", points: ["साप्ताहिक कुल स्वचालित गणना", "मासिक कुल भी दिखाया जाता है", "28 घंटे की सीमा एक नज़र में", "अधिक होने पर लाल चेतावनी"] },
      { title: "अनुमानित वेतन देखें", points: ["कार्यस्थल के अनुसार अनुमानित वेतन", "रात्रि भत्ता (22-5) स्वचालित", "परिवहन लागत कुल में शामिल", "'▼ विवरण' टैप करें"] },
      { title: "डेटा सहेजें", points: ["डेटा स्वचालित रूप से सहेजा जाता है", "JSON में निर्यात करें बैकअप के लिए", "JSON आयात करके पुनर्स्थापित करें", "उपकरणों के बीच डेटा स्थानांतरित करें"] },
      { title: "पासवर्ड सेट करें", points: ["पहली बार पासवर्ड सेट करें", "अगली बार पासवर्ड से लॉगिन", "पेज के नीचे से बदलें", "5 बार गलत होने पर अस्थायी लॉक"] },
    ],
    faqs: [
      { q: "डेटा कहाँ सहेजा जाता है?", a: "आपके ब्राउज़र में (उपकरण में) सहेजा जाता है। सर्वर पर नहीं भेजा जाता।" },
      { q: "पासवर्ड भूल गए तो?", a: "'सभी डेटा हटाएं' बटन से रीसेट करें। पहले JSON बैकअप लें।" },
      { q: "28 घंटे से अधिक होने पर?", a: "लाल चेतावनी दिखाई देती है। अंतर्राष्ट्रीय छात्र वीज़ा नियम जांचें।" },
      { q: "रात्रि भत्ता कैसे गणना होता है?", a: "22:00-5:00 के काम के लिए प्रति घंटा वेतन का 25% जोड़ा जाता है।" },
      { q: "कई उपकरणों पर उपयोग कर सकते हैं?", a: "हाँ, JSON निर्यात/आयात उपयोग करें।" },
      { q: "कितने कार्यस्थल पंजीकृत कर सकते हैं?", a: "कोई सीमा नहीं। जितने चाहें जोड़ें।" },
    ],
  },
  es: {
    back: "← Volver",
    title: "Guía de Uso",
    subtitle: "Aprende a usar Work Time Manager en 3 minutos",
    faq_title: "❓ Preguntas Frecuentes",
    cta: "Empezar →",
    steps: [
      { title: "Registrar lugar de trabajo", points: ["Toca '+ Agregar lugar de trabajo'", "Ingresa el nombre del lugar", "Ingresa el salario por hora", "Ingresa el costo de transporte (por día)"] },
      { title: "Ingresar turnos", points: ["Ingresa por día en el horario semanal", "Ingresa hora de inicio y fin", "Agrega tiempo de descanso si aplica", "Usa '+' para turnos divididos"] },
      { title: "Verificar horas de trabajo", points: ["Total semanal calculado automáticamente", "Total mensual también se muestra", "Verificación del límite de 28 horas", "Advertencia roja si se excede"] },
      { title: "Ver salario estimado", points: ["Salario estimado por lugar de trabajo", "Prima nocturna (22:00-5:00) automática", "Transporte incluido en el total", "Toca '▼ Detalles' para desglose"] },
      { title: "Guardar datos", points: ["Los datos se guardan automáticamente", "Exportar a JSON para respaldo", "Importar JSON para restaurar", "Transferir datos entre dispositivos"] },
      { title: "Establecer contraseña", points: ["Establecer contraseña la primera vez", "Iniciar sesión con contraseña después", "Cambiar contraseña desde abajo", "Bloqueo tras 5 intentos fallidos"] },
    ],
    faqs: [
      { q: "¿Dónde se guardan los datos?", a: "En tu navegador (en tu dispositivo). No se envían a ningún servidor." },
      { q: "¿Qué pasa si olvido la contraseña?", a: "Usa el botón 'Eliminar todos los datos' para reiniciar. Haz un respaldo JSON primero." },
      { q: "¿Qué pasa si excedo las 28 horas?", a: "Se muestra una advertencia roja. Los estudiantes internacionales deben verificar las regulaciones de visa." },
      { q: "¿Cómo se calcula la prima nocturna?", a: "Se agrega el 25% del salario por hora para trabajo entre 22:00-5:00." },
      { q: "¿Se puede usar en varios dispositivos?", a: "Sí, usa exportar/importar JSON para transferir datos." },
      { q: "¿Cuántos lugares de trabajo puedo registrar?", a: "Sin límite. Agrega los que necesites." },
    ],
  },
  pt: {
    back: "← Voltar",
    title: "Guia de Uso",
    subtitle: "Aprenda a usar o Work Time Manager em 3 minutos",
    faq_title: "❓ Perguntas Frequentes",
    cta: "Começar →",
    steps: [
      { title: "Registrar local de trabalho", points: ["Toque em '+ Adicionar local de trabalho'", "Digite o nome do local", "Digite o salário por hora", "Digite o custo de transporte (por dia)"] },
      { title: "Inserir turnos", points: ["Insira por dia no horário semanal", "Digite hora de início e fim", "Adicione tempo de intervalo se houver", "Use '+' para turnos divididos"] },
      { title: "Verificar horas de trabalho", points: ["Total semanal calculado automaticamente", "Total mensal também exibido", "Verificação do limite de 28 horas", "Aviso vermelho se exceder"] },
      { title: "Ver salário estimado", points: ["Salário estimado por local de trabalho", "Adicional noturno (22:00-5:00) automático", "Transporte incluído no total", "Toque '▼ Detalhes' para detalhamento"] },
      { title: "Salvar dados", points: ["Dados salvos automaticamente", "Exportar para JSON como backup", "Importar JSON para restaurar", "Transferir dados entre dispositivos"] },
      { title: "Definir senha", points: ["Definir senha na primeira vez", "Login com senha na próxima vez", "Alterar senha na parte inferior", "Bloqueio após 5 tentativas erradas"] },
    ],
    faqs: [
      { q: "Onde os dados são salvos?", a: "No seu navegador (no dispositivo). Não são enviados para nenhum servidor." },
      { q: "E se eu esquecer a senha?", a: "Use o botão 'Excluir todos os dados' para resetar. Faça backup JSON antes." },
      { q: "O que acontece se exceder 28 horas?", a: "Um aviso vermelho é exibido. Estudantes internacionais devem verificar as regras do visto." },
      { q: "Como o adicional noturno é calculado?", a: "25% do salário por hora é adicionado para trabalho entre 22:00-5:00." },
      { q: "Posso usar em vários dispositivos?", a: "Sim, use exportar/importar JSON para transferir dados." },
      { q: "Quantos locais de trabalho posso registrar?", a: "Sem limite. Adicione quantos precisar." },
    ],
  },
};

const stepIcons = ["🏢", "📅", "⏰", "💰", "💾", "🔒"];
const stepImages = [
  "/manus-storage/guide-step1-register_bf808bab.png",
  "/manus-storage/guide-step2-calendar_a44225a1.png",
  "/manus-storage/guide-step3-check-hours_e6bce458.png",
  "/manus-storage/guide-step4-salary_126550b9.png",
  "/manus-storage/guide-step5-backup_a07e931c.png",
  "/manus-storage/guide-step6-password_8ba3908b.png",
];

export default function Guide() {
  const [, navigate] = useLocation();
  const lang = useMemo(() => getLang(), []);
  const t = translations[lang] || translations.en || translations.ja;

  return (
    <div className="guide-page">
      {/* Header */}
      <header className="guide-header">
        <button className="guide-back-btn" onClick={() => navigate("/")}>
          {t.back}
        </button>
        <h1 className="guide-main-title">{t.title}</h1>
        <p className="guide-subtitle">{t.subtitle}</p>
      </header>

      {/* Steps */}
      <section className="guide-steps">
        {t.steps.map((step, idx) => (
          <div key={idx} className="guide-card">
            <div className="guide-card-badge">
              <span className="guide-card-num">STEP {idx + 1}</span>
              <span className="guide-card-icon">{stepIcons[idx]}</span>
            </div>
            <h2 className="guide-card-title">{step.title}</h2>
            <div className="guide-card-image">
              <img
                src={stepImages[idx]}
                alt={step.title}
                loading="lazy"
              />
            </div>
            <ul className="guide-card-points">
              {step.points.map((point, i) => (
                <li key={i}>
                  <span className="guide-point-dot" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section className="guide-faq">
        <h2 className="guide-faq-title">{t.faq_title}</h2>
        <div className="guide-faq-list">
          {t.faqs.map((faq, i) => (
            <details key={i} className="guide-faq-item">
              <summary className="guide-faq-q">{faq.q}</summary>
              <p className="guide-faq-a">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="guide-footer-cta">
        <button
          className="guide-start-btn"
          onClick={() => navigate("/")}
        >
          {t.cta}
        </button>
      </section>

      <style>{`
        .guide-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #e8f4fd 0%, #f0fdf4 50%, #fefce8 100%);
          padding-bottom: 4rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', sans-serif;
        }

        .guide-header {
          text-align: center;
          padding: 2rem 1.5rem 1.5rem;
          position: relative;
        }

        .guide-back-btn {
          position: absolute;
          top: 1.5rem;
          left: 1rem;
          background: white;
          border: none;
          border-radius: 2rem;
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #2563eb;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          cursor: pointer;
          transition: transform 0.15s ease-out;
        }
        .guide-back-btn:active {
          transform: scale(0.95);
        }

        .guide-main-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #1e3a5f;
          margin: 0.5rem 0 0.3rem;
        }

        .guide-subtitle {
          font-size: 0.95rem;
          color: #64748b;
          margin: 0;
        }

        /* Steps */
        .guide-steps {
          padding: 0 1rem;
          max-width: 480px;
          margin: 0 auto;
        }

        .guide-card {
          background: white;
          border-radius: 1.25rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          transition: transform 0.2s ease-out;
        }

        .guide-card-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .guide-card-num {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.25rem 0.6rem;
          border-radius: 1rem;
          letter-spacing: 0.05em;
        }

        .guide-card-icon {
          font-size: 1.4rem;
        }

        .guide-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0.3rem 0 1rem;
        }

        .guide-card-image {
          border-radius: 0.75rem;
          overflow: hidden;
          margin-bottom: 1rem;
          background: #f1f5f9;
        }
        .guide-card-image img {
          width: 100%;
          height: auto;
          display: block;
        }

        .guide-card-points {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .guide-card-points li {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          padding: 0.4rem 0;
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.5;
        }
        .guide-point-dot {
          width: 6px;
          height: 6px;
          min-width: 6px;
          border-radius: 50%;
          background: #2563eb;
          margin-top: 0.5rem;
        }

        /* FAQ */
        .guide-faq {
          padding: 2rem 1rem;
          max-width: 480px;
          margin: 0 auto;
        }

        .guide-faq-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1e293b;
          text-align: center;
          margin-bottom: 1rem;
        }

        .guide-faq-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .guide-faq-item {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .guide-faq-q {
          padding: 1rem 1.25rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
          list-style: none;
          position: relative;
          padding-right: 2.5rem;
        }
        .guide-faq-q::after {
          content: '＋';
          position: absolute;
          right: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.1rem;
          color: #94a3b8;
          transition: transform 0.2s ease-out;
        }
        .guide-faq-item[open] .guide-faq-q::after {
          content: '−';
          color: #2563eb;
        }
        .guide-faq-q::-webkit-details-marker {
          display: none;
        }

        .guide-faq-a {
          padding: 0 1.25rem 1rem;
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.7;
          margin: 0;
          border-top: 1px solid #f1f5f9;
          padding-top: 0.75rem;
        }

        /* Footer CTA */
        .guide-footer-cta {
          text-align: center;
          padding: 1rem 1rem 2rem;
        }

        .guide-start-btn {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: white;
          border: none;
          border-radius: 2rem;
          padding: 1rem 2.5rem;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
          transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
        }
        .guide-start-btn:active {
          transform: scale(0.97);
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
        }

        /* Desktop */
        @media (min-width: 768px) {
          .guide-header {
            padding: 3rem 2rem 2rem;
          }
          .guide-main-title {
            font-size: 2.2rem;
          }
          .guide-steps {
            max-width: 560px;
          }
          .guide-card {
            padding: 2rem;
          }
          .guide-faq {
            max-width: 560px;
          }
        }
      `}</style>
    </div>
  );
}
