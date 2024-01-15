import { Module } from '@nestjs/common';
import { PdfController } from '../controllers/pdf.controller';
import { PdfService } from 'src/services/pdf.service';

@Module({
  controllers: [PdfController],
  providers: [PdfService]
})
export class PdfModule {}
