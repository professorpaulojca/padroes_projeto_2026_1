import { Chip, type ChipProps } from '@mui/material';

type StatusVariant = 'active' | 'inactive' | 'admin' | 'user' | 'readonly';

const STATUS_CONFIG: Record<StatusVariant, { label: string; color: ChipProps['color'] }> = {
  active: { label: 'Ativo', color: 'success' },
  inactive: { label: 'Inativo', color: 'error' },
  admin: { label: 'Administrador', color: 'primary' },
  user: { label: 'Usuário', color: 'info' },
  readonly: { label: 'Leitura', color: 'warning' },
};

interface StatusBadgeProps extends Omit<ChipProps, 'color'> {
  status: StatusVariant | string;
}

export const StatusBadge = ({ status, ...props }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status as StatusVariant];

  if (config) {
    return <Chip label={config.label} color={config.color} size="small" variant="outlined" {...props} />;
  }

  return <Chip label={status} size="small" variant="outlined" {...props} />;
};
