import { Link } from '@salla.sa/twilight-theme-engine/common';
import { HELP_PATH, STORE_CONTACT } from './storeInfo';

/** Slim black strip above the header: contact on one side, quick links on the other. */
export function TopBar() {
  return (
    <div className="hidden bg-black text-xs text-gray-300 md:block">
      <div className="container flex items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-5">
          <a href={`tel:${STORE_CONTACT.phone}`} className="hover:text-[#ffb71b]" dir="ltr">
            {STORE_CONTACT.phone}
          </a>
          <a href={`mailto:${STORE_CONTACT.email}`} className="hover:text-[#ffb71b]">
            {STORE_CONTACT.email}
          </a>
        </div>
        <div className="flex items-center gap-5">
          <span className="text-[#ffb71b]">تركيب مجاني بالرياض</span>
          <Link to={`${HELP_PATH}#size-guide`} className="hover:text-[#ffb71b]">
            دليل المقاس
          </Link>
          <Link to={HELP_PATH} className="hover:text-[#ffb71b]">
            المساعدة
          </Link>
        </div>
      </div>
    </div>
  );
}
