-- Translated names for niches, languages and services.
-- `name` stays the English source name; `name_i18n` holds other languages, e.g. {"ja": "美容"}.
-- The app shows name_i18n[<site language>] and falls back to `name` when missing,
-- so a new category added in English still works everywhere.

alter table public.niches    add column if not exists name_i18n jsonb not null default '{}'::jsonb;
alter table public.languages add column if not exists name_i18n jsonb not null default '{}'::jsonb;
alter table public.services  add column if not exists name_i18n jsonb not null default '{}'::jsonb;

update public.niches t set name_i18n = t.name_i18n || jsonb_build_object('ja', m.ja)
from (values
  ('Anime & Manga','アニメ・マンガ'),('Art & Design','アート・デザイン'),('Automotive','自動車'),
  ('Beauty','美容'),('Business & Finance','ビジネス・金融'),('Culture','カルチャー'),
  ('Education','教育'),('Entertainment','エンターテインメント'),('Fashion','ファッション'),
  ('Fitness','フィットネス'),('Food & Drink','グルメ・飲料'),('Gaming','ゲーム'),
  ('Health & Wellness','健康・ウェルネス'),('Home & Interior','ホーム・インテリア'),
  ('Lifestyle','ライフスタイル'),('Music','音楽'),('Other','その他'),('Parenting','育児'),
  ('Pets','ペット'),('Skincare','スキンケア'),('Sports','スポーツ'),('Tech','テクノロジー'),
  ('Travel','旅行')
) as m(name, ja) where t.name = m.name;

update public.languages t set name_i18n = t.name_i18n || jsonb_build_object('ja', m.ja)
from (values
  ('Arabic','アラビア語'),('Cantonese','広東語'),('Dutch','オランダ語'),('English','英語'),
  ('French','フランス語'),('German','ドイツ語'),('Hindi','ヒンディー語'),
  ('Indonesian','インドネシア語'),('Italian','イタリア語'),('Japanese','日本語'),
  ('Korean','韓国語'),('Mandarin Chinese','中国語（標準語）'),('Polish','ポーランド語'),
  ('Portuguese','ポルトガル語'),('Russian','ロシア語'),('Spanish','スペイン語'),
  ('Tagalog','タガログ語'),('Thai','タイ語'),('Turkish','トルコ語'),('Vietnamese','ベトナム語')
) as m(name, ja) where t.name = m.name;

update public.services t set name_i18n = t.name_i18n || jsonb_build_object('ja', m.ja)
from (values
  ('Event appearance','イベント出演'),('Instagram post','Instagram投稿'),
  ('Instagram Reel','Instagramリール'),('Localization & voiceover','ローカライズ・ナレーション'),
  ('Product photography','商品撮影'),('Product review','商品レビュー'),
  ('TikTok video','TikTok動画'),('UGC photos','UGC写真'),('UGC video','UGC動画'),
  ('YouTube integration','YouTubeタイアップ')
) as m(name, ja) where t.name = m.name;

notify pgrst, 'reload schema';
