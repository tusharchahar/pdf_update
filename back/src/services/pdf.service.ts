import { Injectable, StreamableFile } from '@nestjs/common';
import { createReadStream, readFile, writeFileSync } from 'fs';
import { join } from 'path';
import UpdateDto from 'src/dtos/update.dto';
import {func} from '../../../core/pdfform';

@Injectable()
export class PdfService {
    async getPdf(): Promise<StreamableFile>{
        const file = createReadStream(join(process.cwd(), 'src/database/example.pdf'));
        return new StreamableFile(file);
    }

    async updatePdf(changes: UpdateDto): Promise<void>{
            readFile(join(process.cwd(), 'src/database/example.pdf'),(err,data)=>{
                //update pdf buffer array
                let filled_pdf = func(data,changes);
                //store new buffer array to pdf
                writeFileSync(join(process.cwd(), 'src/database/example.pdf'),filled_pdf);    
            })
    }
}