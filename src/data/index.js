// Kurtarılan veriler (orijinal aab'den decompile edildi)
import zikirlerData from './zikirler.json';
import esmaData from './esma.json';
import ayetlerData from './ayetler.json';

export const ZIKIRLER = zikirlerData;
export const ESMA = esmaData;
export const AYETLER = ayetlerData;

export const CATEGORIES = [
  { id: 'all', name: 'Tümü', icon: 'apps' },
  { id: 'tesbih', name: 'Tesbih', icon: 'radio-button-on' },
  { id: 'dua', name: 'Dua', icon: 'hand-left' },
  { id: 'salavat', name: 'Salavat', icon: 'heart' },
  { id: 'istigfar', name: 'İstiğfar', icon: 'refresh' },
  { id: 'other', name: 'Diğer', icon: 'ellipsis-horizontal' },
];

// Günlük toplam sayıya göre motivasyon mesajı (orijinal eşikler)
export function motivationMessage(todayTotal) {
  if (!todayTotal || todayTotal === 0)
    return 'Her zikir bir nur, her dua bir ışık. Başlamak için en güzel an şimdi.';
  if (todayTotal < 100) return 'Güzel başladınız! Her zikir kalbinize huzur katar.';
  if (todayTotal < 500) return 'Maşallah! Bugün çok güzel ilerliyorsunuz.';
  return 'Subhanallah! Bugün harika bir gün geçirdiniz. Allah kabul etsin.';
}
