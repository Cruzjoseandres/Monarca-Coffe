import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';
import { PdfCleanupService } from './pdf-cleanup.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [CloudinaryService, PdfCleanupService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
