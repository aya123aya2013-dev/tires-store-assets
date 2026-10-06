// #19 تشكيلة مختصرة (إطار لكل طريق)
module.exports = (F, def) =>
  def('home.lineup', 'تشكيلة مختصرة (إطار لكل طريق)', 'Lineup (A Tire for Every Road)', 'sicon-layout-grid-rearrange', [
    F.cover('تشكيلة مختصرة'),
    F.tip('عمود تعريف + 4 كروت مصغّرة من منتجاتك. الشارة فوق الكرت هي اسم تصنيف المنتج.'),
    F.head('h-texts', 'النصوص'),
    F.text('kicker', 'السطر الصغير', 'تشكيلتنا', 40),
    F.text('title', 'العنوان', 'إطار لكل طريق', 60),
    F.area('text', 'النص', 'من السيدان اليومية لين الدفع الرباعي والنقل — اختر الفئة واكتشف الأنسب.', 160),
    F.text('btn_text', 'نص الزر', 'كل الإطارات', 30, { description: 'لإخفاء الزر اترك الحقل فارغاً' }),
    F.link('btn_link', 'رابط الزر'),
    F.head('h-products', 'المنتجات (4)'),
    ...F.productSource('products', 'best_selling'),
    F.sw('show_type', 'إظهار شارة النوع (التصنيف)', true),
    ...F.common('my-lineup'),
  ]);
