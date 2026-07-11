export class CreateProductoDto {
    nombre: string;
    precio: number;
    descripcion?: string;
    disponible?: boolean;
    id_categoria: number;
    // imagePath se maneja por multer, no va en el DTO directamente
}
