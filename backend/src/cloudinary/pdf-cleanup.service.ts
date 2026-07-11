import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PdfCleanupService {
  private readonly logger = new Logger(PdfCleanupService.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Ejecuta el primer día de cada mes a las 02:00 AM.
   * Elimina de Cloudinary todos los PDFs de pedidos con más de 30 días de antigüedad.
   */
  @Cron('0 2 1 * *')
  async cleanOldPedidoPdfs() {
    this.logger.log('🧹 Iniciando limpieza mensual de PDFs de pedidos...');

    const thirtyDaysAgo = Math.floor(
      (Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000,
    );

    try {
      // Buscar todos los archivos raw en la carpeta cafeteria_pedidos
      // con más de 30 días de antigüedad
      const result = await cloudinary.search
        .expression(`folder:cafeteria_pedidos AND resource_type:raw AND uploaded_at<${thirtyDaysAgo}`)
        .max_results(100)
        .execute();

      const resources = result?.resources ?? [];

      if (resources.length === 0) {
        this.logger.log('✅ No hay PDFs antiguos para eliminar.');
        return;
      }

      this.logger.log(`🗑️ Eliminando ${resources.length} PDFs antiguos...`);

      // Eliminar en lotes para no saturar la API
      const publicIds = resources.map((r: any) => r.public_id);
      await cloudinary.api.delete_resources(publicIds, { resource_type: 'raw' });

      this.logger.log(`✅ ${publicIds.length} PDFs eliminados correctamente.`);
    } catch (error) {
      this.logger.error('❌ Error durante la limpieza de PDFs:', error);
    }
  }
}
