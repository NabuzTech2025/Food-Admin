type NavigateFn = (path: string, options?: { replace?: boolean }) => void;

let _navigate: NavigateFn | null = null;

export const setNavigate = (fn: NavigateFn) => {
  _navigate = fn;
};

export const navigateTo = (path: string, options?: { replace?: boolean }) => {
  _navigate?.(path, options);
};
