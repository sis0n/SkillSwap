<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Language;
use Illuminate\Database\Seeder;

class LanguageSeeder extends Seeder
{
    /**
     * CLDR-curated subset of languages for the MVP.
     *
     * Inclusion criteria:
     * 1. ISO 639-1 (two-letter) code assigned wherever possible.
     * 2. Significant first-language speaker population (per Ethnologue estimates).
     * 3. Regional relevance across Asia, Europe, Americas, Africa, and Middle East.
     * 4. Commonly taught or learned on peer-to-peer platforms (English, Spanish,
     *    Mandarin, Japanese, Korean, Filipino/Tagalog, French, Arabic, etc.).
     *
     * Rationale for subset (not full CLDR):
     * - The full CLDR dataset contains 800+ entries, many for languages with
     *   very small speaker populations or no ISO 639-1 code.
     * - A curated ~150-language set keeps the UI search experience fast and relevant.
     * - The table is stable reference data; additions require a new seeder run only.
     * - A full CLDR import can be swapped in post-MVP if needed.
     */
    public function run(): void
    {
        $languages = [
            ['code' => 'en', 'name' => 'English', 'native_name' => 'English'],
            ['code' => 'es', 'name' => 'Spanish', 'native_name' => 'Español'],
            ['code' => 'fr', 'name' => 'French', 'native_name' => 'Français'],
            ['code' => 'de', 'name' => 'German', 'native_name' => 'Deutsch'],
            ['code' => 'zh', 'name' => 'Chinese', 'native_name' => '中文'],
            ['code' => 'ja', 'name' => 'Japanese', 'native_name' => '日本語'],
            ['code' => 'ko', 'name' => 'Korean', 'native_name' => '한국어'],
            ['code' => 'pt', 'name' => 'Portuguese', 'native_name' => 'Português'],
            ['code' => 'ru', 'name' => 'Russian', 'native_name' => 'Русский'],
            ['code' => 'ar', 'name' => 'Arabic', 'native_name' => 'العربية'],
            ['code' => 'hi', 'name' => 'Hindi', 'native_name' => 'हिन्दी'],
            ['code' => 'it', 'name' => 'Italian', 'native_name' => 'Italiano'],
            ['code' => 'nl', 'name' => 'Dutch', 'native_name' => 'Nederlands'],
            ['code' => 'pl', 'name' => 'Polish', 'native_name' => 'Polski'],
            ['code' => 'tr', 'name' => 'Turkish', 'native_name' => 'Türkçe'],
            ['code' => 'vi', 'name' => 'Vietnamese', 'native_name' => 'Tiếng Việt'],
            ['code' => 'th', 'name' => 'Thai', 'native_name' => 'ไทย'],
            ['code' => 'sv', 'name' => 'Swedish', 'native_name' => 'Svenska'],
            ['code' => 'da', 'name' => 'Danish', 'native_name' => 'Dansk'],
            ['code' => 'nb', 'name' => 'Norwegian Bokmål', 'native_name' => 'Norsk Bokmål'],
            ['code' => 'nn', 'name' => 'Norwegian Nynorsk', 'native_name' => 'Norsk Nynorsk'],
            ['code' => 'fi', 'name' => 'Finnish', 'native_name' => 'Suomi'],
            ['code' => 'cs', 'name' => 'Czech', 'native_name' => 'Čeština'],
            ['code' => 'hu', 'name' => 'Hungarian', 'native_name' => 'Magyar'],
            ['code' => 'ro', 'name' => 'Romanian', 'native_name' => 'Română'],
            ['code' => 'el', 'name' => 'Greek', 'native_name' => 'Ελληνικά'],
            ['code' => 'he', 'name' => 'Hebrew', 'native_name' => 'עברית'],
            ['code' => 'id', 'name' => 'Indonesian', 'native_name' => 'Bahasa Indonesia'],
            ['code' => 'ms', 'name' => 'Malay', 'native_name' => 'Bahasa Melayu'],
            ['code' => 'tl', 'name' => 'Filipino', 'native_name' => 'Filipino'],
            ['code' => 'bn', 'name' => 'Bengali', 'native_name' => 'বাংলা'],
            ['code' => 'ta', 'name' => 'Tamil', 'native_name' => 'தமிழ்'],
            ['code' => 'te', 'name' => 'Telugu', 'native_name' => 'తెలుగు'],
            ['code' => 'mr', 'name' => 'Marathi', 'native_name' => 'मराठी'],
            ['code' => 'gu', 'name' => 'Gujarati', 'native_name' => 'ગુજરાતી'],
            ['code' => 'kn', 'name' => 'Kannada', 'native_name' => 'ಕನ್ನಡ'],
            ['code' => 'ml', 'name' => 'Malayalam', 'native_name' => 'മലയാളം'],
            ['code' => 'pa', 'name' => 'Punjabi', 'native_name' => 'ਪੰਜਾਬੀ'],
            ['code' => 'ur', 'name' => 'Urdu', 'native_name' => 'اردو'],
            ['code' => 'fa', 'name' => 'Persian', 'native_name' => 'فارسی'],
            ['code' => 'uk', 'name' => 'Ukrainian', 'native_name' => 'Українська'],
            ['code' => 'be', 'name' => 'Belarusian', 'native_name' => 'Беларуская'],
            ['code' => 'bg', 'name' => 'Bulgarian', 'native_name' => 'Български'],
            ['code' => 'sr', 'name' => 'Serbian', 'native_name' => 'Српски'],
            ['code' => 'hr', 'name' => 'Croatian', 'native_name' => 'Hrvatski'],
            ['code' => 'bs', 'name' => 'Bosnian', 'native_name' => 'Bosanski'],
            ['code' => 'sk', 'name' => 'Slovak', 'native_name' => 'Slovenčina'],
            ['code' => 'sl', 'name' => 'Slovenian', 'native_name' => 'Slovenščina'],
            ['code' => 'lt', 'name' => 'Lithuanian', 'native_name' => 'Lietuvių'],
            ['code' => 'lv', 'name' => 'Latvian', 'native_name' => 'Latviešu'],
            ['code' => 'et', 'name' => 'Estonian', 'native_name' => 'Eesti'],
            ['code' => 'sq', 'name' => 'Albanian', 'native_name' => 'Shqip'],
            ['code' => 'hy', 'name' => 'Armenian', 'native_name' => 'Հայերեն'],
            ['code' => 'ka', 'name' => 'Georgian', 'native_name' => 'ქართული'],
            ['code' => 'mn', 'name' => 'Mongolian', 'native_name' => 'Монгол'],
            ['code' => 'km', 'name' => 'Khmer', 'native_name' => 'ភាសាខ្មែរ'],
            ['code' => 'lo', 'name' => 'Lao', 'native_name' => 'ລາວ'],
            ['code' => 'my', 'name' => 'Burmese', 'native_name' => 'မြန်မာဘာသာ'],
            ['code' => 'ne', 'name' => 'Nepali', 'native_name' => 'नेपाली'],
            ['code' => 'si', 'name' => 'Sinhala', 'native_name' => 'සිංහල'],
            ['code' => 'am', 'name' => 'Amharic', 'native_name' => 'አማርኛ'],
            ['code' => 'sw', 'name' => 'Swahili', 'native_name' => 'Kiswahili'],
            ['code' => 'ha', 'name' => 'Hausa', 'native_name' => 'Hausa'],
            ['code' => 'yo', 'name' => 'Yoruba', 'native_name' => 'Yorùbá'],
            ['code' => 'ig', 'name' => 'Igbo', 'native_name' => 'Igbo'],
            ['code' => 'zu', 'name' => 'Zulu', 'native_name' => 'isiZulu'],
            ['code' => 'xh', 'name' => 'Xhosa', 'native_name' => 'isiXhosa'],
            ['code' => 'af', 'name' => 'Afrikaans', 'native_name' => 'Afrikaans'],
            ['code' => 'ca', 'name' => 'Catalan', 'native_name' => 'Català'],
            ['code' => 'eu', 'name' => 'Basque', 'native_name' => 'Euskara'],
            ['code' => 'gl', 'name' => 'Galician', 'native_name' => 'Galego'],
            ['code' => 'cy', 'name' => 'Welsh', 'native_name' => 'Cymraeg'],
            ['code' => 'ga', 'name' => 'Irish', 'native_name' => 'Gaeilge'],
            ['code' => 'gd', 'name' => 'Scottish Gaelic', 'native_name' => 'Gàidhlig'],
            ['code' => 'mt', 'name' => 'Maltese', 'native_name' => 'Malti'],
            ['code' => 'is', 'name' => 'Icelandic', 'native_name' => 'Íslenska'],
            ['code' => 'lb', 'name' => 'Luxembourgish', 'native_name' => 'Lëtzebuergesch'],
            ['code' => 'mk', 'name' => 'Macedonian', 'native_name' => 'Македонски'],
            ['code' => 'az', 'name' => 'Azerbaijani', 'native_name' => 'Azərbaycan'],
            ['code' => 'uz', 'name' => 'Uzbek', 'native_name' => 'Oʻzbek'],
            ['code' => 'kk', 'name' => 'Kazakh', 'native_name' => 'Қазақ'],
            ['code' => 'ky', 'name' => 'Kyrgyz', 'native_name' => 'Кыргыз'],
            ['code' => 'tg', 'name' => 'Tajik', 'native_name' => 'Тоҷикӣ'],
            ['code' => 'tk', 'name' => 'Turkmen', 'native_name' => 'Türkmen'],
            ['code' => 'ps', 'name' => 'Pashto', 'native_name' => 'پښتو'],
            ['code' => 'sd', 'name' => 'Sindhi', 'native_name' => 'سنڌي'],
            ['code' => 'ku', 'name' => 'Kurdish', 'native_name' => 'Kurdî'],
            ['code' => 'dv', 'name' => 'Divehi', 'native_name' => 'ދިވެހި'],
            ['code' => 'bo', 'name' => 'Tibetan', 'native_name' => 'བོད་སྐད'],
            ['code' => 'dz', 'name' => 'Dzongkha', 'native_name' => 'རྫོང་ཁ'],
            ['code' => 'jv', 'name' => 'Javanese', 'native_name' => 'Basa Jawa'],
            ['code' => 'su', 'name' => 'Sundanese', 'native_name' => 'Basa Sunda'],
            ['code' => 'ceb', 'name' => 'Cebuano', 'native_name' => 'Cebuano'],
            ['code' => 'ilo', 'name' => 'Ilocano', 'native_name' => 'Iloko'],
            ['code' => 'hmn', 'name' => 'Hmong', 'native_name' => 'Hmoob'],
            ['code' => 'ny', 'name' => 'Chichewa', 'native_name' => 'Chichewa'],
            ['code' => 'mg', 'name' => 'Malagasy', 'native_name' => 'Malagasy'],
            ['code' => 'so', 'name' => 'Somali', 'native_name' => 'Soomaali'],
            ['code' => 'ti', 'name' => 'Tigrinya', 'native_name' => 'ትግርኛ'],
            ['code' => 'om', 'name' => 'Oromo', 'native_name' => 'Afaan Oromoo'],
            ['code' => 'rw', 'name' => 'Kinyarwanda', 'native_name' => 'Ikinyarwanda'],
            ['code' => 'rn', 'name' => 'Kirundi', 'native_name' => 'Ikirundi'],
            ['code' => 'sn', 'name' => 'Shona', 'native_name' => 'chiShona'],
            ['code' => 'st', 'name' => 'Sesotho', 'native_name' => 'Sesotho'],
            ['code' => 'tn', 'name' => 'Tswana', 'native_name' => 'Setswana'],
            ['code' => 'ts', 'name' => 'Tsonga', 'native_name' => 'Xitsonga'],
            ['code' => 've', 'name' => 'Venda', 'native_name' => 'Tshivenḓa'],
            ['code' => 'nso', 'name' => 'Northern Sotho', 'native_name' => 'Sesotho sa Leboa'],
            ['code' => 'ss', 'name' => 'Swati', 'native_name' => 'SiSwati'],
            ['code' => 'ba', 'name' => 'Bashkir', 'native_name' => 'Башҡорт'],
            ['code' => 'tt', 'name' => 'Tatar', 'native_name' => 'Татар'],
            ['code' => 'cv', 'name' => 'Chuvash', 'native_name' => 'Чӑваш'],
            ['code' => 'os', 'name' => 'Ossetian', 'native_name' => 'Ирон'],
            ['code' => 'ce', 'name' => 'Chechen', 'native_name' => 'Нохчийн'],
            ['code' => 'ab', 'name' => 'Abkhazian', 'native_name' => 'Аҧсуа'],
            ['code' => 'kv', 'name' => 'Komi', 'native_name' => 'Коми'],
            ['code' => 'mhr', 'name' => 'Mari', 'native_name' => 'Марий'],
            ['code' => 'udm', 'name' => 'Udmurt', 'native_name' => 'Удмурт'],
            ['code' => 'sah', 'name' => 'Yakut', 'native_name' => 'Саха'],
            ['code' => 'tyv', 'name' => 'Tuvan', 'native_name' => 'Тыва'],
            ['code' => 'ch', 'name' => 'Chamorro', 'native_name' => 'Chamoru'],
            ['code' => 'fj', 'name' => 'Fijian', 'native_name' => 'Na Vosa Vakaviti'],
            ['code' => 'sm', 'name' => 'Samoan', 'native_name' => 'Gagana Samoa'],
            ['code' => 'to', 'name' => 'Tongan', 'native_name' => 'Lea Faka-Tonga'],
            ['code' => 'mi', 'name' => 'Maori', 'native_name' => 'Te Reo Māori'],
            ['code' => 'haw', 'name' => 'Hawaiian', 'native_name' => 'ʻŌlelo Hawaiʻi'],
            ['code' => 'la', 'name' => 'Latin', 'native_name' => 'Latina'],
            ['code' => 'sa', 'name' => 'Sanskrit', 'native_name' => 'संस्कृतम्'],
            ['code' => 'yi', 'name' => 'Yiddish', 'native_name' => 'ייִדיש'],
            ['code' => 'oc', 'name' => 'Occitan', 'native_name' => 'Occitan'],
            ['code' => 'fy', 'name' => 'Frisian', 'native_name' => 'Frysk'],
            ['code' => 'co', 'name' => 'Corsican', 'native_name' => 'Corsu'],
            ['code' => 'ht', 'name' => 'Haitian Creole', 'native_name' => 'Kreyòl Ayisyen'],
            ['code' => 'sg', 'name' => 'Sango', 'native_name' => 'Sängö'],
            ['code' => 'gn', 'name' => 'Guarani', 'native_name' => 'Avañe\'ẽ'],
            ['code' => 'ay', 'name' => 'Aymara', 'native_name' => 'Aymar'],
            ['code' => 'qu', 'name' => 'Quechua', 'native_name' => 'Runasimi'],
        ];

        $data = array_map(fn (array $lang, int $i) => [
            'code' => $lang['code'],
            'name' => $lang['name'],
            'native_name' => $lang['native_name'],
            'sort_order' => $i,
            'created_at' => now(),
            'updated_at' => now(),
        ], $languages, array_keys($languages));

        Language::insert($data);
    }
}
