"""
Sample N4 vocabulary and kanji data for prebuilt decks.
This is a curated subset for POC demonstration.
In production, replace with full JMdict/KANJIDIC derived data.
"""

# Sample N4 Vocabulary (30 cards)
N4_VOCAB = [
    {
        "front": "私 (わたし)",
        "back": "I, me",
        "notes": "Personal pronoun, polite form",
        "tags": ["pronoun", "n4", "basic"]
    },
    {
        "front": "あなた",
        "back": "you",
        "notes": "Personal pronoun, can be omitted in conversation",
        "tags": ["pronoun", "n4", "basic"]
    },
    {
        "front": "食べる (たべる)",
        "back": "to eat",
        "notes": "Ichidan verb",
        "tags": ["verb", "n4", "food"]
    },
    {
        "front": "飲む (のむ)",
        "back": "to drink",
        "notes": "Godan verb",
        "tags": ["verb", "n4", "food"]
    },
    {
        "front": "見る (みる)",
        "back": "to see, to watch",
        "notes": "Ichidan verb",
        "tags": ["verb", "n4", "basic"]
    },
    {
        "front": "聞く (きく)",
        "back": "to hear, to listen, to ask",
        "notes": "Godan verb, multiple meanings",
        "tags": ["verb", "n4", "basic"]
    },
    {
        "front": "話す (はなす)",
        "back": "to speak, to talk",
        "notes": "Godan verb",
        "tags": ["verb", "n4", "communication"]
    },
    {
        "front": "書く (かく)",
        "back": "to write",
        "notes": "Godan verb",
        "tags": ["verb", "n4", "basic"]
    },
    {
        "front": "読む (よむ)",
        "back": "to read",
        "notes": "Godan verb",
        "tags": ["verb", "n4", "basic"]
    },
    {
        "front": "学校 (がっこう)",
        "back": "school",
        "notes": "Common noun",
        "tags": ["noun", "n4", "education"]
    },
    {
        "front": "先生 (せんせい)",
        "back": "teacher",
        "notes": "Also used as honorific title",
        "tags": ["noun", "n4", "people"]
    },
    {
        "front": "学生 (がくせい)",
        "back": "student",
        "notes": "Common noun",
        "tags": ["noun", "n4", "people"]
    },
    {
        "front": "友達 (ともだち)",
        "back": "friend",
        "notes": "Common noun",
        "tags": ["noun", "n4", "people"]
    },
    {
        "front": "家 (いえ)",
        "back": "house, home",
        "notes": "Common noun",
        "tags": ["noun", "n4", "places"]
    },
    {
        "front": "部屋 (へや)",
        "back": "room",
        "notes": "Common noun",
        "tags": ["noun", "n4", "places"]
    },
    {
        "front": "大きい (おおきい)",
        "back": "big, large",
        "notes": "I-adjective",
        "tags": ["adjective", "n4", "description"]
    },
    {
        "front": "小さい (ちいさい)",
        "back": "small, little",
        "notes": "I-adjective",
        "tags": ["adjective", "n4", "description"]
    },
    {
        "front": "高い (たかい)",
        "back": "high, tall, expensive",
        "notes": "I-adjective, multiple meanings",
        "tags": ["adjective", "n4", "description"]
    },
    {
        "front": "安い (やすい)",
        "back": "cheap, inexpensive",
        "notes": "I-adjective",
        "tags": ["adjective", "n4", "description"]
    },
    {
        "front": "新しい (あたらしい)",
        "back": "new",
        "notes": "I-adjective",
        "tags": ["adjective", "n4", "description"]
    },
    {
        "front": "古い (ふるい)",
        "back": "old (not for people)",
        "notes": "I-adjective",
        "tags": ["adjective", "n4", "description"]
    },
    {
        "front": "今日 (きょう)",
        "back": "today",
        "notes": "Time expression",
        "tags": ["noun", "n4", "time"]
    },
    {
        "front": "明日 (あした)",
        "back": "tomorrow",
        "notes": "Time expression",
        "tags": ["noun", "n4", "time"]
    },
    {
        "front": "昨日 (きのう)",
        "back": "yesterday",
        "notes": "Time expression",
        "tags": ["noun", "n4", "time"]
    },
    {
        "front": "毎日 (まいにち)",
        "back": "every day",
        "notes": "Time expression, adverb",
        "tags": ["adverb", "n4", "time"]
    },
    {
        "front": "時間 (じかん)",
        "back": "time, hour",
        "notes": "Common noun",
        "tags": ["noun", "n4", "time"]
    },
    {
        "front": "お金 (おかね)",
        "back": "money",
        "notes": "Common noun with honorific prefix",
        "tags": ["noun", "n4", "basic"]
    },
    {
        "front": "仕事 (しごと)",
        "back": "work, job",
        "notes": "Common noun",
        "tags": ["noun", "n4", "work"]
    },
    {
        "front": "会社 (かいしゃ)",
        "back": "company, office",
        "notes": "Common noun",
        "tags": ["noun", "n4", "work"]
    },
    {
        "front": "好き (すき)",
        "back": "to like, fond of",
        "notes": "Na-adjective, used with が particle",
        "tags": ["adjective", "n4", "emotion"]
    }
]

