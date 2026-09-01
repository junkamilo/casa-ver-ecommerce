"use client";

import Image from "next/image";
import { ImageIcon, Loader2, PlayCircle } from "lucide-react";
import AdminDataTable, {
  type AdminDataTableColumn,
} from "@/components/ui/AdminDataTable";
import { DeleteIcon, EditIcon } from "@/components/icons";
import type { HeroSlideData } from "../types";

type HeroSlidesTableProps = {
  slides: HeroSlideData[];
  actionId: string | null;
  onEdit: (slide: HeroSlideData) => void;
  onDelete: (slide: HeroSlideData) => void;
  onToggleActive: (slide: HeroSlideData) => void;
};

function MediaThumb({ slide }: { slide: HeroSlideData }) {
  const isVideo = slide.mediaType === "video";
  return (
    <div className="w-14 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden relative shrink-0 flex items-center justify-center">
      {slide.mediaUrl && !isVideo ? (
        <Image
          src={slide.mediaUrl}
          alt={slide.headline ?? `Slide ${slide.position}`}
          fill
          className="object-cover"
          sizes="56px"
        />
      ) : isVideo ? (
        <PlayCircle className="w-5 h-5 text-gray-400" />
      ) : (
        <ImageIcon className="w-4 h-4 text-gray-300" />
      )}
    </div>
  );
}

function ActiveSwitch({
  active,
  disabled,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={active ? "Desactivar" : "Activar"}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
        active ? "bg-[#154734]" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          active ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function HeroSlidesTable({
  slides,
  actionId,
  onEdit,
  onDelete,
  onToggleActive,
}: HeroSlidesTableProps) {
  const columns: AdminDataTableColumn<HeroSlideData>[] = [
    {
      key: "preview",
      header: "Preview",
      render: (row) => <MediaThumb slide={row} />,
    },
    {
      key: "slide",
      header: "Slide",
      render: (row) => (
        <div>
          <p className="text-sm font-semibold text-gray-900">Slide {row.position}</p>
          <p className="text-xs text-gray-500 truncate max-w-56">
            {row.headline?.trim() || "Sin título"}
          </p>
        </div>
      ),
    },
    {
      key: "tipo",
      header: "Tipo",
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
          {row.mediaType === "video" ? "Video" : "Imagen"}
        </span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      render: (row) => (
        <div className="flex items-center gap-2">
          <ActiveSwitch
            active={row.isActive}
            disabled={actionId === row.id}
            onClick={() => onToggleActive(row)}
          />
          <span className="text-xs text-gray-500">
            {row.isActive ? "Activo" : "Inactivo"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(row)}
            className="group p-0.5 bg-gray-50 rounded-lg"
            title="Editar slide"
          >
            <EditIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(row)}
            disabled={actionId === row.id}
            className="group p-0.5 bg-gray-50 rounded-lg disabled:opacity-40"
            title="Eliminar slide"
          >
            {actionId === row.id ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : (
              <DeleteIcon size={16} />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminDataTable
      columns={columns}
      data={slides}
      rowKey={(row) => row.id}
      emptyState={{
        title: "No hay slides todavía",
        description: "Agrega el primer banner del carrusel de inicio.",
        icon: <ImageIcon className="w-6 h-6 text-[#154734]" />,
      }}
      mobileRender={(row) => (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <MediaThumb slide={row} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">
                Slide {row.position}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {row.headline?.trim() || "Sin título"} ·{" "}
                {row.mediaType === "video" ? "Video" : "Imagen"}
              </p>
            </div>
            <ActiveSwitch
              active={row.isActive}
              disabled={actionId === row.id}
              onClick={() => onToggleActive(row)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onEdit(row)}
              className="group p-0.5 bg-gray-50 rounded-lg"
              title="Editar"
            >
              <EditIcon size={20} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(row)}
              disabled={actionId === row.id}
              className="group p-0.5 bg-gray-50 rounded-lg disabled:opacity-40"
              title="Eliminar"
            >
              <DeleteIcon size={20} />
            </button>
          </div>
        </div>
      )}
    />
  );
}
