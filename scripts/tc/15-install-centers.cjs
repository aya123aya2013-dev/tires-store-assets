// #15 مراكز التركيب
module.exports = (F, def) =>
  def('home.install-centers', 'مراكز التركيب', 'Fitting Centres', 'sicon-location', [
    F.cover('مراكز التركيب'),
    F.tip('بطاقة لكل مركز: صورة، الاسم، العنوان، الدوام، الجوال، رابط الخريطة وزر الحجز. احذف الأمثلة وأضف مراكزك.'),
    F.head('h-texts', 'النصوص'),
    F.text('kicker', 'السطر الصغير فوق العنوان', 'مراكز التركيب', 40),
    F.text('title', 'العنوان', 'أقرب مركز لك بالرياض.', 60),
    F.text('text', 'النص الجانبي', 'اختر المركز في السلة، ونجهّز إطاراتك قبل ما توصل.', 140),
    F.head('h-centers', 'المراكز'),
    F.collection('centers', 'المراكز', 'مركز', [
      F.image('image', 'الصورة', '800×600 بكسل', 800, 600),
      F.text('name', 'اسم المركز', 'مركز الملقا', 40),
      F.text('address', 'العنوان', 'طريق أنس بن مالك، حي الملقا', 80),
      F.text('hours', 'الدوام', 'السبت–الخميس · 9 ص – 11 م', 60),
      F.plain('phone', 'رقم الجوال', '05xxxxxxxx', { maxLength: 20 }),
      F.link('map_link', 'رابط الخريطة (زر الاتجاهات)', 'رابط Google Maps للمركز — اتركه فارغاً لإخفاء الزر'),
      F.sw('open_now', 'إظهار «مفتوح الآن»', true),
      F.text('book_text', 'نص زر الحجز', 'احجز موعد', 30),
      F.link('book_link', 'رابط زر الحجز', 'اتركه فارغاً لإخفاء الزر'),
    ], [
      { 'centers.name': 'مركز الملقا', 'centers.address': 'طريق أنس بن مالك، حي الملقا', 'centers.hours': 'السبت–الخميس · 9 ص – 11 م', 'centers.open_now': true, 'centers.book_text': 'احجز موعد' },
      { 'centers.name': 'مركز السويدي', 'centers.address': 'طريق ديراب، حي السويدي', 'centers.hours': 'السبت–الخميس · 9 ص – 11 م', 'centers.open_now': true, 'centers.book_text': 'احجز موعد' },
    ], 1, 12),
    ...F.common('my-centers'),
  ]);
