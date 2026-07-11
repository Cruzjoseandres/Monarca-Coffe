export class UpdateProductoDto {
    nombre?: string;
    precio?: number;
    descripcion?: string;
    disponible?: boolean;
    id_categoria?: number;
    imagePaths?: string; // JSON string of existing image URLs to keep
}
