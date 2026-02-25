import { StaticImageData } from "next/image";

export interface CartDrawerItem {
  id: string;
  name: string;
  image: string | StaticImageData;
  price: number;
  quantity: number;
  color: string;
  size?: string;
}