# Sample N4 Kanji (20 cards)
N4_KANJI = [
    {
        "front": "日",
        "back": "day, sun | ひ、にち、か",
        "notes": "Readings: ひ (hi), にち (nichi), か (ka). Common in: 日本 (nihon), 毎日 (mainichi), 今日 (kyou)",
        "tags": ["kanji", "n4", "time"]
    },
    {
        "front": "本",
        "back": "book, origin | ほん、もと",
        "notes": "Readings: ほん (hon), もと (moto). Common in: 日本 (nihon), 本 (hon - book)",
        "tags": ["kanji", "n4", "basic"]
    },
    {
        "front": "人",
        "back": "person | ひと、にん、じん",
        "notes": "Readings: ひと (hito), にん (nin), じん (jin). Common in: 日本人 (nihonjin)",
        "tags": ["kanji", "n4", "people"]
    },
    {
        "front": "年",
        "back": "year | とし、ねん",
        "notes": "Readings: とし (toshi), ねん (nen). Common in: 今年 (kotoshi), 去年 (kyonen)",
        "tags": ["kanji", "n4", "time"]
    },
    {
        "front": "月",
        "back": "month, moon | つき、がつ、げつ",
        "notes": "Readings: つき (tsuki), がつ (gatsu), げつ (getsu). Used for months and moon",
        "tags": ["kanji", "n4", "time"]
    },
    {
        "front": "火",
        "back": "fire | ひ、か",
        "notes": "Readings: ひ (hi), か (ka). Common in: 火曜日 (kayoubi - Tuesday)",
        "tags": ["kanji", "n4", "elements"]
    },
    {
        "front": "水",
        "back": "water | みず、すい",
        "notes": "Readings: みず (mizu), すい (sui). Common in: 水曜日 (suiyoubi - Wednesday)",
        "tags": ["kanji", "n4", "elements"]
    },
    {
        "front": "木",
        "back": "tree, wood | き、もく",
        "notes": "Readings: き (ki), もく (moku). Common in: 木曜日 (mokuyoubi - Thursday)",
        "tags": ["kanji", "n4", "nature"]
    },
    {
        "front": "金",
        "back": "gold, money | かね、きん",
        "notes": "Readings: かね (kane), きん (kin). Common in: お金 (okane), 金曜日 (kinyoubi)",
        "tags": ["kanji", "n4", "basic"]
    },
    {
        "front": "土",
        "back": "earth, soil | つち、ど",
        "notes": "Readings: つち (tsuchi), ど (do). Common in: 土曜日 (doyoubi - Saturday)",
        "tags": ["kanji", "n4", "elements"]
    },
    {
        "front": "大",
        "back": "big, large | おお、だい、たい",
        "notes": "Readings: おお (oo), だい (dai), たい (tai). Common in: 大きい (ookii)",
        "tags": ["kanji", "n4", "size"]
    },
    {
        "front": "小",
        "back": "small, little | ちい、しょう",
        "notes": "Readings: ちい (chii), しょう (shou). Common in: 小さい (chiisai)",
        "tags": ["kanji", "n4", "size"]
    },
    {
        "front": "中",
        "back": "middle, inside | なか、ちゅう",
        "notes": "Readings: なか (naka), ちゅう (chuu). Common in: 中 (naka - inside)",
        "tags": ["kanji", "n4", "position"]
    },
    {
        "front": "上",
        "back": "above, up | うえ、じょう",
        "notes": "Readings: うえ (ue), じょう (jou). Common in: 上 (ue - above)",
        "tags": ["kanji", "n4", "position"]
    },
    {
        "front": "下",
        "back": "below, down | した、か、げ",
        "notes": "Readings: した (shita), か (ka), げ (ge). Common in: 下 (shita - below)",
        "tags": ["kanji", "n4", "position"]
    },
    {
        "front": "左",
        "back": "left | ひだり、さ",
        "notes": "Readings: ひだり (hidari), さ (sa). Common in: 左 (hidari - left side)",
        "tags": ["kanji", "n4", "direction"]
    },
    {
        "front": "右",
        "back": "right | みぎ、ゆう、う",
        "notes": "Readings: みぎ (migi), ゆう (yuu), う (u). Common in: 右 (migi - right side)",
        "tags": ["kanji", "n4", "direction"]
    },
    {
        "front": "前",
        "back": "front, before | まえ、ぜん",
        "notes": "Readings: まえ (mae), ぜん (zen). Common in: 前 (mae - front)",
        "tags": ["kanji", "n4", "position"]
    },
    {
        "front": "後",
        "back": "after, behind | うし、あと、ご、こう",
        "notes": "Readings: うし (ushi), あと (ato), ご (go), こう (kou). Multiple meanings",
        "tags": ["kanji", "n4", "position"]
    },
    {
        "front": "先",
        "back": "previous, ahead | さき、せん",
        "notes": "Readings: さき (saki), せん (sen). Common in: 先生 (sensei - teacher)",
        "tags": ["kanji", "n4", "position"]
    }
]

