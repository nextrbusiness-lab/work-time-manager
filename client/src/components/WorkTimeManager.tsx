import { useRef, useEffect, useState } from 'react';
import { Link } from 'wouter';
import './WorkTimeManager.css';


interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// ── TRANSLATIONS ──────────────────────────────────────────────────────────────
const T: Record<string, any> = {
  ja:{
    title:"Work Time Manager",sub:"勤務時間・給与・交通費をまとめて管理。掛け持ち勤務・留学生にも対応。",
    limit:"週間制限時間",hours:"時間",wp_title:"勤務先",add_wp:"勤務先を追加",
    sched_title:"週間スケジュール",result_title:"計算結果",
    total:"週間合計",limit_r:"週間制限時間",remain:"残り時間",over_h:"オーバー時間",
    usage:"使用率",status:"状態",ok:"OK ✓",over_status:(h:string)=>`${h}時間オーバー`,
    days:["月","火","水","木","金","土","日"],
    daily_title:"日ごとの合計",monthly_title:"月間合計",wp_total:"合計",day_total:"日計",wp_ph:"勤務先名",
    lg_start:"開始",lg_end:"終了",lg_break:"休憩(分)",lg_hours:"実働時間",
    lbl_start:"開始",lbl_end:"終了",lbl_break:"休憩",lbl_min:"分",
    monthly_weeks:"週",monthly_total_label:"月間合計勤務時間",monthly_avg_label:"週平均",
    note:"このツールは目安です。在留資格や最新の制度は必ず公式情報で確認してください。",
    month_cal_title:"月間カレンダー",ms_total:"月間合計",ms_limit:"月間制限目安",ms_remain:"残り時間",ms_over:"オーバー",ms_usage:"月間使用率",
    prev_month:"◄ 前月",next_month:"翌月 ►",apply_next:"週間シフトを翌月に反映",monthly_usage:"月間使用率",
    hourly_label:"時給",transport_label:"交通費/日",
    pw_setup_short:"パスワードは4文字以上で設定してください",pw_setup_mismatch:"パスワードが一致しません",
    pw_wrong_remaining:(n:string)=>`パスワードが違います (残り${n}回)`,
    pw_locked:(mmss:string)=>`試行回数が上限に達しました。あと${mmss}でもう一度お試しください。`,
    pw_changed:"パスワードを変更しました",pw_current_wrong:"現在のパスワードが違います",
    pw_new_short:"新しいパスワードは4文字以上で設定してください",pw_new_mismatch:"新しいパスワードが一致しません",
    confirm_reset_week:"今週のシフト時刻を全てクリアします。\n勤務先名・時給・交通費はそのまま残ります。\nよろしいですか？",
    confirm_delete_all:"全てのデータとパスワードを削除します。\nこの操作は取り消せません。\nよろしいですか？",
    export_empty:"エクスポートするデータがありません",export_success:"✅ データをエクスポートしました",
    import_invalid:"無効なバックアップファイルです。\nWork Time Managerのエクスポートファイルを選択してください。",
    import_version_error:"このバックアップファイルの形式には対応していません。\n最新のWork Time Managerで作成したファイルをお使いください。",
    import_confirm:"インポートすると現在のデータが上書きされます。\nよろしいですか？",
    import_success:"✅ データをインポートしました。ページをリロードします…",
    import_read_error:"ファイルの読み込みに失敗しました。\n正しいJSONファイルを選択してください。"
  },
  ja_easy:{
    title:"Work Time Manager",sub:"きんむじかん・きゅうよ・こうつうひ を まとめて かんり。かけもち きんむ・りゅうがくせい にも たいおう。",
    limit:"はたらける じかん",hours:"じかん",wp_title:"はたらく ばしょ",add_wp:"ばしょを ふやす",
    sched_title:"1しゅうかんの スケジュール",result_title:"けいさん の けっか",
    total:"ぜんぶの じかん",limit_r:"はたらける じかん",remain:"のこりの じかん",over_h:"オーバーした じかん",
    usage:"つかった わりあい",status:"いまの じょうたい",ok:"だいじょうぶ ✓",over_status:(h:string)=>`${h}じかん オーバー`,
    days:["月","火","水","木","金","土","日"],
    daily_title:"ひごとの ごうけい",monthly_title:"つきかんの ごうけい",wp_total:"ごうけい",day_total:"にっけい",wp_ph:"ばしょの なまえ",
    lg_start:"はじまり",lg_end:"おわり",lg_break:"きゅうけい(ふん)",lg_hours:"じっさいの じかん",
    lbl_start:"はじまり",lbl_end:"おわり",lbl_break:"きゅうけい",lbl_min:"ふん",
    monthly_weeks:"しゅう",monthly_total_label:"つきかん ごうけい じかん",monthly_avg_label:"しゅうへいきん",
    note:"これは めやす です。ほんとうの ルールは やくしょ などで かくにん してください。",
    month_cal_title:"つきの カレンダー",ms_total:"つきの ごうけい",ms_limit:"つきの せいげん",ms_remain:"のこり",ms_over:"オーバー",ms_usage:"つきの しようりつ",
    prev_month:"◄ まえ",next_month:"つぎ ►",apply_next:"しゅうかん を つきに はんえい",monthly_usage:"つきの しようりつ",
    hourly_label:"じきゅう",transport_label:"こうつうひ／にち",
    pw_setup_short:"パスワードは 4もじ いじょう で つくってください",pw_setup_mismatch:"パスワードが おなじ じゃないです",
    pw_wrong_remaining:(n:string)=>`パスワードが ちがいます (あと${n}かい)`,
    pw_locked:(mmss:string)=>`なんかい も まちがえました。あと ${mmss} で もういちど できます。`,
    pw_changed:"パスワードを かえました",pw_current_wrong:"いまの パスワードが ちがいます",
    pw_new_short:"あたらしい パスワードは 4もじ いじょう で つくってください",pw_new_mismatch:"あたらしい パスワードが おなじ じゃないです",
    confirm_reset_week:"こんしゅうの じかんを ぜんぶ けします。\nきんむさきめい・じきゅう・こうつうひ は のこります。\nよろしいですか？",
    confirm_delete_all:"データと パスワードを ぜんぶ けします。\nもとに もどせません。\nよろしいですか？",
    export_empty:"エクスポートする データが ありません",export_success:"✅ データを エクスポートしました",
    import_invalid:"つかえない ファイルです。\nWork Time Manager の ファイルを えらんでください。",
    import_version_error:"この ファイルの けいしきには たいおうしていません。\nあたらしい Work Time Manager で つくった ファイルを つかってください。",
    import_confirm:"インポートすると いまの データが きえます。\nよろしいですか？",
    import_success:"✅ データを インポートしました。ページを リロードします…",
    import_read_error:"ファイルを よみこめませんでした。\nただしい JSONファイルを えらんでください。"
  },
  en:{
    title:"Work Time Manager",sub:"Manage work hours, salary & transport costs together. For multiple jobs & international students.",
    limit:"Limit",hours:"hrs",wp_title:"Workplaces",add_wp:"Add Workplace",
    sched_title:"Weekly Schedule",result_title:"Result",
    total:"Total",limit_r:"Limit",remain:"Remaining",over_h:"Over Hours",
    usage:"Usage",status:"Status",ok:"OK ✓",over_status:(h:string)=>`${h} hrs over`,
    days:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    daily_title:"Daily Total",monthly_title:"Monthly Total",wp_total:"Total",day_total:"Daily",wp_ph:"Workplace name",
    lg_start:"Start",lg_end:"End",lg_break:"Break(min)",lg_hours:"Work hrs",
    lbl_start:"Start",lbl_end:"End",lbl_break:"Break",lbl_min:"min",
    monthly_weeks:"wks",monthly_total_label:"Monthly Total Hours",monthly_avg_label:"Weekly Avg",
    note:"This tool is for reference only. Please check official information regarding visa status and latest regulations.",
    month_cal_title:"Monthly Calendar",ms_total:"Monthly Total",ms_limit:"Monthly Limit",ms_remain:"Remaining",ms_over:"Over",ms_usage:"Monthly Usage",
    prev_month:"◄ Prev",next_month:"Next ►",apply_next:"Apply weekly shifts to next month",monthly_usage:"Monthly Usage",
    hourly_label:"Hourly wage",transport_label:"Transport/day",
    pw_setup_short:"Password must be at least 4 characters",pw_setup_mismatch:"Passwords do not match",
    pw_wrong_remaining:(n:string)=>`Wrong password (${n} attempts left)`,
    pw_locked:(mmss:string)=>`Too many attempts. Try again in ${mmss}.`,
    pw_changed:"Password changed",pw_current_wrong:"Current password is incorrect",
    pw_new_short:"New password must be at least 4 characters",pw_new_mismatch:"New passwords do not match",
    confirm_reset_week:"This will clear all shift times for this week.\nWorkplace names, hourly wages, and transport costs will stay.\nContinue?",
    confirm_delete_all:"This will delete all data and your password.\nThis cannot be undone.\nContinue?",
    export_empty:"No data to export",export_success:"✅ Data exported",
    import_invalid:"Invalid backup file.\nPlease select a Work Time Manager export file.",
    import_version_error:"This backup file format is not supported.\nPlease use a file exported from the latest Work Time Manager.",
    import_confirm:"Importing will overwrite your current data.\nContinue?",
    import_success:"✅ Data imported. Reloading the page…",
    import_read_error:"Failed to read the file.\nPlease select a valid JSON file."
  },
  vi:{
    title:"Work Time Manager",sub:"Quản lý giờ làm, lương & chi phí đi lại. Hỗ trợ làm nhiều việc & du học sinh.",
    limit:"Giới hạn",hours:"giờ",wp_title:"Nơi làm việc",add_wp:"Thêm nơi làm việc",
    sched_title:"Lịch tuần",result_title:"Kết quả",
    total:"Tổng",limit_r:"Giới hạn",remain:"Còn lại",over_h:"Vượt quá",
    usage:"Tỷ lệ",status:"Trạng thái",ok:"OK ✓",over_status:(h:string)=>`Vượt ${h} giờ`,
    days:["T2","T3","T4","T5","T6","T7","CN"],
    daily_title:"Tổng theo ngày",monthly_title:"Tổng tháng",wp_total:"Tổng",day_total:"Ngày",wp_ph:"Tên nơi làm việc",
    lg_start:"Bắt đầu",lg_end:"Kết thúc",lg_break:"Nghỉ(ph)",lg_hours:"Giờ làm",
    lbl_start:"Bắt đầu",lbl_end:"Kết thúc",lbl_break:"Nghỉ",lbl_min:"ph",
    monthly_weeks:"tuần",monthly_total_label:"Tổng giờ tháng",monthly_avg_label:"TB tuần",
    note:"Công cụ này chỉ mang tính tham khảo. Vui lòng kiểm tra thông tin chính thức về tình trạng visa và quy định mới nhất.",
    month_cal_title:"Lịch tháng",ms_total:"Tổng tháng",ms_limit:"Giới hạn tháng",ms_remain:"Còn lại",ms_over:"Vượt",ms_usage:"Tỷ lệ tháng",
    prev_month:"◄ Trước",next_month:"Sau ►",apply_next:"Áp dụng ca tuần sang tháng sau",monthly_usage:"Tỷ lệ tháng",
    hourly_label:"Lương giờ",transport_label:"Đi lại/ngày",
    pw_setup_short:"Mật khẩu phải có ít nhất 4 ký tự",pw_setup_mismatch:"Mật khẩu không khớp",
    pw_wrong_remaining:(n:string)=>`Sai mật khẩu (còn ${n} lần)`,
    pw_locked:(mmss:string)=>`Bạn đã nhập sai quá nhiều lần. Thử lại sau ${mmss}.`,
    pw_changed:"Đã đổi mật khẩu",pw_current_wrong:"Mật khẩu hiện tại không đúng",
    pw_new_short:"Mật khẩu mới phải có ít nhất 4 ký tự",pw_new_mismatch:"Mật khẩu mới không khớp",
    confirm_reset_week:"Thao tác này sẽ xóa toàn bộ giờ làm trong tuần này.\nTên nơi làm việc, lương giờ và phí đi lại vẫn được giữ lại.\nTiếp tục?",
    confirm_delete_all:"Thao tác này sẽ xóa toàn bộ dữ liệu và mật khẩu.\nKhông thể hoàn tác.\nTiếp tục?",
    export_empty:"Không có dữ liệu để xuất",export_success:"✅ Đã xuất dữ liệu",
    import_invalid:"Tệp sao lưu không hợp lệ.\nVui lòng chọn tệp xuất từ Work Time Manager.",
    import_version_error:"Không hỗ trợ định dạng tệp sao lưu này.\nVui lòng dùng tệp được xuất từ phiên bản Work Time Manager mới nhất.",
    import_confirm:"Nhập dữ liệu sẽ ghi đè dữ liệu hiện tại.\nTiếp tục?",
    import_success:"✅ Đã nhập dữ liệu. Đang tải lại trang…",
    import_read_error:"Không đọc được tệp.\nVui lòng chọn đúng tệp JSON."
  },
  ne:{
    title:"Work Time Manager",sub:"कामको समय, तलब र यातायात खर्च एकैसाथ व्यवस्थापन। बहु-रोजगार र विदेशी विद्यार्थीलाई पनि।",
    limit:"सीमा",hours:"घण्टा",wp_title:"कार्यस्थल",add_wp:"कार्यस्थल थप्नुहोस्",
    sched_title:"साप्ताहिक तालिका",result_title:"नतिजा",
    total:"कुल",limit_r:"सीमा",remain:"बाँकी",over_h:"बढी",
    usage:"उपयोग",status:"स्थिति",ok:"ठिक ✓",over_status:(h:string)=>`${h} घण्टा बढी`,
    days:["सोम","मंगल","बुध","बिही","शुक्र","शनि","आइत"],
    daily_title:"दैनिक कुल",monthly_title:"मासिक कुल",wp_total:"जम्मा",day_total:"दैनिक",wp_ph:"कार्यस्थलको नाम",
    lg_start:"सुरु",lg_end:"अन्त्य",lg_break:"बिराम(मि)",lg_hours:"काम घण्टा",
    lbl_start:"सुरु",lbl_end:"अन्त्य",lbl_break:"बिराम",lbl_min:"मि",
    monthly_weeks:"हप्ता",monthly_total_label:"मासिक कुल घण्टा",monthly_avg_label:"साप्ताहिक औसत",
    note:"यो उपकरण सन्दर्भको लागि मात्र हो। कृपया भिसा स्थिति र नवीनतम नियमहरूको बारेमा आधिकारिक जानकारी जाँच गर्नुहोस्।",
    month_cal_title:"मासिक क्यालेन्डर",ms_total:"मासिक कुल",ms_limit:"मासिक सीमा",ms_remain:"बाँकी",ms_over:"बढी",ms_usage:"मासिक उपयोग",
    prev_month:"◄ अघिल्लो",next_month:"अर्को ►",apply_next:"साप्ताहिक शिफ्ट अर्को महिनामा लागू",monthly_usage:"मासिक उपयोग",
    hourly_label:"प्रति घण्टा तलब",transport_label:"यातायात/दिन",
    pw_setup_short:"पासवर्ड कम्तिमा ४ अक्षरको हुनुपर्छ",pw_setup_mismatch:"पासवर्ड मिलेन",
    pw_wrong_remaining:(n:string)=>`गलत पासवर्ड (बाँकी ${n} पटक)`,
    pw_locked:(mmss:string)=>`धेरै पटक गलत भयो। ${mmss} पछि फेरि प्रयास गर्नुहोस्।`,
    pw_changed:"पासवर्ड परिवर्तन भयो",pw_current_wrong:"हालको पासवर्ड गलत छ",
    pw_new_short:"नयाँ पासवर्ड कम्तिमा ४ अक्षरको हुनुपर्छ",pw_new_mismatch:"नयाँ पासवर्ड मिलेन",
    confirm_reset_week:"यसले यो हप्ताको सबै समय मेटाउनेछ।\nकार्यस्थलको नाम, तलब र यातायात खर्च जोगिनेछ।\nजारी राख्ने？",
    confirm_delete_all:"यसले सबै डेटा र पासवर्ड मेटाउनेछ।\nयो फिर्ता गर्न सकिँदैन।\nजारी राख्ने？",
    export_empty:"निर्यात गर्न डेटा छैन",export_success:"✅ डेटा निर्यात भयो",
    import_invalid:"अमान्य ब्याकअप फाइल।\nकृपया Work Time Manager बाट निर्यात गरिएको फाइल छान्नुहोस्।",
    import_version_error:"यो ब्याकअप फाइलको ढाँचा समर्थित छैन।\nकृपया पछिल्लो Work Time Manager बाट बनेको फाइल प्रयोग गर्नुहोस्।",
    import_confirm:"आयातले हालको डेटा अधिलेखन गर्नेछ।\nजारी राख्ने？",
    import_success:"✅ डेटा आयात भयो। पृष्ठ पुनः लोड हुँदैछ…",
    import_read_error:"फाइल पढ्न सकिएन।\nकृपया सही JSON फाइल छान्नुहोस्।"
  },
  zh:{
    title:"Work Time Manager",sub:"统一管理工时、工资与交通费。支持多份兼职与留学生。",
    limit:"限制",hours:"小时",wp_title:"工作地点",add_wp:"添加工作地点",
    sched_title:"每周日程",result_title:"计算结果",
    total:"总计",limit_r:"限制",remain:"剩余",over_h:"超出",
    usage:"使用率",status:"状态",ok:"正常 ✓",over_status:(h:string)=>`超出 ${h} 小时`,
    days:["周一","周二","周三","周四","周五","周六","周日"],
    daily_title:"每日合计",monthly_title:"月间合计",wp_total:"合计",day_total:"日计",wp_ph:"工作地点名称",
    lg_start:"开始",lg_end:"结束",lg_break:"休息(分)",lg_hours:"工时",
    lbl_start:"开始",lbl_end:"结束",lbl_break:"休息",lbl_min:"分",
    monthly_weeks:"周",monthly_total_label:"月间总工时",monthly_avg_label:"周平均",
    note:"此工具仅供参考。请务必通过官方信息确认在留资格及最新制度。",
    month_cal_title:"月历",ms_total:"月间合计",ms_limit:"月间限制",ms_remain:"剩余",ms_over:"超出",ms_usage:"月间使用率",
    prev_month:"◄ 上月",next_month:"下月 ►",apply_next:"将周排班应用到下月",monthly_usage:"月间使用率",
    hourly_label:"时薪",transport_label:"交通费/天",
    pw_setup_short:"密码至少需要4个字符",pw_setup_mismatch:"两次密码不一致",
    pw_wrong_remaining:(n:string)=>`密码错误（还剩${n}次）`,
    pw_locked:(mmss:string)=>`尝试次数过多。请在${mmss}后重试。`,
    pw_changed:"密码已修改",pw_current_wrong:"当前密码不正确",
    pw_new_short:"新密码至少需要4个字符",pw_new_mismatch:"两次新密码不一致",
    confirm_reset_week:"将清除本周所有班次时间。\n工作地点名称、时薪与交通费将保留。\n是否继续？",
    confirm_delete_all:"将删除所有数据和密码。\n此操作无法撤销。\n是否继续？",
    export_empty:"没有可导出的数据",export_success:"✅ 数据已导出",
    import_invalid:"无效的备份文件。\n请选择Work Time Manager导出的文件。",
    import_version_error:"不支持此备份文件格式。\n请使用最新版Work Time Manager导出的文件。",
    import_confirm:"导入将覆盖当前数据。\n是否继续？",
    import_success:"✅ 数据已导入，正在重新加载页面…",
    import_read_error:"文件读取失败。\n请选择正确的JSON文件。"
  },
  ko:{
    title:"Work Time Manager",sub:"근무시간·급여·교통비를 통합 관리. 겸직·유학생도 지원.",
    limit:"제한",hours:"시간",wp_title:"근무지",add_wp:"근무지 추가",
    sched_title:"주간 스케줄",result_title:"계산 결과",
    total:"합계",limit_r:"제한",remain:"남은",over_h:"초과",
    usage:"사용률",status:"상태",ok:"정상 ✓",over_status:(h:string)=>`${h}시간 초과`,
    days:["월","화","수","목","금","토","일"],
    daily_title:"일별 합계",monthly_title:"월간 합계",wp_total:"합계",day_total:"일계",wp_ph:"근무지 이름",
    lg_start:"시작",lg_end:"종료",lg_break:"휴식(분)",lg_hours:"근무시간",
    lbl_start:"시작",lbl_end:"종료",lbl_break:"휴식",lbl_min:"분",
    monthly_weeks:"주",monthly_total_label:"월간 총 근무시간",monthly_avg_label:"주 평균",
    note:"이 도구는 참고용입니다. 체류 자격 및 최신 제도는 반드시 공식 정보를 확인하십시오.",
    month_cal_title:"월간 달력",ms_total:"월간 합계",ms_limit:"월간 제한",ms_remain:"남은",ms_over:"초과",ms_usage:"월간 사용률",
    prev_month:"◄ 이전",next_month:"다음 ►",apply_next:"주간 시프트를 다음 달에 반영",monthly_usage:"월간 사용률",
    hourly_label:"시급",transport_label:"교통비/일",
    pw_setup_short:"비밀번호는 4자 이상으로 설정해주세요",pw_setup_mismatch:"비밀번호가 일치하지 않습니다",
    pw_wrong_remaining:(n:string)=>`비밀번호가 틀렸습니다 (남은 횟수 ${n}회)`,
    pw_locked:(mmss:string)=>`시도 횟수를 초과했습니다. ${mmss} 후 다시 시도해주세요.`,
    pw_changed:"비밀번호를 변경했습니다",pw_current_wrong:"현재 비밀번호가 올바르지 않습니다",
    pw_new_short:"새 비밀번호는 4자 이상으로 설정해주세요",pw_new_mismatch:"새 비밀번호가 일치하지 않습니다",
    confirm_reset_week:"이번 주 근무 시간을 모두 삭제합니다.\n근무지 이름·시급·교통비는 유지됩니다.\n계속하시겠습니까？",
    confirm_delete_all:"모든 데이터와 비밀번호를 삭제합니다.\n이 작업은 되돌릴 수 없습니다.\n계속하시겠습니까？",
    export_empty:"내보낼 데이터가 없습니다",export_success:"✅ 데이터를 내보냈습니다",
    import_invalid:"유효하지 않은 백업 파일입니다.\nWork Time Manager로 내보낸 파일을 선택해주세요.",
    import_version_error:"이 백업 파일 형식은 지원되지 않습니다.\n최신 Work Time Manager로 내보낸 파일을 사용해주세요.",
    import_confirm:"가져오면 현재 데이터가 덮어써집니다.\n계속하시겠습니까？",
    import_success:"✅ 데이터를 가져왔습니다. 페이지를 새로고침합니다…",
    import_read_error:"파일을 읽을 수 없습니다.\n올바른 JSON 파일을 선택해주세요."
  },
  tl:{
    title:"Work Time Manager",sub:"Pamahalaan ang oras, sahod at pamasahe. Para sa maraming trabaho at international students.",
    limit:"Limitasyon",hours:"oras",wp_title:"Trabaho",add_wp:"Magdagdag ng Trabaho",
    sched_title:"Lingguhang Iskedyul",result_title:"Resulta",
    total:"Kabuuan",limit_r:"Limitasyon",remain:"Natitira",over_h:"Sobra",
    usage:"Paggamit",status:"Katayuan",ok:"OK ✓",over_status:(h:string)=>`${h} oras na sobra`,
    days:["Lun","Mar","Miy","Huw","Biy","Sab","Lin"],
    daily_title:"Kabuuan sa Araw",monthly_title:"Kabuuan sa Buwan",wp_total:"Kabuuan",day_total:"Araw",wp_ph:"Pangalan ng trabaho",
    lg_start:"Simula",lg_end:"Katapusan",lg_break:"Pahinga(min)",lg_hours:"Oras ng trabaho",
    lbl_start:"Simula",lbl_end:"Katapusan",lbl_break:"Pahinga",lbl_min:"min",
    monthly_weeks:"linggo",monthly_total_label:"Kabuuang Oras sa Buwan",monthly_avg_label:"Avg sa Linggo",
    note:"Ang tool na ito ay para sa sanggunian lamang. Mangyaring suriin ang opisyal na impormasyon tungkol sa katayuan ng visa at pinakabagong mga regulasyon.",
    month_cal_title:"Buwanang Kalendaryo",ms_total:"Kabuuan sa Buwan",ms_limit:"Limitasyon sa Buwan",ms_remain:"Natitira",ms_over:"Sobra",ms_usage:"Paggamit sa Buwan",
    prev_month:"◄ Nakaraan",next_month:"Susunod ►",apply_next:"Ilapat ang lingguhang shift sa susunod na buwan",monthly_usage:"Paggamit sa Buwan",
    hourly_label:"Sahod bawat oras",transport_label:"Pamasahe/araw",
    pw_setup_short:"Dapat 4 characters o higit pa ang password",pw_setup_mismatch:"Hindi magkatugma ang password",
    pw_wrong_remaining:(n:string)=>`Maling password (${n} pagsubok na lang)`,
    pw_locked:(mmss:string)=>`Sobra na sa bilang ng pagsubok. Subukan ulit pagkalipas ng ${mmss}.`,
    pw_changed:"Nabago ang password",pw_current_wrong:"Mali ang kasalukuyang password",
    pw_new_short:"Dapat 4 characters o higit pa ang bagong password",pw_new_mismatch:"Hindi magkatugma ang bagong password",
    confirm_reset_week:"Buburahin nito ang lahat ng oras ng shift ngayong linggo.\nMananatili ang pangalan ng trabaho, sahod, at pamasahe.\nMagpatuloy?",
    confirm_delete_all:"Buburahin nito ang lahat ng data at password.\nHindi na maibabalik pa ito.\nMagpatuloy?",
    export_empty:"Walang data na i-eexport",export_success:"✅ Na-export ang data",
    import_invalid:"Hindi valid na backup file.\nPumili ng file na na-export mula sa Work Time Manager.",
    import_version_error:"Hindi suportado ang format ng backup file na ito.\nGumamit ng file mula sa pinakabagong Work Time Manager.",
    import_confirm:"Mao-overwrite ng pag-import ang kasalukuyang data.\nMagpatuloy?",
    import_success:"✅ Na-import ang data. Nire-reload ang page…",
    import_read_error:"Hindi mabasa ang file.\nPumili ng tamang JSON file."
  },
  id:{
    title:"Work Time Manager",sub:"Kelola jam kerja, gaji & transportasi. Mendukung kerja rangkap & mahasiswa asing.",
    limit:"Batas",hours:"jam",wp_title:"Tempat Kerja",add_wp:"Tambah Tempat Kerja",
    sched_title:"Jadwal Mingguan",result_title:"Hasil",
    total:"Total",limit_r:"Batas",remain:"Sisa",over_h:"Kelebihan",
    usage:"Penggunaan",status:"Status",ok:"OK ✓",over_status:(h:string)=>`Lebih ${h} jam`,
    days:["Sen","Sel","Rab","Kam","Jum","Sab","Min"],
    daily_title:"Total Harian",monthly_title:"Total Bulanan",wp_total:"Total",day_total:"Harian",wp_ph:"Nama tempat kerja",
    lg_start:"Mulai",lg_end:"Selesai",lg_break:"Istirahat(mnt)",lg_hours:"Jam kerja",
    lbl_start:"Mulai",lbl_end:"Selesai",lbl_break:"Istirahat",lbl_min:"mnt",
    monthly_weeks:"mgg",monthly_total_label:"Total Jam Bulanan",monthly_avg_label:"Rata-rata Minggu",
    note:"Alat ini hanya untuk referensi. Harap periksa informasi resmi mengenai status visa dan peraturan terbaru.",
    month_cal_title:"Kalender Bulanan",ms_total:"Total Bulanan",ms_limit:"Batas Bulanan",ms_remain:"Sisa",ms_over:"Kelebihan",ms_usage:"Penggunaan Bulanan",
    prev_month:"◄ Sebelum",next_month:"Berikut ►",apply_next:"Terapkan shift mingguan ke bulan depan",monthly_usage:"Penggunaan Bulanan",
    hourly_label:"Upah per jam",transport_label:"Transportasi/hari",
    pw_setup_short:"Kata sandi minimal 4 karakter",pw_setup_mismatch:"Kata sandi tidak cocok",
    pw_wrong_remaining:(n:string)=>`Kata sandi salah (sisa ${n} kali)`,
    pw_locked:(mmss:string)=>`Terlalu banyak percobaan. Coba lagi dalam ${mmss}.`,
    pw_changed:"Kata sandi berhasil diubah",pw_current_wrong:"Kata sandi saat ini salah",
    pw_new_short:"Kata sandi baru minimal 4 karakter",pw_new_mismatch:"Kata sandi baru tidak cocok",
    confirm_reset_week:"Ini akan menghapus semua jam shift minggu ini.\nNama tempat kerja, upah, dan transportasi tetap tersimpan.\nLanjutkan?",
    confirm_delete_all:"Ini akan menghapus semua data dan kata sandi.\nTindakan ini tidak dapat dibatalkan.\nLanjutkan?",
    export_empty:"Tidak ada data untuk diekspor",export_success:"✅ Data berhasil diekspor",
    import_invalid:"File backup tidak valid.\nPilih file hasil ekspor dari Work Time Manager.",
    import_version_error:"Format file backup ini tidak didukung.\nGunakan file dari Work Time Manager versi terbaru.",
    import_confirm:"Impor akan menimpa data saat ini.\nLanjutkan?",
    import_success:"✅ Data berhasil diimpor. Memuat ulang halaman…",
    import_read_error:"Gagal membaca file.\nPilih file JSON yang benar."
  },
  my:{
    title:"Work Time Manager",sub:"အလုပ်ချိန်၊ လစာ နှင့် သယ်ယူစရိတ် စီမံခန့်ခွဲ။ အလုပ်များစွာ နှင့် နိုင်ငံခြားကျောင်းသား။",
    limit:"ကန့်သတ်",hours:"နာရီ",wp_title:"အလုပ်နေရာ",add_wp:"အလုပ်နေရာ ထည့်ရန်",
    sched_title:"အပတ်စဉ် ဇယား",result_title:"ရလဒ်",
    total:"စုစုပေါင်း",limit_r:"ကန့်သတ်",remain:"ကျန်ရှိ",over_h:"ပိုသော",
    usage:"အသုံးပြုမှု",status:"အခြေအနေ",ok:"အိုကေ ✓",over_status:(h:string)=>`${h} နာရီ ပိုသည်`,
    days:["တနင်","အင်","ဗုဒ်","ကြာ","သော","စနေ","တနင်ဂ"],
    daily_title:"နေ့စဉ် စုစုပေါင်း",monthly_title:"လစဉ် စုစုပေါင်း",wp_total:"စုစုပေါင်း",day_total:"နေ့စဉ်",wp_ph:"အလုပ်နေရာ အမည်",
    lg_start:"စတင်",lg_end:"ပြီးဆုံး",lg_break:"နားချိန်(မိ)",lg_hours:"အလုပ်ချိန်",
    lbl_start:"စတင်",lbl_end:"ပြီး",lbl_break:"နား",lbl_min:"မိ",
    monthly_weeks:"ပတ်",monthly_total_label:"လစဉ် စုစုပေါင်း နာရီ",monthly_avg_label:"အပတ်ပျမ်းမျှ",
    note:"ဤကိရိယာသည် ရည်ညွှန်းရန်အတွက်သာ ဖြစ်သည်။ ဗီဇာအခြေအနေနှင့် နောက်ဆုံးပေါ် စည်းမျဉ်းများကို တရားဝင်အချက်အလက်များမှ စစ်ဆေးပါ။",
    month_cal_title:"လစဉ် ပြက္ခဒိန်",ms_total:"လစဉ် စုစုပေါင်း",ms_limit:"လစဉ် ကန့်သတ်",ms_remain:"ကျန်ရှိ",ms_over:"ပိုသော",ms_usage:"လစဉ် အသုံးပြုမှု",
    prev_month:"◄ ယခင်",next_month:"နောက် ►",apply_next:"အပတ်စဉ်ရှစ်ဖ်ကို နောက်လသို့ ကူးယူ",monthly_usage:"လစဉ် အသုံးပြုမှု",
    hourly_label:"နာရီစား",transport_label:"သယ်ယူစရိတ်/နေ့",
    pw_setup_short:"စကားဝှက်သည် အနည်းဆုံး ၄လုံး ရှိရမည်",pw_setup_mismatch:"စကားဝှက် မကိုက်ညီပါ",
    pw_wrong_remaining:(n:string)=>`စကားဝှက် မှား (${n} ကြိမ် ကျန်)`,
    pw_locked:(mmss:string)=>`ကြိမ်ဦးရေ ကျော်လွန်သွားပါပြီ။ ${mmss} အကြာတွင် ထပ်ကြိုးစားပါ။`,
    pw_changed:"စကားဝှက် ပြောင်းပြီးပါပြီ",pw_current_wrong:"လက်ရှိ စကားဝှက် မှားနေပါသည်",
    pw_new_short:"စကားဝှက်အသစ်သည် အနည်းဆုံး ၄လုံး ရှိရမည်",pw_new_mismatch:"စကားဝှက်အသစ် မကိုက်ညီပါ",
    confirm_reset_week:"ဤအပတ်၏ အလုပ်ချိန်များ အားလုံးကို ဖျက်ပါမည်။\nအလုပ်နေရာအမည်၊ နာရီစား၊ သယ်ယူစရိတ်များ ကျန်ရှိနေပါမည်။\nဆက်လုပ်မလား？",
    confirm_delete_all:"ဒေတာနှင့် စကားဝှက် အားလုံးကို ဖျက်ပါမည်။\nဤလုပ်ဆောင်ချက်ကို ပြန်ပြင်၍မရပါ။\nဆက်လုပ်မလား？",
    export_empty:"ထုတ်ရန် ဒေတာ မရှိပါ",export_success:"✅ ဒေတာ ထုတ်ပြီးပါပြီ",
    import_invalid:"backup ဖိုင် မမှန်ကန်ပါ။\nWork Time Manager မှ ထုတ်ထားသော ဖိုင်ကို ရွေးပါ။",
    import_version_error:"ဤ backup ဖိုင် ပုံစံကို မထောက်ပံ့ပါ။\nနောက်ဆုံးပေါ် Work Time Manager မှ ဖိုင်ကို အသုံးပြုပါ။",
    import_confirm:"တင်သွင်းခြင်းသည် လက်ရှိဒေတာကို ဖျက်ပစ်ပါမည်။\nဆက်လုပ်မလား？",
    import_success:"✅ ဒေတာ တင်သွင်းပြီးပါပြီ။ စာမျက်နှာကို ပြန်လည်တင်နေသည်…",
    import_read_error:"ဖိုင်ကို ဖတ်၍မရပါ။\nမှန်ကန်သော JSON ဖိုင်ကို ရွေးပါ။"
  },
  th:{
    title:"Work Time Manager",sub:"จัดการเวลางาน เงินเดือน และค่าเดินทาง รองรับทำงานหลายที่และนักศึกษาต่างชาติ",
    limit:"จำกัด",hours:"ชม.",wp_title:"สถานที่ทำงาน",add_wp:"เพิ่มสถานที่ทำงาน",
    sched_title:"ตารางรายสัปดาห์",result_title:"ผลลัพธ์",
    total:"รวม",limit_r:"จำกัด",remain:"เหลือ",over_h:"เกิน",
    usage:"อัตราการใช้",status:"สถานะ",ok:"ปกติ ✓",over_status:(h:string)=>`เกิน ${h} ชม.`,
    days:["จ.","อ.","พ.","พฤ.","ศ.","ส.","อา."],
    daily_title:"รวมรายวัน",monthly_title:"รวมรายเดือน",wp_total:"รวม",day_total:"รายวัน",wp_ph:"ชื่อสถานที่ทำงาน",
    lg_start:"เริ่ม",lg_end:"สิ้นสุด",lg_break:"พัก(นาที)",lg_hours:"ชั่วโมงทำงาน",
    lbl_start:"เริ่ม",lbl_end:"สิ้น",lbl_break:"พัก",lbl_min:"นาที",
    monthly_weeks:"สัปดาห์",monthly_total_label:"ชั่วโมงรวมรายเดือน",monthly_avg_label:"เฉลี่ยต่อสัปดาห์",
    note:"เครื่องมือนี้มีไว้เพื่อใช้อ้างอิงเท่านั้น โปรดตรวจสอบข้อมูลอย่างเป็นทางการเกี่ยวกับสถานะวีซ่าและกฎระเบียบล่าสุด",
    month_cal_title:"ปฏิทินรายเดือน",ms_total:"รวมรายเดือน",ms_limit:"จำกัดรายเดือน",ms_remain:"เหลือ",ms_over:"เกิน",ms_usage:"อัตราการใช้รายเดือน",
    prev_month:"◄ ก่อน",next_month:"ถัดไป ►",apply_next:"นำตารางสัปดาห์ไปใช้เดือนถัดไป",monthly_usage:"อัตราการใช้รายเดือน",
    hourly_label:"ค่าจ้างต่อชั่วโมง",transport_label:"ค่าเดินทาง/วัน",
    pw_setup_short:"รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร",pw_setup_mismatch:"รหัสผ่านไม่ตรงกัน",
    pw_wrong_remaining:(n:string)=>`รหัสผ่านไม่ถูกต้อง (เหลือ ${n} ครั้ง)`,
    pw_locked:(mmss:string)=>`ลองผิดหลายครั้งเกินไป กรุณาลองใหม่ใน ${mmss}`,
    pw_changed:"เปลี่ยนรหัสผ่านแล้ว",pw_current_wrong:"รหัสผ่านปัจจุบันไม่ถูกต้อง",
    pw_new_short:"รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร",pw_new_mismatch:"รหัสผ่านใหม่ไม่ตรงกัน",
    confirm_reset_week:"การดำเนินการนี้จะล้างเวลาทำงานทั้งหมดของสัปดาห์นี้\nชื่อสถานที่ทำงาน ค่าจ้าง และค่าเดินทางจะยังคงอยู่\nดำเนินการต่อหรือไม่？",
    confirm_delete_all:"การดำเนินการนี้จะลบข้อมูลทั้งหมดและรหัสผ่าน\nไม่สามารถย้อนกลับได้\nดำเนินการต่อหรือไม่？",
    export_empty:"ไม่มีข้อมูลให้ส่งออก",export_success:"✅ ส่งออกข้อมูลแล้ว",
    import_invalid:"ไฟล์สำรองข้อมูลไม่ถูกต้อง\nกรุณาเลือกไฟล์ที่ส่งออกจาก Work Time Manager",
    import_version_error:"ไม่รองรับรูปแบบไฟล์สำรองข้อมูลนี้\nกรุณาใช้ไฟล์จาก Work Time Manager เวอร์ชันล่าสุด",
    import_confirm:"การนำเข้าจะเขียนทับข้อมูลปัจจุบัน\nดำเนินการต่อหรือไม่？",
    import_success:"✅ นำเข้าข้อมูลแล้ว กำลังโหลดหน้าใหม่…",
    import_read_error:"ไม่สามารถอ่านไฟล์ได้\nกรุณาเลือกไฟล์ JSON ที่ถูกต้อง"
  },
  si:{
    title:"Work Time Manager",sub:"කාර්ය වේලාව, වැටුප් සහ ප්‍රවාහන වියදම් කළමනාකරණය. බහු රැකියා සහ විදේශ සිසුන්ට.",
    limit:"සීමාව",hours:"පැය",wp_title:"සේවා ස්ථාන",add_wp:"සේවා ස්ථානයක් එක් කරන්න",
    sched_title:"සතිපතා කාර්යසටහන",result_title:"ප්‍රතිඵලය",
    total:"මුළු",limit_r:"සීමාව",remain:"ඉතිරි",over_h:"වැඩි",
    usage:"භාවිත",status:"තත්වය",ok:"හරි ✓",over_status:(h:string)=>`${h} පැය වැඩි`,
    days:["සඳු","අඟ","බදා","බ්‍රහ","සිකු","සෙන","ඉරි"],
    daily_title:"දෛනික මුළු",monthly_title:"මාසික මුළු",wp_total:"මුළු",day_total:"දෛනික",wp_ph:"සේවා ස්ථානයේ නම",
    lg_start:"ආරම්භ",lg_end:"අවසන්",lg_break:"විවේකය(මි)",lg_hours:"වැඩ පැය",
    lbl_start:"ආරම්භ",lbl_end:"අවසන්",lbl_break:"විවේකය",lbl_min:"මි",
    monthly_weeks:"සති",monthly_total_label:"මාසික මුළු පැය",monthly_avg_label:"සතිපතා සාමාන්‍ය",
    note:"මෙම මෙවලම යොමු කිරීම සඳහා පමණි. වීසා තත්වය සහ නවතම රෙගුලාසි පිළිබඳව නිල තොරතුරු පරීක්ෂා කරන්න.",
    month_cal_title:"මාසික දින දර්ශනය",ms_total:"මාසික මුළු",ms_limit:"මාසික සීමාව",ms_remain:"ඉතිරි",ms_over:"වැඩි",ms_usage:"මාසික භාවිත",
    prev_month:"◄ පෙර",next_month:"ඊළඟ ►",apply_next:"සතිපතා මාරුව ඊළඟ මාසයට යොදන්න",monthly_usage:"මාසික භාවිත",
    hourly_label:"පැයට වැටුප",transport_label:"ප්‍රවාහනය/දිනය",
    pw_setup_short:"මුරපදය අවම වශයෙන් අකුරු 4ක් විය යුතුය",pw_setup_mismatch:"මුරපද නොගැලපේ",
    pw_wrong_remaining:(n:string)=>`වැරදි මුරපදයකි (තව ${n} වතාවක්)`,
    pw_locked:(mmss:string)=>`උත්සාහයන් ඉතා වැඩිය. ${mmss} කින් නැවත උත්සාහ කරන්න.`,
    pw_changed:"මුරපදය වෙනස් කරන ලදී",pw_current_wrong:"වත්මන් මුරපදය වැරදිය",
    pw_new_short:"නව මුරපදය අවම වශයෙන් අකුරු 4ක් විය යුතුය",pw_new_mismatch:"නව මුරපද නොගැලපේ",
    confirm_reset_week:"මෙය මෙම සතියේ සියලුම වැඩ වේලාවන් ඉවත් කරයි.\nසේවා ස්ථානයේ නම, වැටුප සහ ප්‍රවාහන වියදම රැඳී පවතී.\nදිගටම කරගෙන යනවාද？",
    confirm_delete_all:"මෙය සියලුම දත්ත සහ මුරපදය මකා දමයි.\nමෙය අහෝසි කළ නොහැක.\nදිගටම කරගෙන යනවාද？",
    export_empty:"අපනයනය කිරීමට දත්ත නොමැත",export_success:"✅ දත්ත අපනයනය කරන ලදී",
    import_invalid:"වලංගු නොවන උපස්ථ ගොනුවකි.\nWork Time Manager වෙතින් අපනයනය කළ ගොනුවක් තෝරන්න.",
    import_version_error:"මෙම උපස්ථ ගොනු ආකෘතියට සහාය නොදක්වයි.\nනවතම Work Time Manager වෙතින් සාදන ලද ගොනුවක් භාවිත කරන්න.",
    import_confirm:"ආයාත කිරීම වත්මන් දත්ත උඩින් ලියනු ඇත.\nදිගටම කරගෙන යනවාද？",
    import_success:"✅ දත්ත ආයාත කරන ලදී. පිටුව නැවත පූරණය වෙමින්…",
    import_read_error:"ගොනුව කියවීමට නොහැකි විය.\nවලංගු JSON ගොනුවක් තෝරන්න."
  },
  bn:{
    title:"Work Time Manager",sub:"কর্মসময়, বেতন ও যাতায়াত খরচ একসাথে পরিচালনা। একাধিক কাজ ও বিদেশি শিক্ষার্থীদের জন্য.",
    limit:"সীমা",hours:"ঘণ্টা",wp_title:"কর্মস্থল",add_wp:"কর্মস্থল যোগ করুন",
    sched_title:"সাপ্তাহিক সময়সূচি",result_title:"ফলাফল",
    total:"মোট",limit_r:"সীমা",remain:"বাকি",over_h:"অতিরিক্ত",
    usage:"ব্যবহার",status:"অবস্থা",ok:"ঠিক আছে ✓",over_status:(h:string)=>`${h} ঘণ্টা বেশি`,
    days:["সোম","মঙ্গল","বুধ","বৃহ","শুক্র","শনি","রবি"],
    daily_title:"দৈনিক মোট",monthly_title:"মাসিক মোট",wp_total:"মোট",day_total:"দৈনিক",wp_ph:"কর্মস্থলের নাম",
    lg_start:"শুরু",lg_end:"শেষ",lg_break:"বিরতি(মি)",lg_hours:"কাজের সময়",
    lbl_start:"শুরু",lbl_end:"শেষ",lbl_break:"বিরতি",lbl_min:"মি",
    monthly_weeks:"সপ্তাহ",monthly_total_label:"মাসিক মোট ঘণ্টা",monthly_avg_label:"সাপ্তাহিক গড়",
    note:"এই টুলটি শুধুমাত্র রেফারেন্সের জন্য। ভিসা স্ট্যাটাস এবং সর্বশেষ নিয়মকানুন সম্পর্কে অফিসিয়াল তথ্য চেক করুন।",
    month_cal_title:"মাসিক ক্যালেন্ডার",ms_total:"মাসিক মোট",ms_limit:"মাসিক সীমা",ms_remain:"বাকি",ms_over:"বেশি",ms_usage:"মাসিক ব্যবহার",
    prev_month:"◄ আগের",next_month:"পরের ►",apply_next:"সাপ্তাহিক শিফট পরের মাসে প্রয়োগ",monthly_usage:"মাসিক ব্যবহার",
    hourly_label:"ঘণ্টাপ্রতি বেতন",transport_label:"যাতায়াত/দিন",
    pw_setup_short:"পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে",pw_setup_mismatch:"পাসওয়ার্ড মিলছে না",
    pw_wrong_remaining:(n:string)=>`ভুল পাসওয়ার্ড (বাকি ${n} বার)`,
    pw_locked:(mmss:string)=>`অনেকবার ভুল হয়েছে। ${mmss} পরে আবার চেষ্টা করুন।`,
    pw_changed:"পাসওয়ার্ড পরিবর্তন হয়েছে",pw_current_wrong:"বর্তমান পাসওয়ার্ড ভুল",
    pw_new_short:"নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে",pw_new_mismatch:"নতুন পাসওয়ার্ড মিলছে না",
    confirm_reset_week:"এতে এই সপ্তাহের সব শিফট সময় মুছে যাবে।\nকর্মস্থলের নাম, বেতন ও যাতায়াত খরচ থেকে যাবে।\nচালিয়ে যাবেন？",
    confirm_delete_all:"এতে সব ডেটা ও পাসওয়ার্ড মুছে যাবে।\nএটি ফিরিয়ে আনা যাবে না।\nচালিয়ে যাবেন？",
    export_empty:"এক্সপোর্ট করার মতো ডেটা নেই",export_success:"✅ ডেটা এক্সপোর্ট হয়েছে",
    import_invalid:"অবৈধ ব্যাকআপ ফাইল।\nWork Time Manager থেকে এক্সপোর্ট করা ফাইল বেছে নিন।",
    import_version_error:"এই ব্যাকআপ ফাইলের ফরম্যাট সমর্থিত নয়।\nসর্বশেষ Work Time Manager দিয়ে তৈরি ফাইল ব্যবহার করুন।",
    import_confirm:"ইম্পোর্ট করলে বর্তমান ডেটা মুছে নতুন ডেটা বসবে।\nচালিয়ে যাবেন？",
    import_success:"✅ ডেটা ইম্পোর্ট হয়েছে। পৃষ্ঠা পুনরায় লোড হচ্ছে…",
    import_read_error:"ফাইল পড়া যায়নি।\nসঠিক JSON ফাইল বেছে নিন।"
  },
  hi:{
    title:"Work Time Manager",sub:"कार्य समय, वेतन और परिवहन खर्च एक साथ प्रबंधन। कई नौकरियों और विदेशी छात्रों के लिए.",
    limit:"सीमा",hours:"घंटे",wp_title:"कार्यस्थल",add_wp:"कार्यस्थल जोड़ें",
    sched_title:"साप्ताहिक अनुसूची",result_title:"परिणाम",
    total:"कुल",limit_r:"सीमा",remain:"बचे",over_h:"अतिरिक्त",
    usage:"उपयोग",status:"स्थिति",ok:"ठीक है ✓",over_status:(h:string)=>`${h} घंटे अधिक`,
    days:["सोम","मंगल","बुध","गुरु","शुक्र","शनि","रवि"],
    daily_title:"दैनिक कुल",monthly_title:"मासिक कुल",wp_total:"कुल",day_total:"दैनिक",wp_ph:"कार्यस्थल का नाम",
    lg_start:"शुरू",lg_end:"खत्म",lg_break:"विराम(मि)",lg_hours:"काम के घंटे",
    lbl_start:"शुरू",lbl_end:"खत्म",lbl_break:"विराम",lbl_min:"मि",
    monthly_weeks:"सप्ताह",monthly_total_label:"मासिक कुल घंटे",monthly_avg_label:"साप्ताहिक औसत",
    note:"यह टूल केवल संदर्भ के लिए है। कृपया वीज़ा स्थिति और नवीनतम नियमों के बारे में आधिकारिक जानकारी की जांच करें।",
    month_cal_title:"मासिक कैलेंडर",ms_total:"मासिक कुल",ms_limit:"मासिक सीमा",ms_remain:"बचे",ms_over:"अतिरिक्त",ms_usage:"मासिक उपयोग",
    prev_month:"◄ पिछला",next_month:"अगला ►",apply_next:"साप्ताहिक शिफ्ट अगले महीने लागू करें",monthly_usage:"मासिक उपयोग",
    hourly_label:"प्रति घंटा वेतन",transport_label:"परिवहन/दिन",
    pw_setup_short:"पासवर्ड कम से कम 4 अक्षर का होना चाहिए",pw_setup_mismatch:"पासवर्ड मेल नहीं खाते",
    pw_wrong_remaining:(n:string)=>`गलत पासवर्ड (${n} प्रयास शेष)`,
    pw_locked:(mmss:string)=>`बहुत बार गलत प्रयास हुआ। ${mmss} बाद फिर कोशिश करें।`,
    pw_changed:"पासवर्ड बदल दिया गया",pw_current_wrong:"मौजूदा पासवर्ड गलत है",
    pw_new_short:"नया पासवर्ड कम से कम 4 अक्षर का होना चाहिए",pw_new_mismatch:"नए पासवर्ड मेल नहीं खाते",
    confirm_reset_week:"इससे इस सप्ताह के सभी शिफ्ट समय मिट जाएंगे।\nकार्यस्थल का नाम, वेतन और परिवहन खर्च बने रहेंगे।\nजारी रखें？",
    confirm_delete_all:"इससे सभी डेटा और पासवर्ड मिट जाएंगे।\nयह पूर्ववत नहीं किया जा सकता।\nजारी रखें？",
    export_empty:"निर्यात के लिए कोई डेटा नहीं है",export_success:"✅ डेटा निर्यात हो गया",
    import_invalid:"अमान्य बैकअप फ़ाइल।\nकृपया Work Time Manager से निर्यातित फ़ाइल चुनें।",
    import_version_error:"यह बैकअप फ़ाइल फॉर्मेट समर्थित नहीं है।\nकृपया नवीनतम Work Time Manager से बनी फ़ाइल का उपयोग करें।",
    import_confirm:"आयात करने पर मौजूदा डेटा अधिलेखित हो जाएगा।\nजारी रखें？",
    import_success:"✅ डेटा आयात हो गया। पेज रीलोड हो रहा है…",
    import_read_error:"फ़ाइल पढ़ी नहीं जा सकी।\nकृपया सही JSON फ़ाइल चुनें।"
  },
  es:{
    title:"Work Time Manager",sub:"Gestiona horas, salario y transporte. Para múltiples empleos y estudiantes internacionales.",
    limit:"Límite",hours:"horas",wp_title:"Lugares de Trabajo",add_wp:"Añadir Lugar",
    sched_title:"Horario Semanal",result_title:"Resultado",
    total:"Total",limit_r:"Límite",remain:"Restantes",over_h:"Excedidas",
    usage:"Uso",status:"Estado",ok:"OK ✓",over_status:(h:string)=>`${h} horas de exceso`,
    days:["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"],
    daily_title:"Total Diario",monthly_title:"Total Mensual",wp_total:"Total",day_total:"Diario",wp_ph:"Nombre del lugar",
    lg_start:"Inicio",lg_end:"Fin",lg_break:"Descanso(min)",lg_hours:"Horas trabajadas",
    lbl_start:"Inicio",lbl_end:"Fin",lbl_break:"Descanso",lbl_min:"min",
    monthly_weeks:"sem",monthly_total_label:"Horas totales del mes",monthly_avg_label:"Prom. semanal",
    note:"Esta herramienta es solo de referencia. Por favor, consulte la información oficial sobre el estado de su visa y las últimas regulaciones.",
    month_cal_title:"Calendario Mensual",ms_total:"Total Mensual",ms_limit:"Límite Mensual",ms_remain:"Restantes",ms_over:"Excedidas",ms_usage:"Uso Mensual",
    prev_month:"◄ Anterior",next_month:"Siguiente ►",apply_next:"Aplicar turnos semanales al mes siguiente",monthly_usage:"Uso Mensual",
    hourly_label:"Salario por hora",transport_label:"Transporte/día",
    pw_setup_short:"La contraseña debe tener al menos 4 caracteres",pw_setup_mismatch:"Las contraseñas no coinciden",
    pw_wrong_remaining:(n:string)=>`Contraseña incorrecta (${n} intentos restantes)`,
    pw_locked:(mmss:string)=>`Demasiados intentos. Vuelve a intentarlo en ${mmss}.`,
    pw_changed:"Contraseña cambiada",pw_current_wrong:"La contraseña actual es incorrecta",
    pw_new_short:"La nueva contraseña debe tener al menos 4 caracteres",pw_new_mismatch:"Las nuevas contraseñas no coinciden",
    confirm_reset_week:"Esto borrará todos los horarios de esta semana.\nLos nombres de los lugares de trabajo, el salario y el transporte se mantendrán.\n¿Continuar?",
    confirm_delete_all:"Esto eliminará todos los datos y tu contraseña.\nEsta acción no se puede deshacer.\n¿Continuar?",
    export_empty:"No hay datos para exportar",export_success:"✅ Datos exportados",
    import_invalid:"Archivo de respaldo no válido.\nSelecciona un archivo exportado desde Work Time Manager.",
    import_version_error:"Este formato de archivo de respaldo no es compatible.\nUsa un archivo exportado desde la versión más reciente de Work Time Manager.",
    import_confirm:"La importación sobrescribirá los datos actuales.\n¿Continuar?",
    import_success:"✅ Datos importados. Recargando la página…",
    import_read_error:"No se pudo leer el archivo.\nSelecciona un archivo JSON válido."
  },
  pt:{
    title:"Work Time Manager",sub:"Gerencie horas, salário e transporte. Para múltiplos empregos e estudantes internacionais.",
    limit:"Limite",hours:"horas",wp_title:"Locais de Trabalho",add_wp:"Adicionar Local",
    sched_title:"Agenda Semanal",result_title:"Resultado",
    total:"Total",limit_r:"Limite",remain:"Restantes",over_h:"Excedidas",
    usage:"Uso",status:"Status",ok:"OK ✓",over_status:(h:string)=>`${h} horas a mais`,
    days:["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"],
    daily_title:"Total Diário",monthly_title:"Total Mensal",wp_total:"Total",day_total:"Diário",wp_ph:"Nome do local",
    lg_start:"Início",lg_end:"Fim",lg_break:"Pausa(min)",lg_hours:"Horas trabalhadas",
    lbl_start:"Início",lbl_end:"Fim",lbl_break:"Pausa",lbl_min:"min",
    monthly_weeks:"sem",monthly_total_label:"Horas totais do mês",monthly_avg_label:"Média semanal",
    note:"Esta ferramenta é apenas para referência. Por favor, verifique as informações oficiais sobre o status do seu visto e as regulamentações mais recentes.",
    month_cal_title:"Calendário Mensal",ms_total:"Total Mensal",ms_limit:"Limite Mensal",ms_remain:"Restantes",ms_over:"Excedidas",ms_usage:"Uso Mensal",
    prev_month:"◄ Anterior",next_month:"Próximo ►",apply_next:"Aplicar turnos semanais ao próximo mês",monthly_usage:"Uso Mensal",
    hourly_label:"Salário por hora",transport_label:"Transporte/dia",
    pw_setup_short:"A senha deve ter pelo menos 4 caracteres",pw_setup_mismatch:"As senhas não coincidem",
    pw_wrong_remaining:(n:string)=>`Senha incorreta (${n} tentativas restantes)`,
    pw_locked:(mmss:string)=>`Muitas tentativas. Tente novamente em ${mmss}.`,
    pw_changed:"Senha alterada",pw_current_wrong:"A senha atual está incorreta",
    pw_new_short:"A nova senha deve ter pelo menos 4 caracteres",pw_new_mismatch:"As novas senhas não coincidem",
    confirm_reset_week:"Isso apagará todos os horários desta semana.\nNomes dos locais de trabalho, salário e transporte serão mantidos.\nContinuar?",
    confirm_delete_all:"Isso apagará todos os dados e sua senha.\nEsta ação não pode ser desfeita.\nContinuar?",
    export_empty:"Não há dados para exportar",export_success:"✅ Dados exportados",
    import_invalid:"Arquivo de backup inválido.\nSelecione um arquivo exportado do Work Time Manager.",
    import_version_error:"Este formato de arquivo de backup não é compatível.\nUse um arquivo exportado da versão mais recente do Work Time Manager.",
    import_confirm:"A importação substituirá os dados atuais.\nContinuar?",
    import_success:"✅ Dados importados. Recarregando a página…",
    import_read_error:"Não foi possível ler o arquivo.\nSelecione um arquivo JSON válido."
  }
};

