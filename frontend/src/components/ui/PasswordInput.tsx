import { useState } from 'react';
import { TextField, IconButton, InputAdornment, type TextFieldProps } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface PasswordInputProps extends Omit<TextFieldProps, 'type'> {
  showStrength?: boolean;
}

const getStrength = (password: string): { level: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: score, label: 'Fraca', color: '#d32f2f' };
  if (score === 2) return { level: score, label: 'Média', color: '#ed6c02' };
  if (score === 3) return { level: score, label: 'Boa', color: '#2e7d32' };
  return { level: score, label: 'Forte', color: '#1976d2' };
};

export const PasswordInput = ({ showStrength = false, value, ...props }: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);
  const strength = showStrength && typeof value === 'string' && value.length > 0
    ? getStrength(value)
    : null;

  return (
    <>
      <TextField
        {...props}
        value={value}
        type={visible ? 'text' : 'password'}
        slotProps={{
          ...props.slotProps,
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="alternar visibilidade da senha"
                  onClick={() => setVisible((v) => !v)}
                  edge="end"
                  size="small"
                  tabIndex={-1}
                >
                  {visible ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
          inputLabel: { shrink: true },
        }}
      />
      {strength && (
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: i <= strength.level ? strength.color : '#e0e0e0',
                transition: 'background-color 0.3s',
              }}
            />
          ))}
          <span style={{ fontSize: 11, color: strength.color, marginLeft: 8, whiteSpace: 'nowrap' }}>
            {strength.label}
          </span>
        </div>
      )}
    </>
  );
};