# Additional N4 Topic-based Decks

# N4 Numbers and Counters (15 cards)
N4_NUMBERS = [
    {
        "front": "一 (いち)",
        "back": "one",
        "notes": "Basic number",
        "tags": ["number", "n4", "basic"]
    },
    {
        "front": "二 (に)",
        "back": "two",
        "notes": "Basic number",
        "tags": ["number", "n4", "basic"]
    },
    {
        "front": "三 (さん)",
        "back": "three",
        "notes": "Basic number",
        "tags": ["number", "n4", "basic"]
    },
    {
        "front": "四 (よん / し)",
        "back": "four",
        "notes": "よん is more common, し sounds like death",
        "tags": ["number", "n4", "basic"]
    },
    {
        "front": "五 (ご)",
        "back": "five",
        "notes": "Basic number",
        "tags": ["number", "n4", "basic"]
    },
    {
        "front": "十 (じゅう)",
        "back": "ten",
        "notes": "Basic number",
        "tags": ["number", "n4", "basic"]
    },
    {
        "front": "百 (ひゃく)",
        "back": "hundred",
        "notes": "Basic number",
        "tags": ["number", "n4", "basic"]
    },
    {
        "front": "千 (せん)",
        "back": "thousand",
        "notes": "Basic number",
        "tags": ["number", "n4", "basic"]
    },
    {
        "front": "万 (まん)",
        "back": "ten thousand",
        "notes": "Important for Japanese counting system",
        "tags": ["number", "n4", "basic"]
    },
    {
        "front": "〜人 (〜にん)",
        "back": "counter for people",
        "notes": "一人 (ひとり), 二人 (ふたり), 三人 (さんにん)...",
        "tags": ["counter", "n4", "people"]
    },
    {
        "front": "〜つ",
        "back": "general counter",
        "notes": "ひとつ、ふたつ、みっつ... (1-10)",
        "tags": ["counter", "n4", "basic"]
    },
    {
        "front": "〜本 (〜ほん)",
        "back": "counter for long objects",
        "notes": "Pens, bottles, trees, etc.",
        "tags": ["counter", "n4", "objects"]
    },
    {
        "front": "〜枚 (〜まい)",
        "back": "counter for flat objects",
        "notes": "Paper, plates, shirts, etc.",
        "tags": ["counter", "n4", "objects"]
    },
    {
        "front": "〜冊 (〜さつ)",
        "back": "counter for books",
        "notes": "Books, magazines, notebooks",
        "tags": ["counter", "n4", "objects"]
    },
    {
        "front": "〜回 (〜かい)",
        "back": "counter for times/occurrences",
        "notes": "一回 (once), 二回 (twice)...",
        "tags": ["counter", "n4", "frequency"]
    }
]

