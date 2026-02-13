import { Button, CircularProgress, type ButtonProps } from '@mui/material';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

export const LoadingButton = ({
  loading = false,
  disabled,
  children,
  ...props
}: LoadingButtonProps) => {
  return (
    <Button
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
      ) : null}
      {children}
    </Button>
  );
};
