import { Body, Controller,Get, Header, Post, StreamableFile } from '@nestjs/common';
import UpdateDto from 'src/dtos/update.dto';
import { PdfService } from 'src/services/pdf.service';

@Controller('pdf')
export class PdfController {
    constructor(private readonly pdfService: PdfService) {}

    @Get()
    @Header('Content-Type', 'application/pdf')
    @Header('Content-Disposition', 'attachment; filename="example.pdf"')
    async getPdf(): Promise<StreamableFile>{
        return this.pdfService.getPdf();
    }

    @Post()
    async updatePdf(@Body() changes: UpdateDto): Promise<string>{
        await this.pdfService.updatePdf(changes);
        return 'success';
    }
}