# N4 Food and Dining (20 cards)
N4_FOOD = [
    {
        "front": "ご飯 (ごはん)",
        "back": "rice, meal",
        "notes": "Both cooked rice and meal in general",
        "tags": ["noun", "n4", "food"]
    },
    {
        "front": "パン",
        "back": "bread",
        "notes": "From Portuguese 'pão'",
        "tags": ["noun", "n4", "food"]
    },
    {
        "front": "肉 (にく)",
        "back": "meat",
        "notes": "General term for meat",
        "tags": ["noun", "n4", "food"]
    },
    {
        "front": "魚 (さかな)",
        "back": "fish",
        "notes": "Also kanji for fish",
        "tags": ["noun", "n4", "food"]
    },
    {
        "front": "野菜 (やさい)",
        "back": "vegetables",
        "notes": "General term for vegetables",
        "tags": ["noun", "n4", "food"]
    },
    {
        "front": "果物 (くだもの)",
        "back": "fruit",
        "notes": "General term for fruit",
        "tags": ["noun", "n4", "food"]
    },
    {
        "front": "卵 (たまご)",
        "back": "egg",
        "notes": "Common food item",
        "tags": ["noun", "n4", "food"]
    },
    {
        "front": "牛乳 (ぎゅうにゅう)",
        "back": "milk",
        "notes": "Literally 'cow milk'",
        "tags": ["noun", "n4", "food"]
    },
    {
        "front": "水 (みず)",
        "back": "water",
        "notes": "Cold water; お湯 (おゆ) for hot water",
        "tags": ["noun", "n4", "drink"]
    },
    {
        "front": "お茶 (おちゃ)",
        "back": "tea",
        "notes": "Usually green tea",
        "tags": ["noun", "n4", "drink"]
    },
    {
        "front": "コーヒー",
        "back": "coffee",
        "notes": "From English 'coffee'",
        "tags": ["noun", "n4", "drink"]
    },
    {
        "front": "ジュース",
        "back": "juice",
        "notes": "From English 'juice'",
        "tags": ["noun", "n4", "drink"]
    },
    {
        "front": "レストラン",
        "back": "restaurant",
        "notes": "From French 'restaurant'",
        "tags": ["noun", "n4", "places"]
    },
    {
        "front": "朝ご飯 (あさごはん)",
        "back": "breakfast",
        "notes": "Morning meal",
        "tags": ["noun", "n4", "food"]
    },
    {
        "front": "昼ご飯 (ひるごはん)",
        "back": "lunch",
        "notes": "Noon meal",
        "tags": ["noun", "n4", "food"]
    },
    {
        "front": "晩ご飯 (ばんごはん)",
        "back": "dinner",
        "notes": "Evening meal",
        "tags": ["noun", "n4", "food"]
    },
    {
        "front": "美味しい (おいしい)",
        "back": "delicious, tasty",
        "notes": "I-adjective for food",
        "tags": ["adjective", "n4", "food"]
    },
    {
        "front": "まずい",
        "back": "bad-tasting, unpleasant",
        "notes": "Opposite of 美味しい",
        "tags": ["adjective", "n4", "food"]
    },
    {
        "front": "お腹が空く (おなかがすく)",
        "back": "to be hungry",
        "notes": "Literally 'stomach becomes empty'",
        "tags": ["expression", "n4", "food"]
    },
    {
        "front": "いただきます",
        "back": "phrase before eating",
        "notes": "Expresses gratitude before meals",
        "tags": ["expression", "n4", "food"]
    }
]

