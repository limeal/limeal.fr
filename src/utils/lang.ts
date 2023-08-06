import langs from './lang.json'

interface Translation {
    id: string;
    fr: string;
    en: string;
    es: string;
    kr: string;
}

const getTranslation = (lang: string, id: string): string => {
    const text = langs.find((lang) => lang.id === id);

    if (text) {
        return text[lang as keyof Translation] || text['en'];
    }

    return '';
}



export default getTranslation;