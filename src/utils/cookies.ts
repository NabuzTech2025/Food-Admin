import Cookies from "js-cookie";

export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};
