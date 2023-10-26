import api from './api';

interface LanguageNames {
    [code: string]: string;
}

const LanguageNamesJSON: LanguageNames = {};

api('languages.json')
    .then((data: LanguageNames) => {
        for (const code in data) LanguageNamesJSON[code] = data[code];
    })
    .catch((error) => {
        console.log("Error : ", error);
    });

const languageNames: LanguageNames = LanguageNamesJSON;

export default languageNames;