import { useTheme } from "next-themes";

export const getBackground = () => {
const { theme } = useTheme();
let background;
if (theme === "dark") {
  background =
    "linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)), url('/layered-peaks-dark.svg')";
} else {
  background =
    "linear-gradient(rgba(150,255,255,0.8),rgba(87,199,133,0.8)), url('/layered-peaks-light.svg')";
}
return background;
};
