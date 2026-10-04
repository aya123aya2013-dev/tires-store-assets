import { SallaMenu } from '@salla.sa/twilight-components-react/menu';
import { SallaPayments } from '@salla.sa/twilight-components-react/payments';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { FooterTrust } from '../layout/Footer';
import { BRAND_CATEGORIES, HELP_PATH, STORE_CATEGORIES, STORE_CONTACT, whatsappUrl } from './storeInfo';
import { BrandLockup } from './TireHeader';
import { IconInstagram, IconWhatsapp } from './DesignIcons';

const COLUMNS: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: 'تسوّق',
    links: [
      { to: BRAND_CATEGORIES['تاش'], label: 'كفرات تاش' },
      { to: STORE_CATEGORIES.thai, label: 'كفرات تايلندي' },
      { to: STORE_CATEGORIES.chinese, label: 'كفرات صيني' },
      { to: '/offers', label: 'العروض' },
    ],
  },
  {
    title: 'الخدمات',
    links: [
      { to: `${HELP_PATH}#install`, label: 'مراكز التركيب' },
      { to: `${HELP_PATH}#size-guide`, label: 'دليل المقاس' },
      { to: `${HELP_PATH}#faq`, label: 'التقسيط والأسئلة' },
      { to: '/orders', label: 'تتبع الطلب' },
    ],
  },
  {
    title: 'المتجر',
    links: [
      { to: HELP_PATH, label: 'المساعدة' },
      { to: '/blog', label: 'المدونة' },
      { to: `${HELP_PATH}#faq`, label: 'الأسئلة الشائعة' },
    ],
  },
];

/**
 * Footer from the approved design: brand + about + social, three link columns
 * and the merchant's own footer menu (policies), then trust / payments / legal.
 * Styles: tires-home.scss `.th-footer`.
 */
export function TireFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="th-footer" suppressHydrationWarning>
      <HookSlot name="footer:start" />

      <div className="wrap">
        <div className="cols">
          <div>
            <BrandLockup />
            <p>إطارات أصلية لكل سيارة، مع تركيب مجاني في مراكزنا بالرياض وتوصيل لجميع مناطق المملكة.</p>
            <div className="soc">
              <a
                href={`https://instagram.com/${STORE_CONTACT.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="انستقرام"
              >
                <IconInstagram />
              </a>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" aria-label="واتساب">
                <IconWhatsapp />
              </a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4>السياسات</h4>
            {/* The merchant's footer menu (shipping, returns, terms, privacy). */}
            <SallaMenu
              source="footer"
              useReactLink
              className="store-footer__menu store-footer__menu--stacked"
              suppressHydrationWarning
            />
          </div>
        </div>

        <div className="legal">
          <span>© {year} متجر الإطارات. جميع الحقوق محفوظة.</span>
          <FooterTrust />
          <SallaPayments />
        </div>
      </div>

      <HookSlot name="footer:end" />
    </footer>
  );
}
