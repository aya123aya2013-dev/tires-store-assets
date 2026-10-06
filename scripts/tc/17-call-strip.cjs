// #17 شريط اتصال
module.exports = (F, def) =>
  def('home.call-strip', 'شريط اتصال', 'Call Strip', 'sicon-phone', [
    F.cover('شريط اتصال'),
    F.tip('شريط غامق برقم الجوال وزر «اتصل الآن». اكتب رقم متجرك — بدون رقم يختفي الرقم والزر.'),
    F.head('h-texts', 'النصوص'),
    F.text('kicker', 'السطر الصغير', 'تفضّل الحجز بالتلفون؟', 40),
    F.text('title', 'العنوان', 'اتصل واحجز موعد التركيب.', 60),
    F.text('text', 'النص', 'نرد عليك من 9 الصبح لين 11 بالليل، طوال الأسبوع.', 120),
    F.head('h-phone', 'الاتصال'),
    F.plain('phone', 'رقم الجوال', '', { maxLength: 20, placeholder: '05xxxxxxxx' }),
    F.text('btn_text', 'نص الزر', 'اتصل الآن', 20),
    F.head('h-look', 'الشكل'),
    F.sw('gold_piece', 'إظهار القطعة الذهبية', true),
    ...F.common('my-call'),
  ]);
