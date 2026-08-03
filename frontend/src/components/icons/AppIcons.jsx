import { ArrowLeft, ArrowUpRight, FileText, Headset, Heart, MapPin, MessageSquare, PackageCheck, Pencil, Plus, Share2, ShieldCheck, Star, Trash2, Truck, X } from 'lucide-react';

const Svg = ({ children, className = 'h-5 w-5', ...props }) => <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" {...props}>{children}</svg>;

export const CartIcon = (props) => <Svg {...props}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></Svg>;
export const SearchIcon = (props) => <Svg {...props}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></Svg>;
export const SuccessIcon = ({ danger = false, ...props }) => <Svg {...props}>{danger ? <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M6 7h12m-10 0v11h8V7m-6-3h4l1 3H8l1-3Z" /> : <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />}</Svg>;

const featureIconClass = 'h-8 w-8 text-[#10B981]';
export const ShippingIcon = (props) => <Truck {...props} className={featureIconClass} strokeWidth={1.8} />;
export const WarrantyIcon = (props) => <ShieldCheck {...props} className={featureIconClass} strokeWidth={1.8} />;
export const SupportIcon = (props) => <Headset {...props} className={featureIconClass} strokeWidth={1.8} />;
export const BuildIcon = (props) => <PackageCheck {...props} className={featureIconClass} strokeWidth={1.8} />;
export const EditIcon = (props) => <Pencil {...props} />;
export const DeleteIcon = (props) => <Trash2 {...props} />;
export const BackIcon = (props) => <ArrowLeft {...props} />;
export const ShareIcon = (props) => <Share2 {...props} />;
export const ArrowUpRightIcon = (props) => <ArrowUpRight {...props} />;
export const FavoriteIcon = (props) => <Heart {...props} />;
export const ReviewIcon = (props) => <MessageSquare {...props} />;
export const RatingIcon = (props) => <Star {...props} />;
export const CloseIcon = (props) => <X {...props} />;
export const FileIcon = (props) => <FileText {...props} />;
export const LocationIcon = (props) => <MapPin {...props} />;
export const AddIcon = (props) => <Plus {...props} />;

export const CategoryIcon = ({ icon }) => {
  const common = 'h-4 w-4 stroke-[1.8]';
  const icons = {
    CPU: <><rect x="6" y="6" width="12" height="12" rx="3" /><rect x="9" y="9" width="6" height="6" rx="1.5" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" strokeLinecap="round" /></>,
    GPU: <><rect x="4" y="7" width="14" height="10" rx="2.5" /><path d="M18 10h2v4h-2M8 10h4M8 14h4" strokeLinecap="round" /><circle cx="10" cy="12" r="1.6" /></>,
    MB: <><rect x="5" y="4" width="14" height="16" rx="3" /><rect x="8" y="7" width="4" height="4" rx="1" /><path d="M13 8h3M13 11h3M8 14h8M8 17h5" strokeLinecap="round" /></>,
    CASE: <><rect x="6" y="3" width="12" height="18" rx="3" /><path d="M9 7h6M9 11h6M9 15h3" strokeLinecap="round" /><circle cx="10" cy="18" r="1" fill="currentColor" stroke="none" /></>,
    COOL: <><circle cx="12" cy="12" r="3" /><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M18.5 5.5l-2.8 2.8M8.3 15.7l-2.8 2.8" strokeLinecap="round" /></>,
    RAM: <><rect x="4" y="7" width="16" height="8" rx="2" /><path d="M7 7v-2M10 7v-2M13 7v-2M16 7v-2M7 15v2M10 15v2M13 15v2M16 15v2M8 10h2M11 10h2M14 10h2" strokeLinecap="round" /></>,
    SSD: <><rect x="5" y="5" width="14" height="14" rx="3" /><path d="M8 9h8M8 12h8M8 15h5" strokeLinecap="round" /></>,
    PSU: <><rect x="4" y="6" width="16" height="12" rx="3" /><circle cx="10" cy="12" r="3" /><path d="M16 9h2M16 12h2M16 15h2" strokeLinecap="round" /></>,
    MON: <><rect x="4" y="5" width="16" height="11" rx="2.5" /><path d="M9 19h6M12 16v3" strokeLinecap="round" /></>,
    PC: <><rect x="6" y="4" width="12" height="16" rx="3" /><path d="M9 8h6M9 12h6M9 16h3" strokeLinecap="round" /></>,
    KEYBOARD: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M6 9h1M9 9h1M12 9h1M15 9h1M18 9h1M6 12h1M9 12h1M12 12h1M15 12h1M18 12h1M7 15h10" strokeLinecap="round" /></>,
    MOUSE: <><rect x="7" y="3" width="10" height="18" rx="5" /><path d="M12 3v6M10 7h4" strokeLinecap="round" /></>,
    AUX: <><path d="M4 13a8 8 0 0116 0" strokeLinecap="round" /><rect x="3" y="12" width="4" height="7" rx="2" /><rect x="17" y="12" width="4" height="7" rx="2" /><path d="M7 17h1.5a2 2 0 002 2h1.5" strokeLinecap="round" /></>,
  };
  return <Svg className={common}>{icons[icon] || icons.AUX}</Svg>;
};