# N4 Transportation and Travel (15 cards)
N4_TRANSPORT = [
    {
        "front": "駅 (えき)",
        "back": "station",
        "notes": "Train or subway station",
        "tags": ["noun", "n4", "places", "transport"]
    },
    {
        "front": "電車 (でんしゃ)",
        "back": "train",
        "notes": "Electric train",
        "tags": ["noun", "n4", "transport"]
    },
    {
        "front": "バス",
        "back": "bus",
        "notes": "From English 'bus'",
        "tags": ["noun", "n4", "transport"]
    },
    {
        "front": "タクシー",
        "back": "taxi",
        "notes": "From English 'taxi'",
        "tags": ["noun", "n4", "transport"]
    },
    {
        "front": "自転車 (じてんしゃ)",
        "back": "bicycle",
        "notes": "Common transportation in Japan",
        "tags": ["noun", "n4", "transport"]
    },
    {
        "front": "車 (くるま)",
        "back": "car, vehicle",
        "notes": "General term for car",
        "tags": ["noun", "n4", "transport"]
    },
    {
        "front": "飛行機 (ひこうき)",
        "back": "airplane",
        "notes": "For air travel",
        "tags": ["noun", "n4", "transport"]
    },
    {
        "front": "船 (ふね)",
        "back": "ship, boat",
        "notes": "Water transportation",
        "tags": ["noun", "n4", "transport"]
    },
    {
        "front": "空港 (くうこう)",
        "back": "airport",
        "notes": "Place for airplanes",
        "tags": ["noun", "n4", "places", "transport"]
    },
    {
        "front": "切符 (きっぷ)",
        "back": "ticket",
        "notes": "For trains, buses, etc.",
        "tags": ["noun", "n4", "transport"]
    },
    {
        "front": "行く (いく)",
        "back": "to go",
        "notes": "Godan verb for movement",
        "tags": ["verb", "n4", "movement"]
    },
    {
        "front": "来る (くる)",
        "back": "to come",
        "notes": "Irregular verb",
        "tags": ["verb", "n4", "movement"]
    },
    {
        "front": "帰る (かえる)",
        "back": "to return, to go home",
        "notes": "Godan verb",
        "tags": ["verb", "n4", "movement"]
    },
    {
        "front": "乗る (のる)",
        "back": "to ride, to get on",
        "notes": "For vehicles",
        "tags": ["verb", "n4", "transport"]
    },
    {
        "front": "降りる (おりる)",
        "back": "to get off, to descend",
        "notes": "Opposite of 乗る",
        "tags": ["verb", "n4", "transport"]
    }
]

# N4 Colors and Descriptions (12 cards)
N4_COLORS = [
    {
        "front": "赤い (あかい)",
        "back": "red",
        "notes": "I-adjective",
        "tags": ["adjective", "n4", "color"]
    },
    {
        "front": "青い (あおい)",
        "back": "blue",
        "notes": "I-adjective, also used for green (traffic lights)",
        "tags": ["adjective", "n4", "color"]
    },
    {
        "front": "白い (しろい)",
        "back": "white",
        "notes": "I-adjective",
        "tags": ["adjective", "n4", "color"]
    },
    {
        "front": "黒い (くろい)",
        "back": "black",
        "notes": "I-adjective",
        "tags": ["adjective", "n4", "color"]
    },
    {
        "front": "黄色い (きいろい)",
        "back": "yellow",
        "notes": "I-adjective",
        "tags": ["adjective", "n4", "color"]
    },
    {
        "front": "茶色 (ちゃいろ)",
        "back": "brown",
        "notes": "Na-adjective",
        "tags": ["adjective", "n4", "color"]
    },
    {
        "front": "緑 (みどり)",
        "back": "green",
        "notes": "Noun/na-adjective",
        "tags": ["noun", "n4", "color"]
    },
    {
        "front": "ピンク",
        "back": "pink",
        "notes": "From English 'pink'",
        "tags": ["noun", "n4", "color"]
    },
    {
        "front": "綺麗 (きれい)",
        "back": "pretty, clean",
        "notes": "Na-adjective, multiple meanings",
        "tags": ["adjective", "n4", "description"]
    },
    {
        "front": "汚い (きたない)",
        "back": "dirty",
        "notes": "I-adjective",
        "tags": ["adjective", "n4", "description"]
    },
    {
        "front": "明るい (あかるい)",
        "back": "bright, cheerful",
        "notes": "I-adjective",
        "tags": ["adjective", "n4", "description"]
    },
    {
        "front": "暗い (くらい)",
        "back": "dark",
        "notes": "I-adjective",
        "tags": ["adjective", "n4", "description"]
    }
]