const WP_COLORS = ["#1a6fc4","#e05c5c","#1a8f4a","#e07c1a","#7c3aed","#0891b2","#be185d","#15803d","#b45309","#4338ca"];

const STORAGE_KEY = 'wtm_v1';

// monthlyData: Record<wpId, Record<"YYYY-MM-DD", {start,end,brk} | {shifts:[{start,end,brk}]}>>  
type MonthCell = { start:string; end:string; brk:number; shifts?:Array<{start:string;end:string;brk:number}> };
// Weekly cell: supports multiple shifts (中抜け勤務)
type WeekShift = { start:string; end:string; brk:number };
type WeekCell = { shifts: WeekShift[] };
function saveToStorage(s: { lang: string; wpList: Array<{id:number;name:string;color:string}>; wpNextId: number; data: Record<number, Array<WeekCell>>; limit: number; monthlyData: Record<number, Record<string, MonthCell>>; wpHourlyRate: Record<number,number>; wpTransport: Record<number,number> }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      lang: s.lang,
      wpList: s.wpList,
      wpNextId: s.wpNextId,
      data: s.data,
      limit: s.limit,
      monthlyData: s.monthlyData,
      wpHourlyRate: s.wpHourlyRate,
      wpTransport: s.wpTransport
    }));
  } catch(e) { /* ignore */ }
}

