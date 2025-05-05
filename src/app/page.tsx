// page.tsx
import { playfairFont } from "./fonts";
import {Button} from "@/components/ui/button";
import ThemeToggle from "@/components/shared/theme-toggle";

export default function Page() {
  return (
    <div className="p-5">
      <div className="w-100 flex justify-end"><ThemeToggle /></div>
      <h1 className={playfairFont.className}>Welcome to ZureeDiseno</h1>
      <p>This is the homepage of our ecommerce platform.</p>
    <Button>Click Here</Button>
    </div>
  );
}