// hooks/use-confirm-dialog.tsx
import { useState } from "react";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    description: "",
  });
  const [resolver, setResolver] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolver({ resolve });
    });
  };

  const handleConfirm = () => {
    resolver?.resolve(true);
    setIsOpen(false);
    setResolver(null);
  };

  const handleCancel = () => {
    resolver?.resolve(false);
    setIsOpen(false);
    setResolver(null);
  };

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel,
    setIsOpen,
  };
}