function loadFromStorage(): { lang:string; wpList:Array<{id:number;name:string;color:string}>; wpNextId:number; data:Record<number,Array<WeekCell|{start:string;end:string;brk:number}>>; limit:number; monthlyData?:Record<number,Record<string,MonthCell>>; wpHourlyRate?:Record<number,number>; wpTransport?:Record<number,number> } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    return JSON.parse(raw);
  } catch(e) { return null; }
}


// ── NextR shared language key ──────────────────────────────────────────────
// Shared across NextR tools (e.g. Wallet Manager). Priority on load:
// 1) nextr.language  2) this app's own saved language (wtm_v1.lang)  3) 'ja'
const NEXTR_LANG_KEY = 'nextr.language';

function getCurrentLang(): string {
  try {
    const shared = localStorage.getItem(NEXTR_LANG_KEY);
    if (shared && T[shared]) return shared;
  } catch (e) { /* ignore */ }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && d.lang && T[d.lang]) return d.lang;
    }
  } catch (e) { /* ignore */ }
  return 'ja';
}

function setNextrLanguage(lang: string) {
  try { localStorage.setItem(NEXTR_LANG_KEY, lang); } catch (e) { /* ignore */ }
}

const PW_KEY = 'wtm_pw_hash';
const PW_ATTEMPTS_KEY = 'wtm_pw_attempts';
const PW_LOCKOUT_KEY = 'wtm_pw_lockout_until';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Simple hash (not cryptographically secure, but sufficient for local protection)
async function hashPassword(pw: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pw + 'wtm_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getStoredHash(): string | null {
  return localStorage.getItem(PW_KEY);
}

