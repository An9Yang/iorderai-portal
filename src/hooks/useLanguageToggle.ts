import { useTranslation } from 'react-i18next';

export const useLanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const currentLanguage = i18n.language;

  return { toggleLanguage, currentLanguage };
};
