import React from 'react';
import { useTranslation } from 'react-i18next';
import { getPasswordStrength } from '../utils/password';

interface PasswordStrengthBarProps {
  password: string;
}

const strengthColors = {
  weak: 'bg-red-500',
  medium: 'bg-yellow-500',
  strong: 'bg-green-500',
};

const strengthSegments = {
  weak: 1,
  medium: 2,
  strong: 3,
};

const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ password }) => {
  const { t } = useTranslation();

  if (!password) return null;

  const strength = getPasswordStrength(password);

  return (
    <div className="mt-2">
      <div className="flex space-x-1 mb-1">
        {[1, 2, 3].map((seg) => (
          <div
            key={seg}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              seg <= strengthSegments[strength]
                ? strengthColors[strength]
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <span className={`text-xs ${
        strength === 'weak' ? 'text-red-500' :
        strength === 'medium' ? 'text-yellow-600' : 'text-green-500'
      }`}>
        {t(`auth.password${strength.charAt(0).toUpperCase() + strength.slice(1)}`)}
      </span>
    </div>
  );
};

export default PasswordStrengthBar;