function getAttempts(): number {
  return parseInt(localStorage.getItem(PW_ATTEMPTS_KEY) || '0', 10);
}

function setAttempts(n: number) {
  localStorage.setItem(PW_ATTEMPTS_KEY, String(n));
}

function getLockoutUntil(): number {
  return parseInt(localStorage.getItem(PW_LOCKOUT_KEY) || '0', 10) || 0;
}

function setLockoutUntil(ts: number) {
  localStorage.setItem(PW_LOCKOUT_KEY, String(ts));
}

function clearLockout() {
  localStorage.removeItem(PW_LOCKOUT_KEY);
  setAttempts(0);
}

function formatMMSS(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function PasswordGate({ children }: { children: React.ReactNode }) {
  const lang = getCurrentLang();
  const tp = T[lang];
  const [authState, setAuthState] = useState<'checking'|'setup'|'login'|'authenticated'>('checking');
  const [pwError, setPwError] = useState('');
  const [lockedUntil, setLockedUntilState] = useState<number>(0);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const hash = getStoredHash();
    const lu = getLockoutUntil();
    if (lu && lu > Date.now()) {
      setLockedUntilState(lu);
    } else if (lu) {
      clearLockout();
    }
    if (!hash) {
      setAuthState('setup');
    } else {
      setAuthState('login');
    }
  }, []);

  // Live countdown while locked; auto-resets attempts once the lock expires
  useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= lockedUntil) {
        clearLockout();
        setLockedUntilState(0);
        setPwError('');
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const isLocked = lockedUntil > 0 && now < lockedUntil;

  const handleSetup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const pw = (form.elements.namedItem('pw') as HTMLInputElement).value;
    const pw2 = (form.elements.namedItem('pw2') as HTMLInputElement).value;
    if (pw.length < 4) { setPwError(tp.pw_setup_short); return; }
    if (pw !== pw2) { setPwError(tp.pw_setup_mismatch); return; }
    const hash = await hashPassword(pw);
    localStorage.setItem(PW_KEY, hash);
    clearLockout();
    setAuthState('authenticated');
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLocked) {
      setPwError(tp.pw_locked(formatMMSS(lockedUntil - Date.now())));
      return;
    }
    const attempts = getAttempts();
    const form = e.currentTarget;
    const pw = (form.elements.namedItem('pw') as HTMLInputElement).value;
    const hash = await hashPassword(pw);
    const stored = getStoredHash();
    if (hash === stored) {
      clearLockout();
      setAuthState('authenticated');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_DURATION_MS;
        setLockoutUntil(until);
        setNow(Date.now());
        setLockedUntilState(until);
        setPwError(tp.pw_locked(formatMMSS(LOCKOUT_DURATION_MS)));
      } else {
        setPwError(tp.pw_wrong_remaining(String(MAX_ATTEMPTS - newAttempts)));
      }
    }
  };

  // Auth screens
  if (authState === 'checking') {
    return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'linear-gradient(135deg,#e0f2fe,#f0fdf4)'}}><div style={{fontSize:'1.2rem',color:'#6b7280'}}>Loading...</div></div>;
  }
  if (authState === 'setup') {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'linear-gradient(135deg,#e0f2fe,#f0fdf4)',padding:'20px'}}>
        <div style={{background:'#fff',borderRadius:'20px',padding:'32px',maxWidth:'360px',width:'100%',boxShadow:'0 8px 32px rgba(0,0,0,.1)'}}>
          <h2 style={{fontSize:'1.2rem',fontWeight:800,color:'#1a6fc4',marginBottom:'8px',textAlign:'center'}}>🔐 パスワード設定</h2>
          <p style={{fontSize:'.8rem',color:'#6b7280',textAlign:'center',marginBottom:'20px'}}>勤務情報を保護するため、<br/>パスワードを設定してください。</p>
          <form onSubmit={handleSetup}>
            <input name="pw" type="password" placeholder="パスワード (4文字以上)" style={{width:'100%',padding:'12px',borderRadius:'10px',border:'1.5px solid #d1d5db',fontSize:'.9rem',marginBottom:'10px',outline:'none'}} autoFocus />
            <input name="pw2" type="password" placeholder="パスワード (確認)" style={{width:'100%',padding:'12px',borderRadius:'10px',border:'1.5px solid #d1d5db',fontSize:'.9rem',marginBottom:'10px',outline:'none'}} />
            {pwError && <p style={{color:'#dc2626',fontSize:'.75rem',marginBottom:'8px'}}>{pwError}</p>}
            <button type="submit" style={{width:'100%',padding:'12px',borderRadius:'10px',border:'none',background:'#1a6fc4',color:'#fff',fontSize:'.9rem',fontWeight:700,cursor:'pointer'}}>設定する</button>
          </form>
        </div>
      </div>
    );
  }
  if (authState === 'login') {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'linear-gradient(135deg,#e0f2fe,#f0fdf4)',padding:'20px'}}>
        <div style={{background:'#fff',borderRadius:'20px',padding:'32px',maxWidth:'360px',width:'100%',boxShadow:'0 8px 32px rgba(0,0,0,.1)'}}>
          <h2 style={{fontSize:'1.2rem',fontWeight:800,color:'#1a6fc4',marginBottom:'8px',textAlign:'center'}}>🔐 Work Time Manager</h2>
          <p style={{fontSize:'.8rem',color:'#6b7280',textAlign:'center',marginBottom:'20px'}}>パスワードを入力してください</p>
          <form onSubmit={handleLogin}>
            <input name="pw" type="password" placeholder="パスワード" style={{width:'100%',padding:'12px',borderRadius:'10px',border:'1.5px solid #d1d5db',fontSize:'.9rem',marginBottom:'10px',outline:'none'}} autoFocus disabled={isLocked} />
            {isLocked ? (
              <p style={{color:'#dc2626',fontSize:'.75rem',marginBottom:'8px',whiteSpace:'pre-line'}}>{tp.pw_locked(formatMMSS(lockedUntil - now))}</p>
            ) : (
              pwError && <p style={{color:'#dc2626',fontSize:'.75rem',marginBottom:'8px',whiteSpace:'pre-line'}}>{pwError}</p>
            )}
            <button type="submit" style={{width:'100%',padding:'12px',borderRadius:'10px',border:'none',background: isLocked ? '#9ca3af' : '#1a6fc4',color:'#fff',fontSize:'.9rem',fontWeight:700,cursor: isLocked ? 'not-allowed' : 'pointer'}} disabled={isLocked}>ログイン</button>
          </form>
        </div>
      </div>
    );
  }
  // authenticated
  return <>{children}</>;
}

function WorkTimeManagerInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIosInstallGuide, setIsIosInstallGuide] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    const dismissed = localStorage.getItem('wtm_install_banner_dismissed') === '1';
    if (dismissed) return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    setIsIosInstallGuide(isIos);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    const handleAppInstalled = () => {
      setShowInstallBanner(false);
      setInstallPrompt(null);
      localStorage.setItem('wtm_install_banner_dismissed', '1');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // iPhone/iPad cannot open the native install dialog from a web button,
    // so show a short manual guide instead.
    setShowInstallBanner(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const closeInstallBanner = () => {
    localStorage.setItem('wtm_install_banner_dismissed', '1');
    setShowInstallBanner(false);
  };

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        localStorage.setItem('wtm_install_banner_dismissed', '1');
        setShowInstallBanner(false);
      }
      setInstallPrompt(null);
      return;
    }

    if (isIosInstallGuide) {
      window.alert('画面下の共有ボタンを押し、「ホーム画面に追加」を選んでください。');
      return;
    }

    window.alert('ブラウザ右上のメニュー（︙）から「ホーム画面に追加」または「アプリをインストール」を選んでください。');
  };

  const stateRef = useRef<{
    lang: string;
    wpList: Array<{id:number;name:string;color:string}>;
    wpNextId: number;
    data: Record<number, Array<WeekCell>>; // weekly: wpId -> day[0-6] -> {shifts:[{start,end,brk}]}
    limit: number;
    monthlyData: Record<number, Record<string, MonthCell>>;
    monthYear: { year: number; month: number }; // 0-based month
    wpHourlyRate: Record<number,number>; // wpId -> hourly rate (yen)
    wpTransport: Record<number,number>; // wpId -> daily transport cost (yen)
  }>({
    lang: 'ja',
    wpList: [],
    wpNextId: 1,
    data: {},
    limit: 28,
    monthlyData: {},
    monthYear: { year: new Date().getFullYear(), month: new Date().getMonth() },
    wpHourlyRate: {},
    wpTransport: {}
  });

  useEffect(() => {
    const s = stateRef.current;

    // ── SAVE INDICATOR ──
    let saveTimer: ReturnType<typeof setTimeout> | null = null;
    const indicator = document.createElement('div');
    indicator.className = 'save-indicator';
    indicator.innerHTML = '💾 <span id="saveMsg">保存中...</span>';
    document.body.appendChild(indicator);

    function showSaved() {
      indicator.classList.remove('saved');
      indicator.classList.add('show');
      const msg = document.getElementById('saveMsg');
      if(msg) msg.textContent = '保存中...';
      if(saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        indicator.classList.add('saved');
        const m = document.getElementById('saveMsg');
        if(m) m.textContent = '✓ 保存済み';
        saveTimer = setTimeout(() => indicator.classList.remove('show'), 1500);
      }, 400);
    }

    function persistAll() {
      const limitEl = document.getElementById('limitH') as HTMLInputElement;
      s.limit = parseFloat(limitEl?.value||'28')||28;
      saveToStorage(s);
      showSaved();
    }

    // ── SALARY CALC (with night premium) ──
    function calcMonthlySalary(wpId:number): {base:number;night:number;total:number;hours:number;nightHours:number} {
      const rate = s.wpHourlyRate[wpId]||0;
      if(!rate) return {base:0,night:0,total:0,hours:0,nightHours:0};
      const { year, month } = s.monthYear;
      const daysInMonth = new Date(year, month+1, 0).getDate();
      let totalHrs = 0;
      let nightHrs = 0;
      for(let d=1; d<=daysInMonth; d++) {
        const dk = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const cell = s.monthlyData[wpId]?.[dk];
        if(!cell) continue;
        if(cell.shifts && cell.shifts.length>0) {
          cell.shifts.forEach(sh=>{
            totalHrs+=computeHours(sh.start,sh.end,sh.brk);
            nightHrs+=computeNightHours(sh.start,sh.end,sh.brk);
          });
        } else {
          totalHrs+=computeHours(cell.start,cell.end,cell.brk);
          nightHrs+=computeNightHours(cell.start,cell.end,cell.brk);
        }
      }
      const base = Math.round(totalHrs*rate);
      const night = Math.round(nightHrs*rate*0.25); // 25% premium on night hours
      return {base, night, total: base+night, hours: totalHrs, nightHours: nightHrs};
    }

    function renderSalaryCard() {
      const el = document.getElementById('salaryCard');
      if(!el) return;
      const hasRate = s.wpList.some(wp=>s.wpHourlyRate[wp.id]>0);
      if(!hasRate) { el.style.display='none'; return; }
      el.style.display='';
      const { year, month } = s.monthYear;
      const monthStr = `${year}年${month+1}月`;
      let grandTotal=0;
      let totalTransport=0;
      let rows='';
      s.wpList.forEach(wp=>{
        const rate=s.wpHourlyRate[wp.id]||0;
        if(!rate) return;
        const result = calcMonthlySalary(wp.id);
        const transport = s.wpTransport[wp.id]||0;
        const workDays = calcMonthlyWorkDays(wp.id);
        const transportTotal = transport * workDays;
        const wpTotal = result.total + transportTotal;
        grandTotal += wpTotal;
        totalTransport += transportTotal;
        const nightLine = result.night>0
          ? `<div class="salary-night">深夜手当(22-5時): ${fmt(result.nightHours)}h × 25% = +${result.night.toLocaleString()}円</div>`
          : '';
        const transportLine = transportTotal>0
          ? `<div class="salary-transport">交通費: ${transport.toLocaleString()}円/日 × ${workDays}日 = +${transportTotal.toLocaleString()}円</div>`
          : '';
        rows+=`<div class="salary-row-card">
          <div class="salary-row-header">
            <span class="salary-wp-name" style="color:${wp.color}">${esc(wp.name||'?')}</span>
          </div>
          <div class="salary-row-detail">
            <span class="salary-rate">${rate.toLocaleString()}円/時 × ${fmt(result.hours)}h</span>
          </div>
          ${nightLine}
          ${transportLine}
          <div class="salary-row-amount">${wpTotal.toLocaleString()}円</div>
        </div>`;
      });
      // Update summary header total
      const totalEl = document.getElementById('salaryTotalAmount');
      if(totalEl) totalEl.textContent = grandTotal.toLocaleString()+'円';
      // Update detail
      const el2=document.getElementById('salaryCardInner');
      if(el2) el2.innerHTML=`
        <div class="salary-month">${monthStr} 予想給与詳細</div>
        <div class="salary-rows">${rows}</div>
        <div class="salary-summary">
          <div class="salary-sum-item total"><span class="salary-sum-label">総合計</span><span class="salary-sum-val">${grandTotal.toLocaleString()}円</span></div>
          ${totalTransport>0?`<div class="salary-sum-item transport"><span class="salary-sum-label">うち交通費</span><span class="salary-sum-val">${totalTransport.toLocaleString()}円</span></div>`:''}
        </div>`;
    }

    // Count work days in the month for a workplace
    function calcMonthlyWorkDays(wpId:number): number {
      const { year, month } = s.monthYear;
      const daysInMonth = new Date(year, month+1, 0).getDate();
      let count = 0;
      for(let d=1; d<=daysInMonth; d++) {
        const dk = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const cell = s.monthlyData[wpId]?.[dk];
        if(!cell) continue;
        let hrs = 0;
        if(cell.shifts && cell.shifts.length>0) {
          cell.shifts.forEach(sh=>{ hrs+=computeHours(sh.start,sh.end,sh.brk); });
        } else {
          hrs = computeHours(cell.start,cell.end,cell.brk);
        }
        if(hrs>0) count++;
      }
      return count;
    }
    function calcMonthlyHours(wpId:number): number {
      const { year, month } = s.monthYear;
      const daysInMonth = new Date(year, month+1, 0).getDate();
      let total = 0;
      for(let d=1; d<=daysInMonth; d++) {
        const dk = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const cell = s.monthlyData[wpId]?.[dk];
        if(!cell) continue;
        if(cell.shifts && cell.shifts.length>0) {
          cell.shifts.forEach(sh=>{ total+=computeHours(sh.start,sh.end,sh.brk); });
        } else {
          total+=computeHours(cell.start,cell.end,cell.brk);
        }
      }
      return total;
    }

    // ── COPY SCHEDULE POPUP ──
    function openCopySchedulePopup() {
      const { year, month } = s.monthYear;
      const daysInMonth = new Date(year, month+1, 0).getDate();
      const dayNames = ['日','月','火','水','木','金','土'];
      let text = `勤怠スケジュール（${year}年${month+1}月）\n`;
      text += '='.repeat(50)+'\n\n';
      s.wpList.forEach(wp=>{
        text += `■ ${wp.name}\n`;
        text += '-'.repeat(40)+'\n';
        text += '日付\t\t開始\t終了\t休憩\t実働\n';
        for(let d=1; d<=daysInMonth; d++) {
          const dk = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const cell = s.monthlyData[wp.id]?.[dk];
          if(!cell) continue;
          const shifts = (cell.shifts && cell.shifts.length>0) ? cell.shifts : [{start:cell.start,end:cell.end,brk:cell.brk}];
          const hasData = shifts.some((sh:any)=>sh.start&&sh.end);
          if(!hasData) continue;
          const dow = new Date(year, month, d).getDay();
          shifts.forEach((sh:any, si:number)=>{
            if(!sh.start||!sh.end) return;
            const hrs = computeHours(sh.start, sh.end, sh.brk||0);
            const dateStr = si===0 ? `${month+1}/${d}(${dayNames[dow]})` : '\t';
            text += `${dateStr}\t${sh.start}\t${sh.end}\t${sh.brk||0}分\t${fmt(hrs)}h\n`;
          });
        }
        text += '\n';
      });
      // Create overlay popup
      const overlay = document.createElement('div');
      overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px';
      const popup = document.createElement('div');
      popup.style.cssText='background:#fff;border-radius:16px;max-width:600px;width:100%;max-height:80vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.3)';
      popup.innerHTML=`
        <div style="padding:16px 20px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center">
          <h3 style="margin:0;font-size:1rem;font-weight:800;color:#1e3a5f">📋 勤怠スケジュール</h3>
          <button id="copyPopupClose" style="background:none;border:none;font-size:1.2rem;cursor:pointer;color:#6b7280">✕</button>
        </div>
        <div style="padding:16px 20px;overflow-y:auto;flex:1">
          <textarea id="copyScheduleText" readonly style="width:100%;min-height:300px;font-family:monospace;font-size:.78rem;border:1.5px solid #d1d5db;border-radius:8px;padding:12px;resize:vertical;background:#f9fafb;color:#1f2937"></textarea>
        </div>
        <div style="padding:12px 20px;border-top:1px solid #e5e7eb;display:flex;gap:10px;justify-content:flex-end">
          <button id="copyScheduleBtn" style="background:#2563eb;color:#fff;border:none;border-radius:8px;padding:8px 20px;font-size:.82rem;font-weight:700;cursor:pointer">📋 コピー</button>
          <button id="copyPopupCloseBtn" style="background:#f3f4f6;color:#374151;border:1.5px solid #d1d5db;border-radius:8px;padding:8px 20px;font-size:.82rem;font-weight:700;cursor:pointer">閉じる</button>
        </div>`;
      overlay.appendChild(popup);
      document.body.appendChild(overlay);
      const ta = popup.querySelector('#copyScheduleText') as HTMLTextAreaElement;
      if(ta) ta.value = text;
      // Events
      const close = ()=>overlay.remove();
      overlay.addEventListener('click',(e)=>{ if(e.target===overlay) close(); });
      popup.querySelector('#copyPopupClose')?.addEventListener('click', close);
      popup.querySelector('#copyPopupCloseBtn')?.addEventListener('click', close);
      popup.querySelector('#copyScheduleBtn')?.addEventListener('click', ()=>{
        if(ta) { ta.select(); navigator.clipboard.writeText(ta.value).then(()=>{
          const btn = popup.querySelector('#copyScheduleBtn') as HTMLButtonElement;
          if(btn){ btn.textContent='✅ コピーしました'; setTimeout(()=>{ btn.textContent='📋 コピー'; },1500); }
        }); }
      });
    }

    function fmt(n: number): string {
      if(n === Math.floor(n)) return n.toFixed(1);
      return parseFloat(n.toFixed(2)).toString();
    }
    function esc(str: string): string {
      return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
    function computeHours(start: string, end: string, brkMin: number): number {
      if(!start||!end) return 0;
      const [sh,sm]=start.split(':').map(Number);
      const [eh,em]=end.split(':').map(Number);
      let mins = (eh*60+em)-(sh*60+sm);
      if(mins<0) mins+=24*60; // overnight only when end time is earlier than start time
      mins -= (parseFloat(String(brkMin))||0);
      return Math.max(0, mins/60);
    }

    // Deep night hours (22:00-05:00) calculation for 25% premium
    function computeNightHours(start: string, end: string, brkMin: number): number {
      if(!start||!end) return 0;
      const [sh,sm]=start.split(':').map(Number);
      const [eh,em]=end.split(':').map(Number);
      let startMin = sh*60+sm;
      let endMin = eh*60+em;
      if(endMin<startMin) endMin+=24*60; // overnight only when end time is earlier than start time
      const totalWork = endMin - startMin - (parseFloat(String(brkMin))||0);
      if(totalWork<=0) return 0;
      // Night ranges: 0:00-5:00 (0-300) and 22:00-29:00 (1320-1740 for overnight)
      let nightMins = 0;
      // Check overlap with 22:00(1320) - 29:00(next day 5:00=1740)
      const nightStart1 = 1320; // 22:00
      const nightEnd1 = 1740; // 29:00 (next day 05:00)
      const nightStart2 = 0; // 00:00
      const nightEnd2 = 300; // 05:00
      // Overlap with 22:00-29:00 range
      const overlapA = Math.max(0, Math.min(endMin, nightEnd1) - Math.max(startMin, nightStart1));
      // Overlap with 0:00-5:00 range (only if shift starts before 5:00)
      const overlapB = Math.max(0, Math.min(endMin, nightEnd2) - Math.max(startMin, nightStart2));
      nightMins = overlapA + overlapB;
      // Subtract break proportionally from night hours
      const brkMins = parseFloat(String(brkMin))||0;
      if(brkMins>0 && (endMin-startMin)>0) {
        const brkRatio = brkMins / (endMin - startMin);
        nightMins = Math.max(0, nightMins - nightMins*brkRatio);
      }
      return nightMins/60;
    }

    // ── PARSE TIME TEXT (HH:MM or H:MM or HHMM) ──
    function parseTimeText(v: string): string {
      const raw = v.trim().replace(/[^0-9:]/g,'');
      if(!raw) return '';
      // already HH:MM
      if(/^\d{1,2}:\d{2}$/.test(raw)) {
        const [h,m]=raw.split(':').map(Number);
        if(h>=0&&h<=23&&m>=0&&m<=59) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
        return '';
      }
      // 4-digit HHMM
      if(/^\d{4}$/.test(raw)) {
        const h=parseInt(raw.slice(0,2)); const m=parseInt(raw.slice(2));
        if(h>=0&&h<=23&&m>=0&&m<=59) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
        return '';
      }
      // 3-digit HMM
      if(/^\d{3}$/.test(raw)) {
        const h=parseInt(raw.slice(0,1)); const m=parseInt(raw.slice(1));
        if(h>=0&&h<=9&&m>=0&&m<=59) return `0${h}:${String(m).padStart(2,'0')}`;
        return '';
      }
      return '';
    }

    // Helper: get WeekCell as normalized shifts array
    function getWeekCellShifts(wpId:number, dayIdx:number): WeekShift[] {
      if(!s.data[wpId]) s.data[wpId]=Array.from({length:7},()=>({shifts:[{start:'',end:'',brk:0}]}));
      const cell = s.data[wpId][dayIdx] as any;
      if(cell && cell.shifts && Array.isArray(cell.shifts) && cell.shifts.length>0) return cell.shifts;
      // Migrate legacy {start,end,brk} format
      if(cell && (cell.start!==undefined || cell.end!==undefined)) {
        const migrated: WeekShift[] = [{start:cell.start||'',end:cell.end||'',brk:cell.brk||0}];
        s.data[wpId][dayIdx] = {shifts: migrated};
        return migrated;
      }
      const empty: WeekShift[] = [{start:'',end:'',brk:0}];
      s.data[wpId][dayIdx] = {shifts: empty};
      return empty;
    }
    function saveWeekCellShifts(wpId:number, dayIdx:number, shifts:WeekShift[]) {
      if(!s.data[wpId]) s.data[wpId]=Array.from({length:7},()=>({shifts:[{start:'',end:'',brk:0}]}));
      s.data[wpId][dayIdx] = {shifts};
    }
    function weekCellTotalHours(wpId:number, dayIdx:number): number {
      const shifts = getWeekCellShifts(wpId, dayIdx);
      return shifts.reduce((sum,sh)=>sum+computeHours(sh.start,sh.end,sh.brk),0);
    }

    function renderGrid() {
      const t = T[s.lang];
      const limitEl = document.getElementById('limitH') as HTMLInputElement;
      const limit = parseFloat(limitEl?.value||'28')||28;
      // Fixed cell width so inputs are always tappable on mobile (horizontal scroll)
      const cols = `56px repeat(7,96px) 60px`;
      let html = `<div class="schedule-grid">`;
      html+=`<div class="sg-head" style="grid-template-columns:${cols}">`;
      html+=`<div class="sg-corner">${t.wp_title}</div>`;
      for(let d=0;d<7;d++){
        const cls=d===5?'sat-head':d===6?'sun-head':'';
        html+=`<div class="sg-day-head ${cls}"><span class="dn">${t.days[d]}</span></div>`;
      }
      html+=`<div class="sg-wp-total-head">${t.wp_total}</div></div>`;
      if(s.wpList.length===0){
        html+=`<div class="sg-row" style="grid-template-columns:${cols}"><div class="sg-label" style="grid-column:1/-1;color:var(--muted);padding:18px;text-align:center;font-size:.85rem">＋ ${t.add_wp}</div></div>`;
      } else {
        s.wpList.forEach(wp=>{
          let wpTotal=0;
          html+=`<div class="sg-row" style="grid-template-columns:${cols}">`;
          html+=`<div class="sg-label" style="border-left:4px solid ${wp.color}"><span style="color:${wp.color};font-size:.72rem;font-weight:700;word-break:break-all;text-align:center">${esc(wp.name||'?')}</span></div>`;
          for(let d=0;d<7;d++){
            const shifts = getWeekCellShifts(wp.id, d);
            const cellHrs = shifts.reduce((sum,sh)=>sum+computeHours(sh.start,sh.end,sh.brk),0);
            wpTotal+=cellHrs;
            const hasData = shifts.some(sh=>sh.start&&sh.end);
            const partialData = !hasData && shifts.some(sh=>sh.start||sh.end);
            const hrsLabel = hasData?(fmt(cellHrs)+' '+t.hours):(partialData?'…':'—');
            const hrsCls = hasData?(cellHrs>8?'over-day':''):'empty';
            // Build shift rows HTML
            let shiftRowsHtml = '';
            shifts.forEach((sh,si)=>{
              const isFirst = si===0;
              const shiftBadge = !isFirst ? `<div class="wshift-badge">${si+1}</div>` : '';
              const delBtn = shifts.length>1 ? `<button class="wshift-del" onclick="window.__wtm_wDelShift(${wp.id},${d},${si})" title="削除">✕</button>` : '';
              shiftRowsHtml += `
                <div class="wshift-row${!isFirst?' wshift-extra':''}">` + shiftBadge + `
                  <div class="cell-row">
                    <label>${t.lbl_start}</label>
                    <input class="time-inp" type="text" inputmode="numeric" value="${sh.start||''}" placeholder="09:00"
                      style="border-color:#93c5fd"
                      onblur="window.__wtm_wShiftBlur(${wp.id},${d},${si},'start',this)"
                      oninput="window.__wtm_timeInput(this)"/>
                  </div>
                  <div class="cell-row">
                    <label>${t.lbl_end}</label>
                    <input class="time-inp" type="text" inputmode="numeric" value="${sh.end||''}" placeholder="17:00"
                      style="border-color:#fca5a5"
                      onblur="window.__wtm_wShiftBlur(${wp.id},${d},${si},'end',this)"
                      oninput="window.__wtm_timeInput(this)"/>
                  </div>
                  <div class="cell-row">
                    <label>${t.lbl_break}</label>
                    <input class="time-inp brk-inp" type="text" inputmode="numeric" value="${sh.brk||''}" placeholder="0"
                      onblur="window.__wtm_wBrkBlur(${wp.id},${d},${si},this)"
                      style="border-color:#86efac"/>
                    <span class="unit">${t.lbl_min}</span>
                    ${delBtn}
                  </div>
                </div>`;
            });
            html+=`<div class="sg-cell day-${d}">
              <div class="cell-card${hasData?' has-data':partialData?' partial':''}" id="cc-${wp.id}-${d}">
                ${shiftRowsHtml}
                <div class="cell-hours ${hrsCls}">${hrsLabel}</div>
                <div class="wshift-actions">
                  <button class="wshift-add" onclick="window.__wtm_wAddShift(${wp.id},${d})">＋</button>
                  <button class="cell-copy-btn" onclick="window.__wtm_copyCell(${wp.id},${d})" title="他の曜日にコピー">📋</button>
                </div>
              </div></div>`;
          }
          html+=`<div class="sg-wp-total${wpTotal>0&&wpTotal>limit?' over':''}">${wpTotal>0?fmt(wpTotal)+' '+t.hours:'—'}</div></div>`;
        });
      }
      html+=`<div class="sg-total-row" style="grid-template-columns:${cols}">`;
      html+=`<div class="sg-label" style="font-size:.72rem;color:var(--primary);font-weight:800">${t.day_total}</div>`;
      let grand=0;
      for(let d=0;d<7;d++){
        let daySum=0;
        s.wpList.forEach(wp=>{ daySum+=weekCellTotalHours(wp.id,d); });
        grand+=daySum;
        html+=`<div class="sg-total-cell day-${d}${daySum>0&&daySum>limit?' over':''}">${daySum>0?fmt(daySum)+'h':'—'}</div>`;
      }
      html+=`<div class="sg-wp-total${grand>limit?' over':''}" style="font-size:.88rem">${grand>0?fmt(grand):'—'}</div></div>`;
      html+=`</div>`;
      const el = document.getElementById('schedGrid');
      if(el) el.innerHTML=html;
    }

    function calc() {
      const t=T[s.lang];
      const limitEl = document.getElementById('limitH') as HTMLInputElement;
      const limit=parseFloat(limitEl?.value||'28')||28;
      let total=0;
      const daySums=Array(7).fill(0);
      s.wpList.forEach(wp=>{
        for(let d=0;d<7;d++){
          const h=weekCellTotalHours(wp.id,d);
          daySums[d]+=h; total+=h;
        }
      });
      const remaining=Math.max(0,limit-total);
      const over=Math.max(0,total-limit);
      const pct=Math.min(100,(total/limit)*100);
      const isOver=total>limit;
      const g = (id:string) => document.getElementById(id);
      const setText = (id:string, v:string) => { const el=g(id); if(el) el.textContent=v; };
      setText('valTotal', fmt(total)+' '+t.hours);
      setText('valLimitR', fmt(limit)+' '+t.hours);
      setText('valRemain', fmt(remaining)+' '+t.hours);
      setText('valOver', fmt(over)+' '+t.hours);
      setText('valPct', Math.round(pct)+'%');
      const fill=g('progFill');
      if(fill){ (fill as HTMLElement).style.width=pct+'%'; fill.classList.toggle('over',isOver); }
      const rc=g('resultCard');
      if(rc){ rc.classList.toggle('ok',!isOver); rc.classList.toggle('over',isOver); }
      const ri=g('remainItem');
      if(ri){ ri.classList.toggle('ok',!isOver); ri.classList.toggle('ov',isOver); }
      g('overItem')?.classList.toggle('ov',isOver);
      const banner=g('statusBanner');
      const icon=g('sIcon');
      const val=g('valStatus');
      if(banner&&icon&&val){
        if(isOver){ banner.className='status-banner over'; icon.textContent='⚠️'; val.textContent=t.over_status(fmt(over)); }
        else { banner.className='status-banner ok'; icon.textContent='✅'; val.textContent=t.ok; }
      }
      // ── MONTHLY CALC (from monthlyData of current displayed month) ──
      // Sync weekly data to monthly calendar first
      syncWeeklyToMonthly();
      renderMonthlyGrid();
      renderSalaryCard();
      // Monthly total from monthlyData
      const { year: mYear, month: mMonth } = s.monthYear;
      const daysInMonth2 = new Date(mYear, mMonth+1, 0).getDate();
      let mTotal = 0;
      for(let d=1; d<=daysInMonth2; d++) {
        const dk = `${mYear}-${String(mMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        s.wpList.forEach(wp => {
          const cell = s.monthlyData[wp.id]?.[dk];
          if(!cell) return;
          if(cell.shifts && cell.shifts.length>0) {
            cell.shifts.forEach(sh=>{ mTotal+=computeHours(sh.start,sh.end,sh.brk); });
          } else {
            mTotal += computeHours(cell.start, cell.end, cell.brk);
          }
        });
      }
      const weeklyAvg2 = daysInMonth2>0 ? mTotal/(daysInMonth2/7) : 0;
      const setText2 = (id:string, v:string) => { const el=g(id); if(el) el.textContent=v; };
      setText2('valMonthlyTotal', fmt(mTotal)+' '+t.hours);
      setText2('valMonthlyAvg', fmt(weeklyAvg2)+' '+t.hours);
      const mFill = g('monthlyProgFill') as HTMLElement|null;
      const monthlyLimitTotal = (daysInMonth2/7) * limit;
      const mPct = Math.min(100, monthlyLimitTotal>0?(mTotal/monthlyLimitTotal)*100:0);
      if(mFill){ mFill.style.width = mPct+'%'; (mFill as HTMLElement).style.background = mPct>=100?'#c0392b':'#7c3aed'; }
    }

    function addWp(defaultName?: string, hourlyRate?: number, transport?: number) {
      const t = T[s.lang];
      const id = s.wpNextId++;
      const color = WP_COLORS[(s.wpList.length)%WP_COLORS.length];
      s.wpList.push({id, name:defaultName||'', color});
      s.data[id] = Array.from({length:7},()=>({shifts:[{start:'',end:'',brk:0}]}));
      s.wpHourlyRate[id] = hourlyRate||0;
      s.wpTransport[id] = transport||0;
      const tag = document.createElement('div');
      tag.className='wp-tag'; tag.id=`wptag-${id}`;
      const initRate = hourlyRate||0;
      const initTransport = transport||0;
      tag.innerHTML=`<div class="wp-color" style="background:${color}"></div>
        <input class="wp-name-inp" type="text" value="${esc(defaultName||'')}" placeholder="${t.wp_ph}" maxlength="20"/>
        <div class="wp-rate-wrap">
          <span class="wp-rate-label hourly">${t.hourly_label}</span>
          <input class="wp-rate-inp" type="number" value="${initRate||''}" placeholder="1100" min="0" max="99999" step="10"/>
          <span class="wp-rate-unit">円</span>
        </div>
        <div class="wp-rate-wrap">
          <span class="wp-rate-label transport">${t.transport_label}</span>
          <input class="wp-transport-inp" type="number" value="${initTransport||''}" placeholder="0" min="0" max="99999" step="10"/>
          <span class="wp-rate-unit">円</span>
        </div>
        <button class="del-wp" title="削除">✕</button>`;
      const nameInp = tag.querySelector('.wp-name-inp') as HTMLInputElement;
      nameInp.addEventListener('input', () => {
        const wp=s.wpList.find(w=>w.id===id); if(wp){wp.name=nameInp.value; renderGrid(); persistAll();}
      });
      const rateInp = tag.querySelector('.wp-rate-inp') as HTMLInputElement;
      rateInp.addEventListener('input', () => {
        s.wpHourlyRate[id]=parseFloat(rateInp.value)||0;
        renderSalaryCard(); persistAll();
      });
      const transportInp = tag.querySelector('.wp-transport-inp') as HTMLInputElement;
      transportInp.addEventListener('input', () => {
        s.wpTransport[id]=parseFloat(transportInp.value)||0;
        renderSalaryCard(); persistAll();
      });
      const delBtn = tag.querySelector('.del-wp') as HTMLButtonElement;
      delBtn.addEventListener('click', () => {
        s.wpList=s.wpList.filter(w=>w.id!==id); delete s.data[id];
        delete s.wpHourlyRate[id]; delete s.wpTransport[id];
        tag.remove(); renderGrid(); calc(); renderMonthlyGrid(); renderSalaryCard(); persistAll();
      });
      document.getElementById('wpTags')?.appendChild(tag);
      renderGrid(); calc(); renderMonthlyGrid(); renderSalaryCard();
    }

    function setLang(l: string) {
      s.lang = l;
      const t = T[l];
      const setText = (id:string, v:string) => { const el=document.getElementById(id); if(el) el.textContent=v; };
      setText('hTitle', t.title);
      setText('hSub', t.sub);
      setText('lblLimit', t.limit);
      setText('lblHUnit', t.hours);
      setText('lblWpTitle', t.wp_title);
      setText('btnAddWpTxt', t.add_wp);
      setText('lblSchedTitle', t.sched_title);
      setText('lblResultTitle', t.result_title);
      setText('lblTotal', t.total);
      setText('lblLimitR', t.limit_r);
      setText('lblRemain', t.remain);
      setText('lblOver', t.over_h);
      setText('lblProg', t.usage);
      setText('lblStatus', t.status);
      setText('noteText', t.note);
      setText('lgStart', t.lg_start);
      setText('lgEnd', t.lg_end);
      setText('lgBreak', t.lg_break);
      setText('lgHours', t.lg_hours);
      setText('lblDailyTitle', t.daily_title);
      setText('lblMonthlyTitle', t.monthly_title);
      setText('lblMonthlyWeeks', t.monthly_weeks);
      setText('lblMonthlyTotal', t.monthly_total_label);
      setText('lblMonthlyAvg', t.monthly_avg_label);
      setText('lblMonthSchedTitle', t.month_cal_title);
      setText('msLblTotal', t.ms_total);
      setText('msLblLimit', t.ms_limit);
      setText('msLblRemain', t.ms_remain);
      setText('msLblOver', t.ms_over);
      setText('msLblPct', t.ms_usage||t.monthly_usage);
      const btnPrev = document.getElementById('btnPrevMonth');
      const btnNext = document.getElementById('btnNextMonth');
      const btnApply = document.getElementById('btnApplyToNext');
      if(btnPrev) btnPrev.textContent = t.prev_month;
      if(btnNext) btnNext.textContent = t.next_month;
      if(btnApply) btnApply.textContent = t.apply_next;
      document.title = t.title;
      document.querySelectorAll('.wp-name-inp').forEach(i=>(i as HTMLInputElement).placeholder=t.wp_ph);
      document.querySelectorAll('.wp-rate-label.hourly').forEach(i=>{ i.textContent = t.hourly_label; });
      document.querySelectorAll('.wp-rate-label.transport').forEach(i=>{ i.textContent = t.transport_label; });
      setNextrLanguage(l);
      renderGrid(); calc(); renderMonthlyGrid(); renderSalaryCard();
    }

    // Live validation feedback while typing (no data commit yet)
    (window as any).__wtm_timeInput = (inp: HTMLInputElement) => {
      const v = inp.value.trim();
      if(!v) { inp.classList.remove('invalid'); return; }
      const parsed = parseTimeText(v);
      inp.classList.toggle('invalid', !parsed && v.length >= 3);
    };

    // ── WEEKLY SHIFT HANDLERS ──
    // Commit time value on blur for a specific shift
    (window as any).__wtm_wShiftBlur = (wpId:number, dayIdx:number, shiftIdx:number, field:string, inp:HTMLInputElement) => {
      const v = inp.value.trim();
      const parsed = v ? parseTimeText(v) : '';
      inp.classList.remove('invalid');
      const shifts = getWeekCellShifts(wpId, dayIdx);
      while(shifts.length<=shiftIdx) shifts.push({start:'',end:'',brk:0});
      (shifts[shiftIdx] as any)[field] = parsed;
      inp.value = parsed;
      saveWeekCellShifts(wpId, dayIdx, shifts);
      renderGrid(); calc(); renderMonthlyGrid(); renderSalaryCard(); persistAll();
    };
    // Break input for a specific shift
    (window as any).__wtm_wBrkBlur = (wpId:number, dayIdx:number, shiftIdx:number, inp:HTMLInputElement) => {
      const v = inp.value.trim();
      const parsed = parseFloat(v)||0;
      const shifts = getWeekCellShifts(wpId, dayIdx);
      while(shifts.length<=shiftIdx) shifts.push({start:'',end:'',brk:0});
      shifts[shiftIdx].brk = parsed;
      inp.value = parsed>0?String(parsed):'';
      saveWeekCellShifts(wpId, dayIdx, shifts);
      renderGrid(); calc(); renderMonthlyGrid(); renderSalaryCard(); persistAll();
    };
    // Add a new shift to a weekly cell
    (window as any).__wtm_wAddShift = (wpId:number, dayIdx:number) => {
      const shifts = getWeekCellShifts(wpId, dayIdx);
      shifts.push({start:'',end:'',brk:0});
      saveWeekCellShifts(wpId, dayIdx, shifts);
      renderGrid(); calc(); renderMonthlyGrid(); renderSalaryCard(); persistAll();
    };
    // Delete a shift from a weekly cell
    (window as any).__wtm_wDelShift = (wpId:number, dayIdx:number, shiftIdx:number) => {
      const shifts = getWeekCellShifts(wpId, dayIdx);
      if(shifts.length<=1) return; // keep at least one
      shifts.splice(shiftIdx,1);
      saveWeekCellShifts(wpId, dayIdx, shifts);
      renderGrid(); calc(); renderMonthlyGrid(); renderSalaryCard(); persistAll();
    };

    // Copy cell data (all shifts) to other days in the same row
    (window as any).__wtm_copyCell = (wpId:number, srcDay:number) => {
      if(!s.data[wpId]) return;
      const srcShifts = getWeekCellShifts(wpId, srcDay);
      const hasAny = srcShifts.some(sh=>sh.start||sh.end);
      if(!hasAny) return;
      // Show a small popup to select target days
      const existing = document.getElementById('copy-popup');
      if(existing) existing.remove();
      const t = T[s.lang];
      const popup = document.createElement('div');
      popup.id='copy-popup';
      popup.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9000;display:flex;align-items:center;justify-content:center;padding:16px';
      const days = t.days as string[];
      let btns = '';
      for(let d=0;d<7;d++) {
        if(d===srcDay) continue;
        const cls = d===5?'sat':d===6?'sun':'';
        btns += `<button class="copy-day-btn ${cls}" onclick="window.__wtm_doCopy(${wpId},${srcDay},${d})">${days[d]}</button>`;
      }
      popup.innerHTML = `<div style="background:#fff;border-radius:16px;padding:20px;width:100%;max-width:340px;box-shadow:0 8px 32px rgba(0,0,0,.2)">
        <div style="font-size:.95rem;font-weight:800;color:#1a6fc4;margin-bottom:14px">📋 コピー先の曜日を選択</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">${btns}</div>
        <div style="display:flex;gap:8px">
          <button onclick="window.__wtm_doCopyAll(${wpId},${srcDay})" style="flex:1;padding:10px;background:#1a6fc4;color:#fff;border:none;border-radius:10px;font-size:.88rem;font-weight:700;cursor:pointer">全曜日にコピー</button>
          <button onclick="document.getElementById('copy-popup').remove()" style="padding:10px 16px;background:#f0f4f8;color:#5a6a7a;border:none;border-radius:10px;font-size:.88rem;font-weight:700;cursor:pointer">キャンセル</button>
        </div>
      </div>`;
      popup.addEventListener('click',(e)=>{ if(e.target===popup) popup.remove(); });
      document.body.appendChild(popup);
    };
    (window as any).__wtm_doCopy = (wpId:number, srcDay:number, dstDay:number) => {
      if(!s.data[wpId]) return;
      const srcShifts = getWeekCellShifts(wpId, srcDay);
      saveWeekCellShifts(wpId, dstDay, srcShifts.map(sh=>({...sh})));
      renderGrid(); calc(); renderMonthlyGrid(); renderSalaryCard(); persistAll();
      document.getElementById('copy-popup')?.remove();
    };
    (window as any).__wtm_doCopyAll = (wpId:number, srcDay:number) => {
      if(!s.data[wpId]) return;
      const srcShifts = getWeekCellShifts(wpId, srcDay);
      for(let d=0;d<7;d++) {
        if(d!==srcDay) saveWeekCellShifts(wpId, d, srcShifts.map(sh=>({...sh})));
      }
      renderGrid(); calc(); renderMonthlyGrid(); renderSalaryCard(); persistAll();
      document.getElementById('copy-popup')?.remove();
    };

    // ── MONTHLY SCHEDULE GRID ──
    // Sync weekly schedule data to monthlyData for the ENTIRE displayed month (by weekday pattern)
    function syncWeeklyToMonthly() {
      const { year, month } = s.monthYear;
      const daysInMonth = new Date(year, month+1, 0).getDate();
      s.wpList.forEach(wp => {
        if(!s.monthlyData[wp.id]) s.monthlyData[wp.id]={};
        for(let d=1; d<=daysInMonth; d++) {
          const dateObj = new Date(year, month, d);
          const dow = dateObj.getDay(); // 0=Sun
          const dayIdx = dow===0 ? 6 : dow-1; // Mon=0..Sun=6
          const shifts = getWeekCellShifts(wp.id, dayIdx);
          const hasData = shifts.some(sh=>sh.start||sh.end);
          const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          // Only sync if weekly has data; don't overwrite monthly manual entries with empty
          if(hasData) {
            if(shifts.length===1) {
              s.monthlyData[wp.id][dateKey] = { start:shifts[0].start, end:shifts[0].end, brk:shifts[0].brk||0 };
            } else {
              s.monthlyData[wp.id][dateKey] = { start:shifts[0].start, end:shifts[0].end, brk:shifts[0].brk||0, shifts:[...shifts] };
            }
          }
        }
      });
    }

    function renderMonthlyGrid() {
      const t = T[s.lang];
      const { year, month } = s.monthYear;
      const daysInMonth = new Date(year, month+1, 0).getDate();
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      const dayNames = t.days; // ['月','火','水','木','金','土','日']
      const monthStr = `${year}年${month+1}月`;
      const lbl = document.getElementById('monthSchedLabel');
      if(lbl) lbl.textContent = monthStr;

      // ── COMPACT CALENDAR GRID (7 cols = Mon-Sun) ──
      // First day of month
      const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
      const firstColIdx = firstDow===0 ? 6 : firstDow-1; // Mon=0..Sun=6

      // Build per-date totals from monthlyData
      const dateTotals: Record<string, number> = {};
      const dateWpInfo: Record<string, Array<{name:string;color:string;hrs:number}>> = {};
      let monthTotal = 0;
      for(let d=1; d<=daysInMonth; d++) {
        const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        let dayTotal = 0;
        const wpInfoArr: Array<{name:string;color:string;hrs:number}> = [];
        s.wpList.forEach(wp => {
          if(!s.monthlyData[wp.id]) s.monthlyData[wp.id]={};
          const cell = s.monthlyData[wp.id][dateKey] || {start:'',end:'',brk:0};
          let wpHrs = 0;
          if(cell.shifts && cell.shifts.length>0) {
            cell.shifts.forEach((sh:{start:string;end:string;brk:number}) => { wpHrs += computeHours(sh.start,sh.end,sh.brk); });
          } else {
            wpHrs = computeHours(cell.start,cell.end,cell.brk);
          }
          if(wpHrs>0) { dayTotal+=wpHrs; wpInfoArr.push({name:wp.name||'?',color:wp.color,hrs:wpHrs}); }
        });
        dateTotals[dateKey] = dayTotal;
        dateWpInfo[dateKey] = wpInfoArr;
        monthTotal += dayTotal;
      }

      // Build calendar HTML
      const DOW_HEADERS = dayNames; // Mon..Sun
      let html = `<div class="mc-grid">`;
      // Header
      html += `<div class="mc-head-row">`;
      DOW_HEADERS.forEach((dn:string,i:number) => {
        const cls = i===5?'sat':i===6?'sun':'';
        html += `<div class="mc-head-cell ${cls}">${dn}</div>`;
      });
      html += `</div>`;
      // Cells
      let cellIdx = 0;
      let html_cells = '';
      // Empty cells before first day
      for(let i=0;i<firstColIdx;i++) { html_cells+=`<div class="mc-cell empty"></div>`; cellIdx++; }
      for(let d=1;d<=daysInMonth;d++) {
        const dateObj = new Date(year, month, d);
        const dow = dateObj.getDay();
        const colIdx = dow===0?6:dow-1;
        const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const isToday = dateKey===todayStr;
        const isSat = colIdx===5;
        const isSun = colIdx===6;
        const dayTotal = dateTotals[dateKey]||0;
        const wpInfo = dateWpInfo[dateKey]||[];
        let cls = 'mc-cell';
        if(isSat) cls+=' sat';
        else if(isSun) cls+=' sun';
        if(isToday) cls+=' today';
        if(dayTotal>0) cls+=' has-work';
        if(dayTotal>s.limit/5) cls+=' over-day'; // rough daily limit
        // Workplace color bars
        let barsHtml = '';
        if(wpInfo.length>0) {
          barsHtml = `<div class="mc-bars">`;
          wpInfo.forEach(w => {
            barsHtml += `<div class="mc-bar" style="background:${w.color}" title="${esc(w.name)}: ${fmt(w.hrs)}h"><span class="mc-bar-hrs">${fmt(w.hrs)}h</span></div>`;
          });
          barsHtml += `</div>`;
        }
        const hrsLabel = dayTotal>0 ? `<div class="mc-hrs">${fmt(dayTotal)}h</div>` : '';
        html_cells += `<div class="${cls}" onclick="window.__wtm_openDay('${dateKey}')">
          <div class="mc-date">${d}</div>
          ${hrsLabel}
          ${barsHtml}
        </div>`;
        cellIdx++;
      }
      // Trailing empty cells to fill last row
      const totalCells = Math.ceil(cellIdx/7)*7;
      while(cellIdx<totalCells) { html_cells+=`<div class="mc-cell empty"></div>`; cellIdx++; }
      html += `<div class="mc-body">${html_cells}</div>`;
      html += `</div>`;

      const el = document.getElementById('monthCalGrid');
      if(el) el.innerHTML = html;
      // Update monthly stats
      const setText3 = (id:string,v:string)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };
      setText3('msTotalVal', fmt(monthTotal)+' '+t.hours);
      // Get weekly limit directly from the DOM input to ensure latest value is used
      const limitInput = document.getElementById('limitH') as HTMLInputElement|null;
      const weeklyLimit = limitInput ? (parseFloat(limitInput.value)||s.limit) : s.limit;
      // Count weeks: number of Mondays in the month = number of full/partial Mon-Sun weeks
      let mondayCount = 0;
      for(let dd=1; dd<=daysInMonth; dd++) {
        const dow2 = new Date(year, month, dd).getDay();
        if(dow2===1) mondayCount++;
      }
      // If month does not start on Monday, there is a partial first week
      const monthFirstDow2 = new Date(year, month, 1).getDay();
      const weeksInMonth = mondayCount + (monthFirstDow2 !== 1 ? 1 : 0);
      const monthLimit = Math.round(weeklyLimit * weeksInMonth * 10)/10;
      setText3('msLimitVal', fmt(monthLimit)+' '+t.hours);
      const msOver = Math.max(0, monthTotal-monthLimit);
      const msRemain = Math.max(0, monthLimit-monthTotal);
      setText3('msOverVal', fmt(msOver)+' '+t.hours);
      setText3('msRemainVal', fmt(msRemain)+' '+t.hours);
      const msPct = Math.min(100, monthLimit>0?(monthTotal/monthLimit)*100:0);
      const msFill = document.getElementById('msProgFill') as HTMLElement|null;
      if(msFill){ msFill.style.width=msPct+'%'; msFill.style.background=msPct>=100?'#c0392b':'#0891b2'; }
      const msPctEl = document.getElementById('msPctVal');
      if(msPctEl) msPctEl.textContent = Math.round(msPct)+'%';
      const msOverStat = document.getElementById('msOverStat');
      if(msOverStat) msOverStat.classList.toggle('over', msOver>0);
    }

    // Wire up controls
    const langSel = document.getElementById('langSel') as HTMLSelectElement;
    if(langSel) langSel.addEventListener('change', () => { setLang(langSel.value); persistAll(); });

    const limitH = document.getElementById('limitH') as HTMLInputElement;
    if(limitH) limitH.addEventListener('input', () => { renderGrid(); calc(); persistAll(); });

    const btnAddWp = document.getElementById('btnAddWp') as HTMLButtonElement;
    if(btnAddWp) btnAddWp.addEventListener('click', () => { addWp(); persistAll(); });

    // ── 今週をリセット ──
    const btnResetWeek = document.getElementById('btnResetWeek') as HTMLButtonElement;
    if(btnResetWeek) btnResetWeek.addEventListener('click', () => {
      if(!confirm(T[s.lang].confirm_reset_week)) return;
      s.wpList.forEach(wp => {
        s.data[wp.id] = Array.from({length:7},()=>({shifts:[{start:'',end:'',brk:0}]}));
      });
      renderGrid(); calc(); renderMonthlyGrid(); renderSalaryCard(); persistAll();
    });

    const monthlyWeeksEl = document.getElementById('monthlyWeeks') as HTMLInputElement;
    if(monthlyWeeksEl) monthlyWeeksEl.addEventListener('input', () => { calc(); });

    // ── 給与トグル ──
    document.getElementById('salaryToggleBtn')?.addEventListener('click', () => {
      const detail = document.getElementById('salaryDetail');
      const btn = document.getElementById('salaryToggleBtn');
      if(!detail||!btn) return;
      const isHidden = detail.style.display==='none';
      detail.style.display = isHidden?'':'none';
      btn.textContent = isHidden?'▲ 閉じる':'▼ 詳細を見る';
    });

    // ── 勤怠スケジュールコピー ──
    document.getElementById('btnCopySchedule')?.addEventListener('click', (e) => {
      e.preventDefault();
      openCopySchedulePopup();
    });

    // ── 翌月に反映 ──
    document.getElementById('btnApplyToNext')?.addEventListener('click', () => {
      // Advance monthYear to next month, sync, then go back
      const origYear = s.monthYear.year;
      const origMonth = s.monthYear.month;
      s.monthYear.month++;
      if(s.monthYear.month>11){ s.monthYear.month=0; s.monthYear.year++; }
      syncWeeklyToMonthly();
      // Show confirmation toast
      const nextMonthStr = `${s.monthYear.year}年${s.monthYear.month+1}月`;
      // Navigate to next month to show result
      renderMonthlyGrid(); renderSalaryCard();
      persistAll();
      // Brief toast
      const toast = document.createElement('div');
      toast.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#059669;color:#fff;padding:10px 20px;border-radius:99px;font-size:.88rem;font-weight:700;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.2)';
      toast.textContent=`✅ ${nextMonthStr}に週間シフトを反映しました`;
      document.body.appendChild(toast);
      setTimeout(()=>toast.remove(), 2500);
    });

    // ── パスワード変更 ──
    document.getElementById('btnChangePw')?.addEventListener('click', () => {
      const dlg = document.getElementById('changePwDialog');
      if(dlg) dlg.style.display = dlg.style.display==='none'?'':'none';
    });
    document.getElementById('cpCancel')?.addEventListener('click', () => {
      const dlg = document.getElementById('changePwDialog');
      if(dlg) dlg.style.display='none';
    });
    document.getElementById('cpSubmit')?.addEventListener('click', async () => {
      const oldPw = (document.getElementById('cpOldPw') as HTMLInputElement)?.value||'';
      const newPw = (document.getElementById('cpNewPw') as HTMLInputElement)?.value||'';
      const newPw2 = (document.getElementById('cpNewPw2') as HTMLInputElement)?.value||'';
      const errEl = document.getElementById('cpError');
      const showErr = (msg:string) => { if(errEl){errEl.textContent=msg;errEl.style.display='';} };
      const oldHash = await hashPassword(oldPw);
      if(oldHash !== getStoredHash()) { showErr(T[s.lang].pw_current_wrong); return; }
      if(newPw.length<4) { showErr(T[s.lang].pw_new_short); return; }
      if(newPw!==newPw2) { showErr(T[s.lang].pw_new_mismatch); return; }
      const hash = await hashPassword(newPw);
      localStorage.setItem(PW_KEY, hash);
      if(errEl) errEl.style.display='none';
      const dlg = document.getElementById('changePwDialog');
      if(dlg) dlg.style.display='none';
      alert(T[s.lang].pw_changed);
    });
    // ── 全データ削除 ──
    document.getElementById('btnDeleteAll')?.addEventListener('click', () => {
      if(!confirm(T[s.lang].confirm_delete_all)) return;
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PW_KEY);
      localStorage.removeItem(PW_ATTEMPTS_KEY);
      localStorage.removeItem(PW_LOCKOUT_KEY);
      window.location.reload();
    });

    // ── データエクスポート ──
    document.getElementById('btnExport')?.addEventListener('click', () => {
      const data = localStorage.getItem(STORAGE_KEY);
      if(!data) { alert(T[s.lang].export_empty); return; }
      const exportObj = {
        _type: 'wtm_backup',
        _version: 1,
        _exportedAt: new Date().toISOString(),
        data: JSON.parse(data)
      };
      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
      a.download = `wtm_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      // Toast
      const toast = document.createElement('div');
      toast.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#059669;color:#fff;padding:10px 20px;border-radius:99px;font-size:.88rem;font-weight:700;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.2)';
      toast.textContent=T[s.lang].export_success;
      document.body.appendChild(toast);
      setTimeout(()=>toast.remove(), 2500);
    });

    // ── データインポート ──
    const importFileInput = document.getElementById('importFileInput') as HTMLInputElement;
    document.getElementById('btnImport')?.addEventListener('click', () => {
      if(importFileInput) importFileInput.click();
    });
    if(importFileInput) importFileInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const text = ev.target?.result as string;
          const parsed = JSON.parse(text);
          // Validate format
          let importData: any = null;
          if(parsed._type === 'wtm_backup' && parsed.data) {
            // Only backup format version 1 is currently supported
            if(parsed._version !== 1) {
              alert(T[s.lang].import_version_error);
              return;
            }
            importData = parsed.data;
          } else if(parsed.wpList && parsed.data) {
            // Direct storage format (legacy, no version wrapper) — kept for backward compatibility
            importData = parsed;
          } else {
            alert(T[s.lang].import_invalid);
            return;
          }
          if(!confirm(T[s.lang].import_confirm)) return;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(importData));
          // Toast & reload
          const toast = document.createElement('div');
          toast.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#1a6fc4;color:#fff;padding:10px 20px;border-radius:99px;font-size:.88rem;font-weight:700;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.2)';
          toast.textContent=T[s.lang].import_success;
          document.body.appendChild(toast);
          setTimeout(()=>window.location.reload(), 1500);
        } catch(err) {
          alert(T[s.lang].import_read_error);
        }
      };
      reader.readAsText(file);
      // Reset input so same file can be re-selected
      importFileInput.value = '';
    });

    // Month navigation
    document.getElementById('btnPrevMonth')?.addEventListener('click', () => {
      s.monthYear.month--;
      if(s.monthYear.month<0){ s.monthYear.month=11; s.monthYear.year--; }
      renderMonthlyGrid(); renderSalaryCard();
    });
    document.getElementById('btnNextMonth')?.addEventListener('click', () => {
      s.monthYear.month++;
      if(s.monthYear.month>11){ s.monthYear.month=0; s.monthYear.year++; }
      renderMonthlyGrid(); renderSalaryCard();
    });

    // Helper: get or init MonthCell as shifts array
    function getMonthCellShifts(wpId:number, dateKey:string): Array<{start:string;end:string;brk:number}> {
      if(!s.monthlyData[wpId]) s.monthlyData[wpId]={};
      const cell = s.monthlyData[wpId][dateKey];
      if(!cell) return [{start:'',end:'',brk:0}];
      if(cell.shifts && cell.shifts.length>0) return cell.shifts;
      // Migrate legacy single-shift format
      return [{start:cell.start||'',end:cell.end||'',brk:cell.brk||0}];
    }
    function saveMonthCellShifts(wpId:number, dateKey:string, shifts:Array<{start:string;end:string;brk:number}>) {
      if(!s.monthlyData[wpId]) s.monthlyData[wpId]={};
      const filtered = shifts.filter(sh=>sh.start||sh.end);
      if(filtered.length===0) {
        delete s.monthlyData[wpId][dateKey];
      } else if(filtered.length===1) {
        s.monthlyData[wpId][dateKey] = { start:filtered[0].start, end:filtered[0].end, brk:filtered[0].brk };
      } else {
        s.monthlyData[wpId][dateKey] = { start:filtered[0].start, end:filtered[0].end, brk:filtered[0].brk, shifts:filtered };
      }
    }

    // Build shift row HTML for popup
    function buildShiftRowHtml(dateKey:string, wpId:number, shiftIdx:number, sh:{start:string;end:string;brk:number}, t:any, canDelete:boolean): string {
      const hrs = computeHours(sh.start,sh.end,sh.brk);
      const shiftLabel = shiftIdx===0 ? '' : `<div style="font-size:.7rem;font-weight:700;color:#7c3aed;margin-bottom:4px">シフト${shiftIdx+1}</div>`;
      let html = `<div id="mcp-shift-${wpId}-${shiftIdx}" style="margin-bottom:8px;padding:8px;background:#f0f4f8;border-radius:8px;position:relative">`;
      html += shiftLabel;
      html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:4px">`;
      html += `<div><label style="font-size:.65rem;font-weight:700;color:#0891b2;display:block;margin-bottom:2px">${t.lbl_start}</label>`;
      html += `<input type="text" inputmode="numeric" value="${sh.start||''}" placeholder="09:00" style="width:100%;padding:6px;border:2px solid #67e8f9;border-radius:6px;font-size:.85rem;font-weight:700;outline:none" oninput="window.__wtm_timeInput(this)" onblur="window.__wtm_mShiftBlur('${dateKey}',${wpId},${shiftIdx},'start',this)"/></div>`;
      html += `<div><label style="font-size:.65rem;font-weight:700;color:#f87171;display:block;margin-bottom:2px">${t.lbl_end}</label>`;
      html += `<input type="text" inputmode="numeric" value="${sh.end||''}" placeholder="17:00" style="width:100%;padding:6px;border:2px solid #fca5a5;border-radius:6px;font-size:.85rem;font-weight:700;outline:none" oninput="window.__wtm_timeInput(this)" onblur="window.__wtm_mShiftBlur('${dateKey}',${wpId},${shiftIdx},'end',this)"/></div>`;
      html += `</div>`;
      html += `<div style="display:flex;align-items:center;gap:6px">`;
      html += `<label style="font-size:.65rem;font-weight:700;color:#4ade80">${t.lbl_break}</label>`;
      html += `<input type="text" inputmode="numeric" value="${sh.brk||''}" placeholder="0" style="width:60px;padding:5px;border:2px solid #86efac;border-radius:6px;font-size:.85rem;font-weight:700;outline:none" onblur="window.__wtm_mShiftBlur('${dateKey}',${wpId},${shiftIdx},'brk',this)"/>`;
      html += `<span style="font-size:.7rem;color:#9ca3af">${t.lbl_min}</span>`;
      html += `<span id="mcp-h-${wpId}-${shiftIdx}" style="margin-left:auto;font-size:.82rem;font-weight:800;color:#0891b2">${hrs>0?fmt(hrs)+'h':''}</span>`;
      if(canDelete) html += `<button onclick="window.__wtm_mDelShift('${dateKey}',${wpId},${shiftIdx})" style="background:#fee2e2;border:none;color:#dc2626;border-radius:6px;padding:3px 7px;font-size:.75rem;font-weight:700;cursor:pointer">✕</button>`;
      html += `</div></div>`;
      return html;
    }

    // Day cell click: open a modal/popup to edit that day's entries
    (window as any).__wtm_openDay = (dateKey:string) => {
      const t = T[s.lang];
      const existing = document.getElementById('mc-day-popup');
      if(existing) existing.remove();
      const [y,m,d] = dateKey.split('-').map(Number);
      const dateObj = new Date(y,m-1,d);
      const dow = dateObj.getDay();
      const dayIdx = dow===0?6:dow-1;
      const dayName = t.days[dayIdx];
      const popup = document.createElement('div');
      popup.id='mc-day-popup';
      popup.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9000;display:flex;align-items:center;justify-content:center;padding:16px';
      let innerHtml = `<div style="background:#fff;border-radius:16px;padding:20px;width:100%;max-width:400px;max-height:85vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.2)">`;
      innerHtml += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">`;
      innerHtml += `<div style="font-size:1rem;font-weight:800;color:#0891b2">${m}月${d}日（${dayName}）</div>`;
      innerHtml += `<button onclick="document.getElementById('mc-day-popup').remove()" style="background:none;border:none;font-size:1.3rem;cursor:pointer;color:#9ca3af">✕</button></div>`;
      if(s.wpList.length===0) {
        innerHtml += `<p style="color:#9ca3af;font-size:.85rem">勤務先を追加してください</p>`;
      } else {
        s.wpList.forEach(wp => {
          const shifts = getMonthCellShifts(wp.id, dateKey);
          innerHtml += `<div id="mcp-wp-${wp.id}" style="margin-bottom:14px;padding:12px;background:#f7fafd;border-radius:10px;border-left:4px solid ${wp.color}">`;
          innerHtml += `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">`;
          innerHtml += `<div style="font-size:.85rem;font-weight:700;color:#374151"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${wp.color};margin-right:6px"></span>${esc(wp.name||'?')}</div>`;
          innerHtml += `<button onclick="window.__wtm_mAddShift('${dateKey}',${wp.id})" style="padding:4px 10px;background:#e8f1fb;border:1.5px solid #1a6fc4;color:#1a6fc4;border-radius:6px;font-size:.72rem;font-weight:700;cursor:pointer">+ 中抜け追加</button>`;
          innerHtml += `</div>`;
          shifts.forEach((sh, si) => {
            innerHtml += buildShiftRowHtml(dateKey, wp.id, si, sh, t, shifts.length>1);
          });
          innerHtml += `</div>`;
        });
      }
      innerHtml += `<button onclick="document.getElementById('mc-day-popup').remove()" style="width:100%;margin-top:8px;padding:10px;background:#0891b2;color:#fff;border:none;border-radius:10px;font-size:.9rem;font-weight:700;cursor:pointer">閉じる</button>`;
      innerHtml += `</div>`;
      popup.innerHTML = innerHtml;
      popup.addEventListener('click', (e)=>{ if(e.target===popup) popup.remove(); });
      document.body.appendChild(popup);
    };

    // Monthly shift handlers
    (window as any).__wtm_mShiftBlur = (dateKey:string, wpId:number, shiftIdx:number, field:string, inp:HTMLInputElement) => {
      const shifts = getMonthCellShifts(wpId, dateKey);
      while(shifts.length<=shiftIdx) shifts.push({start:'',end:'',brk:0});
      const v = inp.value.trim();
      if(field==='brk') {
        shifts[shiftIdx].brk = parseFloat(v)||0;
        inp.value = shifts[shiftIdx].brk>0?String(shifts[shiftIdx].brk):'';
      } else {
        const parsed = v ? parseTimeText(v) : '';
        (shifts[shiftIdx] as any)[field] = parsed;
        inp.value = parsed;
      }
      saveMonthCellShifts(wpId, dateKey, shifts);
      // Update hours display in popup
      const sh = shifts[shiftIdx]||{start:'',end:'',brk:0};
      const hrs = computeHours(sh.start,sh.end,sh.brk);
      const hrsEl = document.getElementById(`mcp-h-${wpId}-${shiftIdx}`);
      if(hrsEl) hrsEl.textContent = hrs>0?fmt(hrs)+'h':'';
      renderMonthlyGrid(); renderSalaryCard(); persistAll();
    };
    (window as any).__wtm_mAddShift = (dateKey:string, wpId:number) => {
      const shifts = getMonthCellShifts(wpId, dateKey);
      shifts.push({start:'',end:'',brk:0});
      saveMonthCellShifts(wpId, dateKey, [...shifts, {start:'',end:'',brk:0}]);
      // Rebuild popup
      document.getElementById('mc-day-popup')?.remove();
      (window as any).__wtm_openDay(dateKey);
    };
    (window as any).__wtm_mDelShift = (dateKey:string, wpId:number, shiftIdx:number) => {
      const shifts = getMonthCellShifts(wpId, dateKey);
      shifts.splice(shiftIdx, 1);
      saveMonthCellShifts(wpId, dateKey, shifts);
      document.getElementById('mc-day-popup')?.remove();
      (window as any).__wtm_openDay(dateKey);
      renderMonthlyGrid(); renderSalaryCard(); persistAll();
    };

    // Monthly cell global handlers (legacy, kept for compatibility)
    (window as any).__wtm_mSetCell = (dateKey:string, wpId:number, field:string, value:string) => {
      if(!s.monthlyData[wpId]) s.monthlyData[wpId]={};
      if(!s.monthlyData[wpId][dateKey]) s.monthlyData[wpId][dateKey]={start:'',end:'',brk:0};
      if(field==='brk') s.monthlyData[wpId][dateKey].brk=parseFloat(value)||0;
      else (s.monthlyData[wpId][dateKey] as any)[field]=value;
      renderMonthlyGrid(); renderSalaryCard(); persistAll();
    };
    (window as any).__wtm_mBlur = (dateKey:string, wpId:number, field:string, inp:HTMLInputElement) => {
      const v = inp.value.trim();
      const parsed = v ? parseTimeText(v) : '';
      inp.classList.remove('invalid');
      if(!s.monthlyData[wpId]) s.monthlyData[wpId]={};
      if(!s.monthlyData[wpId][dateKey]) s.monthlyData[wpId][dateKey]={start:'',end:'',brk:0};
      (s.monthlyData[wpId][dateKey] as any)[field] = parsed;
      inp.value = parsed;
      renderMonthlyGrid(); renderSalaryCard(); persistAll();
    };

    // ── LOAD FROM STORAGE OR INIT ──
    const saved = loadFromStorage();
    if(saved && saved.wpList && saved.wpList.length > 0) {
      // Restore state
      // Language priority: nextr.language (shared) > this app's saved language > 'ja'
      s.lang = getCurrentLang();
      s.wpNextId = saved.wpNextId || 1;
      s.limit = saved.limit || 28;
      // Set limit input
      const lEl = document.getElementById('limitH') as HTMLInputElement;
      if(lEl) lEl.value = String(s.limit);
      // Set lang select
      if(langSel) langSel.value = s.lang;
      // Restore workplaces
      saved.wpList.forEach(wp => {
        s.wpList.push(wp);
        // Restore data for this wp
        // Restore and migrate legacy data format to WeekCell
        const rawDayArr = saved.data[wp.id] || Array.from({length:7},()=>({shifts:[{start:'',end:'',brk:0}]}));
        s.data[wp.id] = (rawDayArr as any[]).map((cell:any) => {
          if(cell && cell.shifts && Array.isArray(cell.shifts)) return cell as WeekCell;
          // Migrate legacy {start,end,brk}
          return {shifts:[{start:cell?.start||'',end:cell?.end||'',brk:cell?.brk||0}]} as WeekCell;
        });
        // Create tag (with hourly rate + transport)
        const t = T[s.lang];
        const initRate = (saved as any).wpHourlyRate?.[wp.id]||0;
        const initTransport = (saved as any).wpTransport?.[wp.id]||0;
        const tag = document.createElement('div');
        tag.className='wp-tag'; tag.id=`wptag-${wp.id}`;
        tag.innerHTML=`<div class="wp-color" style="background:${wp.color}"></div>
          <input class="wp-name-inp" type="text" value="${esc(wp.name||'')}" placeholder="${t.wp_ph}" maxlength="20"/>
          <div class="wp-rate-wrap">
            <span class="wp-rate-label hourly">${t.hourly_label}</span>
            <input class="wp-rate-inp" type="number" value="${initRate||''}" placeholder="1100" min="0" max="99999" step="10"/>
            <span class="wp-rate-unit">円</span>
          </div>
          <div class="wp-rate-wrap">
            <span class="wp-rate-label transport">${t.transport_label}</span>
            <input class="wp-transport-inp" type="number" value="${initTransport||''}" placeholder="0" min="0" max="99999" step="10"/>
            <span class="wp-rate-unit">円</span>
          </div>
          <button class="del-wp" title="削除">✕</button>`;
        const nameInp = tag.querySelector('.wp-name-inp') as HTMLInputElement;
        nameInp.addEventListener('input', () => {
          const w=s.wpList.find(x=>x.id===wp.id); if(w){w.name=nameInp.value; renderGrid(); persistAll();}
        });
        const rateInp2 = tag.querySelector('.wp-rate-inp') as HTMLInputElement;
        rateInp2.addEventListener('input', () => { s.wpHourlyRate[wp.id]=parseFloat(rateInp2.value)||0; renderSalaryCard(); persistAll(); });
        const transportInp2 = tag.querySelector('.wp-transport-inp') as HTMLInputElement;
        transportInp2.addEventListener('input', () => { s.wpTransport[wp.id]=parseFloat(transportInp2.value)||0; renderSalaryCard(); persistAll(); });
        const delBtn = tag.querySelector('.del-wp') as HTMLButtonElement;
        delBtn.addEventListener('click', () => {
          s.wpList=s.wpList.filter(w=>w.id!==wp.id); delete s.data[wp.id];
          delete s.wpHourlyRate[wp.id]; delete s.wpTransport[wp.id];
          tag.remove(); renderGrid(); calc(); renderMonthlyGrid(); renderSalaryCard(); persistAll();
        });
        document.getElementById('wpTags')?.appendChild(tag);
      });
      // Restore monthly data
      s.monthlyData = (saved as any).monthlyData || {};
      // Restore hourly rates & transport
      s.wpHourlyRate = (saved as any).wpHourlyRate || {};
      s.wpTransport = (saved as any).wpTransport || {};
      // Apply language labels
      setLang(s.lang);
      renderMonthlyGrid();
      renderSalaryCard();
    } else {
      // Fresh start — still honor a language already chosen in another NextR tool
      s.lang = getCurrentLang();
      if(langSel) langSel.value = s.lang;
      addWp("コンビニA");
      addWp("レストランB");
      setLang(s.lang);
    }

    return () => {
      indicator.remove();
      if(saveTimer) clearTimeout(saveTimer);
      delete (window as any).__wtm_setCell;
      delete (window as any).__wtm_mSetCell;
      delete (window as any).__wtm_mBlur;
      delete (window as any).__wtm_brkBlur;
      delete (window as any).__wtm_copyCell;
      delete (window as any).__wtm_doCopy;
      delete (window as any).__wtm_doCopyAll;
    };
  }, []);

  return (
    <>
      <div className="wtm-header">
        <h1 id="hTitle">Work Time Manager</h1>
        <div className="sub" id="hSub">Weekly Work Schedule &amp; Weekly Hour Limit Checker</div>
        <div className="sub" style={{fontSize:'.7rem',opacity:.6,marginTop:'2px'}}>週間勤務スケジュール &amp; 週間時間制限チェックツール</div>
        <Link href="/guide" className="guide-link-btn" id="btnGuide">📖 使い方</Link>
      </div>


      {showInstallBanner && (
        <div
          role="dialog"
          aria-label="ホーム画面に追加"
          style={{
            position: 'fixed',
            left: '12px',
            right: '12px',
            bottom: '16px',
            zIndex: 9999,
            maxWidth: '620px',
            margin: '0 auto',
            background: '#ffffff',
            border: '1px solid #dbeafe',
            borderRadius: '18px',
            boxShadow: '0 16px 40px rgba(15, 23, 42, .24)',
            padding: '16px'
          }}
        >
          <button
            type="button"
            onClick={closeInstallBanner}
            aria-label="閉じる"
            style={{
              position: 'absolute',
              top: '8px',
              right: '10px',
              border: 'none',
              background: 'transparent',
              color: '#64748b',
              fontSize: '1.35rem',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            ×
          </button>

          <div style={{display:'flex',alignItems:'center',gap:'12px',paddingRight:'24px'}}>
            <img
              src="/work-time-manager/icons/icon-192.png"
              alt=""
              width={58}
              height={58}
              style={{borderRadius:'14px',flexShrink:0}}
            />
            <div>
              <div style={{fontSize:'1rem',fontWeight:800,color:'#0f172a',marginBottom:'4px'}}>
                ホーム画面に追加
              </div>
              <div style={{fontSize:'.8rem',lineHeight:1.55,color:'#475569'}}>
                Work Time Managerをアプリのように、すぐ開けます。
              </div>
            </div>
          </div>

          <div style={{display:'flex',gap:'8px',marginTop:'14px'}}>
            <button
              type="button"
              onClick={closeInstallBanner}
              style={{
                flex:1,
                padding:'11px 12px',
                borderRadius:'10px',
                border:'1px solid #cbd5e1',
                background:'#ffffff',
                color:'#475569',
                fontWeight:700,
                cursor:'pointer'
              }}
            >
              今はしない
            </button>
            <button
              type="button"
              onClick={handleInstallClick}
              style={{
                flex:1.35,
                padding:'11px 12px',
                borderRadius:'10px',
                border:'none',
                background:'#1d4ed8',
                color:'#ffffff',
                fontWeight:800,
                cursor:'pointer',
                boxShadow:'0 6px 16px rgba(29, 78, 216, .25)'
              }}
            >
              {isIosInstallGuide ? '追加方法を見る' : '追加する'}
            </button>
          </div>
        </div>
      )}

      <div className="wrap" ref={containerRef}>
        {/* SETTINGS */}
        <div className="card">
          <div className="top-bar">
            <div className="lang-wrap">
              <span className="lang-label">🌐</span>
              <select id="langSel">
                <option value="ja">🇯🇵 日本語</option>
                <option value="ja_easy">🇯🇵 やさしい日本語</option>
                <option value="en">🇺🇸 English</option>
                <option value="vi">🇻🇳 Tiếng Việt</option>
                <option value="ne">🇳🇵 नेपाली</option>
                <option value="zh">🇨🇳 中文</option>
                <option value="ko">🇰🇷 한국어</option>
                <option value="tl">🇵🇭 Tagalog</option>
                <option value="id">🇮🇩 Bahasa Indonesia</option>
                <option value="my">🇲🇲 မြန်မာဘာသာ</option>
                <option value="th">🇹🇭 ภาษาไทย</option>
                <option value="si">🇱🇰 සිංහල</option>
                <option value="bn">🇧🇩 বাংলা</option>
                <option value="hi">🇮🇳 हिन्दी</option>
                <option value="es">🇪🇸 Español</option>
                <option value="pt">🇧🇷 Português</option>
              </select>
            </div>
            <div className="limit-wrap">
              <label htmlFor="limitH" id="lblLimit">週間制限時間</label>
              <input type="number" id="limitH" defaultValue={28} min={1} max={168} step={0.5}/>
              <span className="limit-unit" id="lblHUnit">時間</span>
            </div>
          </div>
        </div>

        {/* WORKPLACES */}
        <div className="card">
          <div className="wp-bar">
            <span className="wp-list-label" id="lblWpTitle">勤務先</span>
            <button className="btn-add-wp" id="btnAddWp">＋ <span id="btnAddWpTxt">勤務先を追加</span></button>
          </div>
          <div className="wp-tags" id="wpTags"></div>
        </div>

        {/* SCHEDULE GRID */}
        <div className="card" style={{padding:'18px 10px'}}>
          <div className="card-head">
            <div className="card-icon">📅</div>
            <span className="card-title" id="lblSchedTitle">週間スケジュール</span>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'8px'}}>
            <div className="legend">
              <div className="legend-item"><div className="legend-dot" style={{background:'#7eb8f5'}}></div><span id="lgStart">開始</span></div>
              <div className="legend-item"><div className="legend-dot" style={{background:'#f5a07e'}}></div><span id="lgEnd">終了</span></div>
              <div className="legend-item"><div className="legend-dot" style={{background:'#a0c4a0'}}></div><span id="lgBreak">休憩(分)</span></div>
              <div className="legend-item"><div className="legend-dot" style={{background:'#93c5fd'}}></div><span id="lgHours">実働時間</span></div>
            </div>
            <button className="btn-reset-week" id="btnResetWeek">🔄 今週をリセット</button>
          </div>
          <div style={{marginTop:'12px'}} className="schedule-outer">
            <div id="schedGrid"></div>
          </div>
        </div>

        {/* ③ 計算結果（週間勤務時間＋月間勤務時間＋労働時間制限チェック） */}
        <div className="card result-card" id="resultCard">
          <div className="card-head">
            <div className="card-icon">📊</div>
            <span className="card-title" id="lblResultTitle">計算結果</span>
          </div>
          <div className="result-grid">
            <div className="r-item hi"><div className="r-label" id="lblTotal">週間合計</div><div className="r-val" id="valTotal">0.0</div></div>
            <div className="r-item"><div className="r-label" id="lblLimitR">週間制限時間</div><div className="r-val" id="valLimitR">28.0</div></div>
            <div className="r-item ok" id="remainItem"><div className="r-label" id="lblRemain">残り時間</div><div className="r-val" id="valRemain">28.0</div></div>
            <div className="r-item" id="overItem"><div className="r-label" id="lblOver">オーバー時間</div><div className="r-val" id="valOver">0.0</div></div>
          </div>
          <div className="prog-wrap">
            <div className="prog-head"><span id="lblProg">使用率</span><span id="valPct">0%</span></div>
            <div className="prog-bg"><div className="prog-fill" id="progFill" style={{width:'0%'}}></div></div>
          </div>
          <div className="status-banner ok" id="statusBanner">
            <div className="s-icon" id="sIcon">✅</div>
            <div className="s-text">
              <div className="s-lbl" id="lblStatus">状態</div>
              <div className="s-val" id="valStatus">OK ✓</div>
            </div>
          </div>
          {/* 月間勤務時間 */}
          <div className="monthly-card" id="monthlyCard" style={{marginTop:'16px',padding:'14px',background:'#f5f3ff',borderRadius:'12px',border:'1.5px solid #c4b5fd'}}>
            <div style={{fontSize:'.82rem',fontWeight:800,color:'#7c3aed',marginBottom:'10px'}} id="lblMonthlyTitle">月間勤務時間</div>
            <div className="monthly-grid">
              <div className="m-item hi">
                <div className="m-label" id="lblMonthlyTotal">月間合計</div>
                <div className="m-val" id="valMonthlyTotal">0.0</div>
              </div>
              <div className="m-item">
                <div className="m-label" id="lblMonthlyAvg">週平均</div>
                <div className="m-val" id="valMonthlyAvg">0.0</div>
              </div>
            </div>
            <div className="monthly-prog-wrap">
              <div style={{fontSize:'.72rem',color:'#7c3aed',fontWeight:600,marginBottom:'3px'}}>月間使用率</div>
              <div className="monthly-prog-bg"><div className="monthly-prog-fill" id="monthlyProgFill" style={{width:'0%'}}></div></div>
            </div>
          </div>
        </div>

        {/* ④ 月間カレンダー */}
        <div className="card monthly-sched-card">
          <div className="card-head">
            <div className="card-icon" style={{background:'#0891b2'}}>📅</div>
            <span className="card-title" style={{color:'#0891b2'}} id="lblMonthSchedTitle">月間カレンダー</span>
          </div>
          <div className="month-nav">
            <button className="month-nav-btn" id="btnPrevMonth">◄ 前月</button>
            <span className="month-label" id="monthSchedLabel">2026年7月</span>
            <button className="month-nav-btn" id="btnNextMonth">翌月 ►</button>
            <button className="month-nav-btn" id="btnApplyToNext" style={{background:'#059669',marginLeft:'auto'}}>週間シフトを翌月に反映</button>
          </div>
          <div className="month-total-bar">
            <div className="month-stat">
              <div className="month-stat-label" id="msLblTotal">月間合計</div>
              <div className="month-stat-val" id="msTotalVal">0.0 時間</div>
            </div>
            <div className="month-stat">
              <div className="month-stat-label" id="msLblLimit">月間制限目安</div>
              <div className="month-stat-val" id="msLimitVal">—</div>
            </div>
            <div className="month-stat">
              <div className="month-stat-label" id="msLblRemain">残り時間</div>
              <div className="month-stat-val" id="msRemainVal">—</div>
            </div>
            <div className="month-stat" id="msOverStat">
              <div className="month-stat-label" id="msLblOver">オーバー</div>
              <div className="month-stat-val" id="msOverVal">0.0 時間</div>
            </div>
          </div>
          <div style={{marginBottom:'10px'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'.75rem',fontWeight:600,color:'#0891b2',marginBottom:'4px'}}>
              <span id="msLblPct">月間使用率</span><span id="msPctVal">0%</span>
            </div>
            <div style={{height:'8px',background:'#cffafe',borderRadius:'99px',overflow:'hidden'}}>
              <div id="msProgFill" style={{height:'100%',borderRadius:'99px',background:'#0891b2',transition:'width .4s',width:'0%'}}></div>
            </div>
          </div>
          {/* Compact calendar grid */}
          <div id="monthCalGrid"></div>
        </div>

        {/* ⑤ 今月の予想給与（折りたたみ式） */}
        <div className="card salary-card" id="salaryCard" style={{display:'none',borderTop:'4px solid #059669'}}>
          <div className="salary-summary-header" id="salarySummaryHeader">
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <div className="card-icon" style={{background:'#059669'}}>💴</div>
              <span style={{fontSize:'.95rem',fontWeight:800,color:'#059669'}}>今月の予想給与</span>
            </div>
            <div className="salary-total-amount" id="salaryTotalAmount">0円</div>
            <button className="salary-toggle-btn" id="salaryToggleBtn">▼ 詳細を見る</button>
          </div>
          <div className="salary-detail" id="salaryDetail" style={{display:'none'}}>
            <div id="salaryCardInner"></div>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="wtm-note">
          <span>⚠️</span>
          <span id="noteText">本ツールの給与は概算です。実際の給与は勤務先の計算方法、各種手当、税金、社会保険等により異なるため、目安として利用してください。在留資格や最新の制度は必ず公式情報で確認してください。</span>
        </div>
        {/* 勤怠スケジュールコピー */}
        <div className="wtm-copy-link">
          <span>📋 勤怠スケジュールをコピーしたい場合は、</span>
          <a href="#" id="btnCopySchedule" style={{color:'#1a6fc4',fontWeight:700,textDecoration:'underline'}}>こちらから。</a>
        </div>

        {/* バックアップ・復元・パスワード変更・データ削除 */}
        <div style={{marginTop:'16px',display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap'}}>
          <button id="btnExport" style={{border:'1.5px solid #059669',borderRadius:'8px',padding:'6px 14px',fontSize:'.72rem',fontWeight:600,background:'#f0fdf4',color:'#059669',cursor:'pointer'}}>📤 データエクスポート</button>
          <button id="btnImport" style={{border:'1.5px solid #1a6fc4',borderRadius:'8px',padding:'6px 14px',fontSize:'.72rem',fontWeight:600,background:'#e8f1fb',color:'#1a6fc4',cursor:'pointer'}}>📥 データインポート</button>
          <button id="btnChangePw" style={{border:'1.5px solid #d1d5db',borderRadius:'8px',padding:'6px 14px',fontSize:'.72rem',fontWeight:600,background:'#fff',color:'#374151',cursor:'pointer'}}>🔑 パスワード変更</button>
          <button id="btnDeleteAll" style={{border:'1.5px solid #fca5a5',borderRadius:'8px',padding:'6px 14px',fontSize:'.72rem',fontWeight:600,background:'#fff',color:'#dc2626',cursor:'pointer'}}>🗑️ 全データ削除</button>
        </div>
        <input type="file" id="importFileInput" accept=".json" style={{display:'none'}} />
        {/* パスワード変更ダイアログ */}
        <div id="changePwDialog" style={{display:'none',marginTop:'12px',background:'#f9fafb',borderRadius:'12px',padding:'16px',border:'1px solid #e5e7eb'}}>
          <h4 style={{fontSize:'.85rem',fontWeight:700,marginBottom:'10px'}}>🔑 パスワード変更</h4>
          <input id="cpOldPw" type="password" placeholder="現在のパスワード" style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1.5px solid #d1d5db',fontSize:'.85rem',marginBottom:'8px',outline:'none'}} />
          <input id="cpNewPw" type="password" placeholder="新しいパスワード (4文字以上)" style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1.5px solid #d1d5db',fontSize:'.85rem',marginBottom:'8px',outline:'none'}} />
          <input id="cpNewPw2" type="password" placeholder="新しいパスワード (確認)" style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1.5px solid #d1d5db',fontSize:'.85rem',marginBottom:'8px',outline:'none'}} />
          <p id="cpError" style={{color:'#dc2626',fontSize:'.72rem',marginBottom:'6px',display:'none'}}></p>
          <div style={{display:'flex',gap:'8px'}}>
            <button id="cpSubmit" style={{flex:1,padding:'10px',borderRadius:'8px',border:'none',background:'#1a6fc4',color:'#fff',fontSize:'.82rem',fontWeight:700,cursor:'pointer'}}>変更する</button>
            <button id="cpCancel" style={{flex:1,padding:'10px',borderRadius:'8px',border:'1.5px solid #d1d5db',background:'#fff',color:'#374151',fontSize:'.82rem',fontWeight:600,cursor:'pointer'}}>キャンセル</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function WorkTimeManager() {
  return (
    <PasswordGate>
      <WorkTimeManagerInner />
    </PasswordGate>
  );
}
