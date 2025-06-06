import { useState, FC } from 'react';
import { Globe, Check } from 'lucide-react';

type Language = {
  code: string;
  name: string;
  flag: string;
};

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
];

interface LanguageSelectorProps {
  className?: string;
  onChange?: (language: string) => void;
  value?: string;
}

const LanguageSelector: FC<LanguageSelectorProps> = ({
  className = '',
  onChange,
  value = 'en',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(value);

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    if (onChange) {
      onChange(languageCode);
    }
    setIsOpen(false);
  };

  const selectedLang =
    languages.find((lang) => lang.code === selectedLanguage) || languages[0];

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        id="language-select"
        aria-haspopup="listbox"
        aria-expanded="true"
        aria-labelledby="language-select"
        data-testid="language-selector-button"
      >
        <div className="flex items-center">
          <span className="mr-2 text-lg">{selectedLang.flag}</span>
          <span>{selectedLang.name}</span>
        </div>
        <svg
          className="w-5 h-5 ml-2 -mr-1 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg"
          role="listbox"
          aria-labelledby="language-select"
          data-testid="language-selector-dropdown"
        >
          <ul className="py-1 overflow-auto text-base rounded-md max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {languages.map((language) => (
              <li
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`relative py-2 pl-3 pr-9 cursor-pointer select-none hover:bg-gray-100 ${
                  selectedLanguage === language.code ? 'bg-green-50' : ''
                }`}
                role="option"
                aria-selected={selectedLanguage === language.code}
                data-testid={`language-option-${language.code}`}
              >
                <div className="flex items-center">
                  <span className="mr-2 text-lg">{language.flag}</span>
                  <span className="block font-normal truncate">
                    {language.name}
                  </span>
                </div>
                {selectedLanguage === language.code && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-green-600">
                    <Check className="w-5 h-5" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