# N4 Weather and Seasons (12 cards)
N4_WEATHER = [
    {
        "front": "天気 (てんき)",
        "back": "weather",
        "notes": "Common noun",
        "tags": ["noun", "n4", "weather"]
    },
    {
        "front": "雨 (あめ)",
        "back": "rain",
        "notes": "Can also mean candy in different context",
        "tags": ["noun", "n4", "weather"]
    },
    {
        "front": "雪 (ゆき)",
        "back": "snow",
        "notes": "Weather phenomenon",
        "tags": ["noun", "n4", "weather"]
    },
    {
        "front": "風 (かぜ)",
        "back": "wind",
        "notes": "Also means cold/illness",
        "tags": ["noun", "n4", "weather"]
    },
    {
        "front": "曇り (くもり)",
        "back": "cloudy",
        "notes": "Cloudy weather",
        "tags": ["noun", "n4", "weather"]
    },
    {
        "front": "晴れ (はれ)",
        "back": "clear weather, sunny",
        "notes": "Good weather",
        "tags": ["noun", "n4", "weather"]
    },
    {
        "front": "暑い (あつい)",
        "back": "hot (weather)",
        "notes": "I-adjective for weather",
        "tags": ["adjective", "n4", "weather"]
    },
    {
        "front": "寒い (さむい)",
        "back": "cold (weather)",
        "notes": "I-adjective for weather",
        "tags": ["adjective", "n4", "weather"]
    },
    {
        "front": "春 (はる)",
        "back": "spring",
        "notes": "Season",
        "tags": ["noun", "n4", "seasons"]
    },
    {
        "front": "夏 (なつ)",
        "back": "summer",
        "notes": "Season",
        "tags": ["noun", "n4", "seasons"]
    },
    {
        "front": "秋 (あき)",
        "back": "autumn, fall",
        "notes": "Season",
        "tags": ["noun", "n4", "seasons"]
    },
    {
        "front": "冬 (ふゆ)",
        "back": "winter",
        "notes": "Season",
        "tags": ["noun", "n4", "seasons"]
    }
]

# N4 Family and Relationships (15 cards)
N4_FAMILY = [
    {
        "front": "家族 (かぞく)",
        "back": "family",
        "notes": "General term for family",
        "tags": ["noun", "n4", "family"]
    },
    {
        "front": "父 (ちち)",
        "back": "father (my)",
        "notes": "Humble form when speaking about own father",
        "tags": ["noun", "n4", "family"]
    },
    {
        "front": "お父さん (おとうさん)",
        "back": "father (someone else's)",
        "notes": "Polite form or addressing your father",
        "tags": ["noun", "n4", "family"]
    },
    {
        "front": "母 (はは)",
        "back": "mother (my)",
        "notes": "Humble form when speaking about own mother",
        "tags": ["noun", "n4", "family"]
    },
    {
        "front": "お母さん (おかあさん)",
        "back": "mother (someone else's)",
        "notes": "Polite form or addressing your mother",
        "tags": ["noun", "n4", "family"]
    },
    {
        "front": "兄 (あに)",
        "back": "older brother (my)",
        "notes": "Humble form",
        "tags": ["noun", "n4", "family"]
    },
    {
        "front": "お兄さん (おにいさん)",
        "back": "older brother (someone else's)",
        "notes": "Polite form",
        "tags": ["noun", "n4", "family"]
    },
    {
        "front": "姉 (あね)",
        "back": "older sister (my)",
        "notes": "Humble form",
        "tags": ["noun", "n4", "family"]
    },
    {
        "front": "お姉さん (おねえさん)",
        "back": "older sister (someone else's)",
        "notes": "Polite form",
        "tags": ["noun", "n4", "family"]
    },
    {
        "front": "弟 (おとうと)",
        "back": "younger brother",
        "notes": "No distinction between humble/polite",
        "tags": ["noun", "n4", "family"]
    },
    {
        "front": "妹 (いもうと)",
        "back": "younger sister",
        "notes": "No distinction between humble/polite",
        "tags": ["noun", "n4", "family"]
    },
    {
        "front": "子供 (こども)",
        "back": "child, children",
        "notes": "General term",
        "tags": ["noun", "n4", "family"]
    },
    {
        "front": "赤ちゃん (あかちゃん)",
        "back": "baby",
        "notes": "Infant",
        "tags": ["noun", "n4", "family"]
    },
    {
        "front": "祖父 (そふ)",
        "back": "grandfather (my)",
        "notes": "Humble form",
        "tags": ["noun", "n4", "family"]
    },
    {
        "front": "祖母 (そぼ)",
        "back": "grandmother (my)",
        "notes": "Humble form",
        "tags": ["noun", "n4", "family"]
    }
]

def get_all_sample_data():
    """Get all sample data for import."""
    return {
        "vocab": N4_VOCAB,
        "kanji": N4_KANJI,
        "numbers": N4_NUMBERS,
        "food": N4_FOOD,
        "transport": N4_TRANSPORT,
        "colors": N4_COLORS,
        "weather": N4_WEATHER,
        "family": N4_FAMILY
    }
