export type LanguageCode = string;

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'jv', name: 'Javanese', nativeName: 'Basa Jawa' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara' },
  { code: 'gl', name: 'Galician', nativeName: 'Galego' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska' },
];

export interface Translations {
  // Title Screen
  title: string;
  subtitle: string;
  enterName: string;
  enterMansion: string;
  leaderboard: string;
  footerInfo: string;

  // HUD
  sanity: string;
  stable: string;
  shaken: string;
  terrified: string;
  breaking: string;
  level: string;

  // Intro
  intro_1: string;
  intro_2: string;
  intro_3: string;
  intro_4: string;
  intro_5: string;
  intro_6: string;
  intro_7: string;
  intro_8: string;
  intro_9: string;
  intro_10: string;
  intro_11: string;
  intro_12: string;
  intro_13: string;
  intro_14: string;

  // Level complete
  levelSurvived: string;
  sanityStat: string;

  // Game Over
  sanityLost: string;
  mindFractured: string;
  mansionClaimed: string;
  pranksSurvived: string;
  tryAgain: string;

  // Death narratives
  death_1_1: string;
  death_1_2: string;
  death_2_1: string;
  death_2_2: string;
  death_3_1: string;
  death_3_2: string;
  death_4_1: string;
  death_4_2: string;
  death_5_1: string;
  death_5_2: string;

  // Victory
  youEscaped: string;
  survivedPranks: string;
  time: string;
  pranks: string;
  journals: string;
  viewLeaderboard: string;
  playAgain: string;

  // Victory narrative
  ending_1: string;
  ending_2: string;
  ending_3: string;
  ending_4: string;
  ending_5: string;
  ending_6: string;
  ending_7: string;
  ending_8: string;
  ending_9: string;

  // Room interactions
  examine: string;
  pickupKey: string;
  readNotebook: string;
  close: string;
  descendDeeper: string;
  exits: string;

  // Minimap
  map: string;
  youAreHere: string;
  keys: string;
  roomsVisited: string;

  // Inventory
  inventory: string;
  items: string;
  noItems: string;

  // Leaderboard
  noSurvivors: string;
  levels: string;

  // Install
  installTitle: string;
  installDesc: string;
  installBtn: string;

  // Level narratives
  level_1_intro_1: string;
  level_1_intro_2: string;
  level_1_intro_3: string;
  level_1_exit_1: string;
  level_1_exit_2: string;
  level_1_exit_3: string;

  level_2_intro_1: string;
  level_2_intro_2: string;
  level_2_intro_3: string;
  level_2_exit_1: string;
  level_2_exit_2: string;
  level_2_exit_3: string;

  level_3_intro_1: string;
  level_3_intro_2: string;
  level_3_intro_3: string;
  level_3_exit_1: string;
  level_3_exit_2: string;
  level_3_exit_3: string;

  level_4_intro_1: string;
  level_4_intro_2: string;
  level_4_intro_3: string;
  level_4_exit_1: string;
  level_4_exit_2: string;
  level_4_exit_3: string;

  level_5_intro_1: string;
  level_5_intro_2: string;
  level_5_intro_3: string;
  level_5_exit_1: string;
  level_5_exit_2: string;
  level_5_exit_3: string;

  // Journal titles
  journal_1_title: string;
  journal_2_title: string;
  journal_3_title: string;
  journal_4_title: string;
  journal_5_title: string;
  journal_6_title: string;
  journal_7_title: string;
  journal_8_title: string;
  journal_9_title: string;
  journal_10_title: string;

  // Journal texts
  journal_1_text: string;
  journal_2_text: string;
  journal_3_text: string;
  journal_4_text: string;
  journal_5_text: string;
  journal_6_text: string;
  journal_7_text: string;
  journal_8_text: string;
  journal_9_text: string;
  journal_10_text: string;

  // Scare / pursuit messages
  pursuit_1: string;
  pursuit_2: string;
  pursuit_3: string;

  // Room entry scare messages
  entryScare_1: string;
  entryScare_2: string;
  entryScare_3: string;
  entryScare_4: string;
  entryScare_5: string;
  entryScare_6: string;
  entryScare_7: string;
  entryScare_8: string;
  entryScare_9: string;
  entryScare_10: string;

  // Ambush pranks
  ambush_1: string;
  ambush_2: string;
  ambush_3: string;
  ambush_4: string;
  ambush_5: string;
  ambush_6: string;
  ambush_7: string;
  ambush_8: string;
  ambush_9: string;
  ambush_10: string;

  // Level names & subtitles
  level_1_name: string;
  level_1_subtitle: string;
  level_2_name: string;
  level_2_subtitle: string;
  level_3_name: string;
  level_3_subtitle: string;
  level_4_name: string;
  level_4_subtitle: string;
  level_5_name: string;
  level_5_subtitle: string;

  // Hardcore mode
  hardcoreOn: string;
  hardcoreOff: string;

  // Share score
  shareScore: string;
  shareTitle: string;
  shareText: string;
  shareTwitter: string;
  shareReddit: string;
  shareFacebook: string;
  shareCopy: string;
  shareCopied: string;
  shareNative: string;
  shareClose: string;
  shareScoreCard: string;
}
