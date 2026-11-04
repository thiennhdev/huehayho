// Bài luyện phát âm: cặp âm tối thiểu (minimal pairs) tiếng Anh & thanh điệu / thanh mẫu tiếng Trung
// Tập trung vào những lỗi người Việt hay mắc nhất.
import type { Lang } from "./types";

export interface Drill {
  text: string;
  phon: string; // IPA hoặc pinyin
  vi?: string;
}

export interface DrillGroup {
  id: string;
  title: string;
  focus: string; // âm / thanh cần luyện
  tip: string; // mẹo cho người Việt
  items: Drill[];
}

export const pronunciation: Record<Lang, DrillGroup[]> = {
  en: [
    {
      id: "i-ii",
      title: "ship – sheep",
      focus: "/ɪ/ ngắn vs /iː/ dài",
      tip: "/ɪ/ đọc ngắn, miệng thả lỏng (gần 'i' trong 'ít'); /iː/ kéo dài, môi bành sang hai bên như đang cười.",
      items: [
        { text: "ship", phon: "/ʃɪp/", vi: "con tàu" },
        { text: "sheep", phon: "/ʃiːp/", vi: "con cừu" },
        { text: "live", phon: "/lɪv/", vi: "sống" },
        { text: "leave", phon: "/liːv/", vi: "rời đi" },
        { text: "The sheep is on the ship.", phon: "/ðə ʃiːp ɪz ɒn ðə ʃɪp/" },
      ],
    },
    {
      id: "ae-e",
      title: "bad – bed",
      focus: "/æ/ vs /e/",
      tip: "/æ/ mở miệng rộng, hàm dưới hạ xuống (giữa 'a' và 'e'); /e/ miệng mở vừa như 'e' tiếng Việt.",
      items: [
        { text: "bad", phon: "/bæd/", vi: "tệ" },
        { text: "bed", phon: "/bed/", vi: "giường" },
        { text: "man", phon: "/mæn/", vi: "đàn ông" },
        { text: "men", phon: "/men/", vi: "những người đàn ông" },
        { text: "That man has a bad bed.", phon: "/ðæt mæn hæz ə bæd bed/" },
      ],
    },
    {
      id: "th",
      title: "think – sink",
      focus: "/θ/ và /ð/ (th)",
      tip: "Đặt đầu lưỡi giữa hai hàm răng rồi thổi hơi: /θ/ không rung (think), /ð/ có rung (this). Đừng đọc thành 'th' tiếng Việt, 's' hay 'd'.",
      items: [
        { text: "think", phon: "/θɪŋk/", vi: "nghĩ" },
        { text: "sink", phon: "/sɪŋk/", vi: "bồn rửa" },
        { text: "three", phon: "/θriː/", vi: "số ba" },
        { text: "they", phon: "/ðeɪ/", vi: "họ" },
        { text: "I think these three things are the same.", phon: "/aɪ θɪŋk ðiːz θriː θɪŋz ɑː ðə seɪm/" },
      ],
    },
    {
      id: "v-b",
      title: "very – berry",
      focus: "/v/ vs /b/, /f/ vs /v/",
      tip: "/v/: răng trên chạm nhẹ môi dưới và rung; /b/: hai môi bật vào nhau. /f/ giống /v/ nhưng không rung.",
      items: [
        { text: "very", phon: "/ˈveri/", vi: "rất" },
        { text: "berry", phon: "/ˈberi/", vi: "quả mọng" },
        { text: "fan", phon: "/fæn/", vi: "cái quạt" },
        { text: "van", phon: "/væn/", vi: "xe tải nhỏ" },
        { text: "Vivian has a very valuable van.", phon: "/ˈvɪviən hæz ə ˈveri ˈvæljuəbl væn/" },
      ],
    },
    {
      id: "l-r",
      title: "light – right",
      focus: "/l/ vs /r/",
      tip: "/r/ tiếng Anh: cong lưỡi lên nhưng KHÔNG chạm vòm miệng, môi hơi tròn; /l/: đầu lưỡi chạm lợi trên.",
      items: [
        { text: "light", phon: "/laɪt/", vi: "ánh sáng" },
        { text: "right", phon: "/raɪt/", vi: "đúng, bên phải" },
        { text: "long", phon: "/lɒŋ/", vi: "dài" },
        { text: "wrong", phon: "/rɒŋ/", vi: "sai" },
        { text: "Turn right at the red light.", phon: "/tɜːn raɪt ət ðə red laɪt/" },
      ],
    },
    {
      id: "final-s-z",
      title: "price – prize",
      focus: "Âm cuối /s/ /z/ /t/ /d/",
      tip: "Người Việt hay nuốt âm cuối. Phải bật rõ âm cuối — nhất là -s số nhiều, -ed quá khứ. /z/ có rung, /s/ không rung.",
      items: [
        { text: "price", phon: "/praɪs/", vi: "giá" },
        { text: "prize", phon: "/praɪz/", vi: "giải thưởng" },
        { text: "She likes cats and dogs.", phon: "/ʃiː laɪks kæts ənd dɒɡz/" },
        { text: "I watched a movie and played games.", phon: "/aɪ wɒtʃt ə ˈmuːvi ənd pleɪd ɡeɪmz/" },
      ],
    },
    {
      id: "sh-s",
      title: "sheet – seat",
      focus: "/ʃ/ vs /s/, /tʃ/ vs /ʃ/",
      tip: "/ʃ/ (sh) môi chu ra phía trước như suỵt; /s/ môi dẹt; /tʃ/ (ch) bật mạnh như 'ch' nhưng môi tròn hơn.",
      items: [
        { text: "sheet", phon: "/ʃiːt/", vi: "tờ giấy, ga giường" },
        { text: "seat", phon: "/siːt/", vi: "chỗ ngồi" },
        { text: "chip", phon: "/tʃɪp/", vi: "khoai chiên, chip" },
        { text: "She sells seashells by the seashore.", phon: "/ʃiː selz ˈsiːʃelz baɪ ðə ˈsiːʃɔː/" },
      ],
    },
    {
      id: "linking",
      title: "Nối âm & trọng âm câu",
      focus: "Linking, weak forms",
      tip: "Phụ âm cuối nối với nguyên âm đầu từ sau: 'turn_off' → /tɜːnɒf/. Từ chức năng (to, of, and, a) đọc nhẹ /tə/ /əv/ /ən/ /ə/.",
      items: [
        { text: "Can I have a cup of tea?", phon: "/kən‿aɪ hæv‿ə kʌp‿əv tiː/" },
        { text: "Turn off the lights, please.", phon: "/tɜːn‿ɒf ðə laɪts pliːz/" },
        { text: "What are you going to do?", phon: "/wɒt‿ə jə ˈɡəʊɪŋ tə duː/" },
        { text: "I'd like an apple and an orange.", phon: "/aɪd laɪk‿ən‿ˈæpl‿ən‿ən‿ˈɒrɪndʒ/" },
      ],
    },
  ],
  zh: [
    {
      id: "tones-1",
      title: "Bốn thanh điệu",
      focus: "ā á ǎ à",
      tip: "Thanh 1 cao – bằng; thanh 2 đi lên (như dấu sắc); thanh 3 xuống thấp rồi lên (như dấu hỏi); thanh 4 rơi mạnh (như ra lệnh).",
      items: [
        { text: "妈妈骂马", phon: "māma mà mǎ", vi: "mẹ mắng con ngựa" },
        { text: "八拔把爸", phon: "bā bá bǎ bà" },
        { text: "我很好", phon: "wǒ hěn hǎo", vi: "tôi rất khoẻ (3-3-3 → 2-2-3)" },
      ],
    },
    {
      id: "tones-pairs",
      title: "Cặp thanh (từ 2 âm tiết)",
      focus: "1-1 … 4-4",
      tip: "Luyện theo cặp thanh giúp nói tự nhiên hơn học từng thanh riêng lẻ. Thanh 3 đứng trước thanh khác thường chỉ đọc nửa (hạ thấp, không lên lại).",
      items: [
        { text: "今天", phon: "jīntiān (1-1)", vi: "hôm nay" },
        { text: "中国", phon: "Zhōngguó (1-2)", vi: "Trung Quốc" },
        { text: "喝水", phon: "hē shuǐ (1-3)", vi: "uống nước" },
        { text: "工作", phon: "gōngzuò (1-4)", vi: "làm việc" },
        { text: "学习", phon: "xuéxí (2-2)", vi: "học tập" },
        { text: "苹果", phon: "píngguǒ (2-3)", vi: "quả táo" },
        { text: "老师", phon: "lǎoshī (3-1)", vi: "giáo viên" },
        { text: "考试", phon: "kǎoshì (3-4)", vi: "kỳ thi" },
        { text: "电脑", phon: "diànnǎo (4-3)", vi: "máy tính" },
        { text: "再见", phon: "zàijiàn (4-4)", vi: "tạm biệt" },
      ],
    },
    {
      id: "sandhi",
      title: "Biến điệu 3-3, 不, 一",
      focus: "nǐ hǎo → ní hǎo",
      tip: "3+3 → 2+3; 不 trước thanh 4 → bú; 一 trước thanh 4 → yí, trước thanh 1/2/3 → yì.",
      items: [
        { text: "你好", phon: "nǐ hǎo → ní hǎo", vi: "xin chào" },
        { text: "可以", phon: "kěyǐ → kéyǐ", vi: "có thể" },
        { text: "不是", phon: "bú shì", vi: "không phải" },
        { text: "一起", phon: "yìqǐ", vi: "cùng nhau" },
        { text: "一下", phon: "yíxià", vi: "một chút" },
      ],
    },
    {
      id: "zh-z",
      title: "zh ch sh r – z c s",
      focus: "Âm uốn lưỡi vs đầu lưỡi thẳng",
      tip: "zh/ch/sh/r: cong đầu lưỡi lên chạm vòm cứng. z/c/s: đầu lưỡi thẳng, đặt sau răng cửa dưới. Đây là lỗi phổ biến nhất của người Việt (và cả người miền Nam Trung Quốc!).",
      items: [
        { text: "知道", phon: "zhīdào", vi: "biết" },
        { text: "自己", phon: "zìjǐ", vi: "bản thân" },
        { text: "吃饭", phon: "chīfàn", vi: "ăn cơm" },
        { text: "热", phon: "rè", vi: "nóng" },
        { text: "四是四，十是十。", phon: "sì shì sì, shí shì shí", vi: "bốn là bốn, mười là mười (câu nói lái)" },
      ],
    },
    {
      id: "jqx",
      title: "j q x & ü",
      focus: "Âm mặt lưỡi và nguyên âm ü",
      tip: "j/q/x: mặt lưỡi nâng chạm vòm cứng, môi dẹt như đang cười; q bật hơi mạnh. ü: đọc 'i' rồi tròn môi lại (như 'uy' nhưng giữ nguyên lưỡi).",
      items: [
        { text: "去", phon: "qù", vi: "đi" },
        { text: "学校", phon: "xuéxiào", vi: "trường học" },
        { text: "女儿", phon: "nǚ'ér", vi: "con gái" },
        { text: "绿色", phon: "lǜsè", vi: "màu xanh lá" },
        { text: "我想去旅游。", phon: "wǒ xiǎng qù lǚyóu", vi: "tôi muốn đi du lịch" },
      ],
    },
    {
      id: "aspirated",
      title: "Bật hơi: b–p, d–t, g–k",
      focus: "Âm bật hơi",
      tip: "p/t/k/q/ch/c phải bật một luồng hơi mạnh (để tờ giấy trước miệng thấy rung). b/d/g không bật hơi — gần 'p', 't', 'c' tiếng Việt.",
      items: [
        { text: "跑步", phon: "pǎobù", vi: "chạy bộ" },
        { text: "弟弟", phon: "dìdi", vi: "em trai" },
        { text: "他", phon: "tā", vi: "anh ấy" },
        { text: "可爱", phon: "kě'ài", vi: "đáng yêu" },
        { text: "葡萄", phon: "pútao", vi: "quả nho" },
      ],
    },
    {
      id: "phrases",
      title: "Câu giao tiếp thông dụng",
      focus: "Ngữ điệu cả câu",
      tip: "Đọc theo cụm từ, không đọc từng chữ rời rạc. Thanh nhẹ (的, 了, 吗, 呢) đọc ngắn và nhẹ.",
      items: [
        { text: "你叫什么名字？", phon: "nǐ jiào shénme míngzi?" },
        { text: "我们一起学习吧。", phon: "wǒmen yìqǐ xuéxí ba." },
        { text: "这个多少钱？", phon: "zhège duōshao qián?" },
        { text: "我爱你，我想你。", phon: "wǒ ài nǐ, wǒ xiǎng nǐ." },
      ],
    },
  ],
};
