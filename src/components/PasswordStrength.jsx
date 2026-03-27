import { getPasswordStrength } from '../utils/validation';
import './PasswordStrength.css';

export default function PasswordStrength({ password }) {
  const strength = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="password-strength">
      <div className="strength-bars">
        <div 
          className={`strength-bar ${strength.level >= 1 ? 'active' : ''}`}
          style={{ backgroundColor: strength.level >= 1 ? strength.color : '#e0e0e0' }}
        />
        <div 
          className={`strength-bar ${strength.level >= 2 ? 'active' : ''}`}
          style={{ backgroundColor: strength.level >= 2 ? strength.color : '#e0e0e0' }}
        />
        <div 
          className={`strength-bar ${strength.level >= 3 ? 'active' : ''}`}
          style={{ backgroundColor: strength.level >= 3 ? strength.color : '#e0e0e0' }}
        />
      </div>
      <span className="strength-label" style={{ color: strength.color }}>
        {strength.label}
      </span>
    </div>
  );
}
