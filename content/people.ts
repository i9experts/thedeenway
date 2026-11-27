import type { Locale } from "@/lib/i18n";

const en = {
  eyebrow: "Our people",
  leadership: { menu: "Leadership team", menuDesc: "The people who guide the school", title: "Leadership team", lead: "The people entrusted with guiding The Deenway School, its campuses and its Tarbiyah-integrated model." },
  faculty: { menu: "Faculty", menuDesc: "Our teachers", title: "Our faculty", lead: "No school rises above the people who teach in it. Meet the teachers who nurture our students in knowledge and character." },
  founderRole: "Founder",
  readProfile: "Read the founder's story",
  allCampuses: "All campuses",
  empty: "Profiles are being added and will appear here soon, in shaa Allah.",
  join: "Would you like to teach at Deenway?",
  joinCta: "Contact us",
};
export type PeopleDict = typeof en;

const ur: PeopleDict = {
  eyebrow: "ہمارے لوگ",
  leadership: { menu: "قیادت", menuDesc: "اسکول کی رہنمائی کرنے والے", title: "قیادت کی ٹیم", lead: "وہ افراد جنہیں دی دین وے اسکول، اس کے کیمپسز اور تربیت سے مربوط ماڈل کی رہنمائی کی ذمہ داری سونپی گئی ہے۔" },
  faculty: { menu: "اساتذہ", menuDesc: "ہمارے معلمین", title: "ہمارے اساتذہ", lead: "کوئی اسکول اپنے اساتذہ سے بلند نہیں ہو سکتا۔ ان اساتذہ سے ملیے جو ہمارے طلبہ کی علم اور کردار میں پرورش کرتے ہیں۔" },
  founderRole: "بانی",
  readProfile: "بانی کی کہانی پڑھیں",
  allCampuses: "تمام کیمپس",
  empty: "پروفائلز شامل کی جا رہی ہیں اور ان شاء اللہ جلد یہاں نظر آئیں گی۔",
  join: "کیا آپ دین وے میں پڑھانا چاہتے ہیں؟",
  joinCta: "ہم سے رابطہ کریں",
};

const ar: PeopleDict = {
  eyebrow: "فريقنا",
  leadership: { menu: "فريق القيادة", menuDesc: "من يقودون المدرسة", title: "فريق القيادة", lead: "الأشخاص المؤتمنون على قيادة مدرسة دين واي وفروعها ونموذجها المتكامل مع التربية." },
  faculty: { menu: "الهيئة التعليمية", menuDesc: "معلمونا", title: "هيئتنا التعليمية", lead: "لا ترتفع مدرسة فوق مستوى معلميها. تعرّف على المعلمين الذين يرعون طلابنا علمًا وخلقًا." },
  founderRole: "المؤسس",
  readProfile: "اقرأ قصة المؤسس",
  allCampuses: "جميع الفروع",
  empty: "تُضاف الملفات التعريفية حاليًا وستظهر هنا قريبًا إن شاء الله.",
  join: "هل ترغب في التدريس في دين واي؟",
  joinCta: "تواصل معنا",
};

const all: Record<Locale, PeopleDict> = { en, ur, ar };
export const peopleDict = (l: Locale) => all[l];
