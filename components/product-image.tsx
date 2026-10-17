type ProductImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  frame: readonly [number, number, number, number];
  fit?: "contain" | "cover";
};

export function ProductImage({ src, alt, width, height, frame, fit = "contain" }: ProductImageProps) {
  return (
    <div className="equipment-frame">
      <svg className="equipment-image" viewBox={frame.join(" ")} width={frame[2]} height={frame[3]} preserveAspectRatio={fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"} role="img" aria-label={alt}>
        <image href={src} width={width} height={height} aria-hidden="true" />
      </svg>
    </div>
  );
}
