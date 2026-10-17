import { ProductImage } from "@/components/product-image";

const brands = [
  { name: "Aqara", file: "aqara", extension: "png", width: 271, height: 163, frame: [0, 40, 271, 86] as const },
  { name: "Axis Communications", file: "axis", extension: "png", width: 351, height: 127 },
  { name: "Microsoft", file: "microsoft", extension: "png", width: 537, height: 115 },
  { name: "Dahua", file: "dahua", extension: "png", width: 388, height: 117 },
  { name: "UniFi", file: "unifi", extension: "png", width: 323, height: 99 },
  { name: "Hikvision", file: "hikvision", extension: "png", width: 564, height: 76 },
  { name: "Sonos", file: "sonos", extension: "svg", width: 515, height: 107 },
];

export function TechnologyBrands() {
  return <section className="technology-brands wrap" aria-labelledby="technology-brands-title"><h2 id="technology-brands-title">Technology brands</h2><div>{brands.map(brand => brand.frame ? <ProductImage key={brand.file} src={"/images/oem-" + brand.file + "." + brand.extension} width={brand.width} height={brand.height} frame={brand.frame} alt={brand.name} /> : <img key={brand.file} src={"/images/oem-" + brand.file + "." + brand.extension} width={brand.width} height={brand.height} alt={brand.name} loading="lazy" />)}</div></section>;
}
