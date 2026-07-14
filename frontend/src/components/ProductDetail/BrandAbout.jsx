import { useEffect, useState } from 'react';
import { getDownloadURL, listAll, ref } from 'firebase/storage';
import { storage } from '../../firebaseConfig';

const resolveBrandLogo = async (brand) => {
  const cleanBrand = brand.trim();

  try {
    return await getDownloadURL(ref(storage, `brands/${cleanBrand}.png`));
  } catch (error) {
    if (error?.code !== 'storage/object-not-found') throw error;
  }

  const files = await listAll(ref(storage, 'brands'));
  const logo = files.items.find((item) => item.name.toLowerCase() === `${cleanBrand.toLowerCase()}.png`);
  return logo ? getDownloadURL(logo) : '';
};

const BrandAbout = ({ brand, brandLogo, brandAboutText }) => {
  const [logoUrl, setLogoUrl] = useState(brandLogo || '');

  useEffect(() => {
    let active = true;
    if (!brand?.trim()) return undefined;

    setLogoUrl('');
    resolveBrandLogo(brand)
      .then((url) => { if (active) setLogoUrl(url); })
      .catch((error) => console.error('No se pudo cargar el logo de la marca:', error));

    return () => { active = false; };
  }, [brand]);

  return <section className="rounded-[32px] border border-slate-100 bg-slate-50 p-8 shadow-[0_15px_45px_rgba(15,23,42,0.03)] md:p-12"><div className="flex flex-col items-center gap-8 md:flex-row"><div className="flex min-h-32 w-full items-center justify-center md:w-1/3">{logoUrl ? <img src={logoUrl} alt={`Logotipo de ${brand}`} onError={() => setLogoUrl('')} className="max-h-28 max-w-full object-contain" /> : <span className="text-4xl font-black tracking-[-.06em] text-slate-900">{brand}<span className="text-emerald-500">.</span></span>}</div><div className="md:w-2/3"><p className="mb-2 text-xs font-black uppercase tracking-[.2em] text-emerald-500">Acerca del fabricante</p><h2 className="text-2xl font-black tracking-tight text-slate-900">{brand}</h2><p className="mt-4 text-sm font-medium leading-8 text-slate-600">{brandAboutText || 'Conoce la trayectoria, garantía y compromiso de calidad de este fabricante.'}</p></div></div></section>;
};

export default BrandAbout;
