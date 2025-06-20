import React from 'react';
import zxcvbn from 'zxcvbn';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const testResult = zxcvbn(password);
  const score = testResult.score;

  const createPasswordLabel = (result: zxcvbn.ZXCVBNResult) => {
    switch (result.score) {
      case 0:
        return 'Very weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return 'Weak';
    }
  };

  const funcProgressColor = () => {
    switch (score) {
      case 0:
        return '#828282';
      case 1:
        return '#EA1111';
      case 2:
        return '#FFAD00';
      case 3:
        return '#9bc158';
      case 4:
        return '#00b500';
      default:
        return 'none';
    }
  };

  const changePasswordColor = () => ({
    width: `${(score + 1) * 20}%`,
    background: funcProgressColor(),
    height: '7px',
    transition: 'all 0.3s ease-in-out',
  });

  return (
    <>
      <div className="progress" style={{ height: '7px', marginTop: '5px' }}>
        <div className="progress-bar" style={changePasswordColor()}></div>
      </div>
      {password && (
        <p style={{ color: funcProgressColor(), textAlign: 'right', fontSize: '0.8rem' }}>
          {createPasswordLabel(testResult)}
        </p>
      )}
    </>
  );
};
