import ImageUpload from "@/components/ui/image-upload";

interface Props {
  images: string[];
  disabled: boolean;
  onAdd: (url: string) => void;
  onRemove: (url: string) => void;
}

export default function ImagesSection({ images, disabled, onAdd, onRemove }: Props) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-bold text-[#154734] border-l-4 border-[#C19A6B] pl-3 uppercase tracking-wide">
        Imágenes Generales
      </h3>
      <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
        <ImageUpload
          value={images}
          disabled={disabled}
          onChange={onAdd}
          onRemove={onRemove}
          maxImages={5}
        />
      </div>
    </section>
  );
}
