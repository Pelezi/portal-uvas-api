import { ApiProperty } from '@nestjs/swagger';

export namespace MagazineData {
  export class MagazineUploadInput {
    @ApiProperty({ description: 'Data de início da semana (domingo)', type: 'string', format: 'date' })
    weekStartDate: string;

    @ApiProperty({ type: 'string', format: 'binary', description: 'Arquivo PDF ou Word da revista' })
    file: any;
  }

  export class MagazineListFilterInput {
    @ApiProperty({ required: false, description: 'Limite de registros' })
    limit?: number;

    @ApiProperty({ required: false, description: 'Filtrar por ano' })
    year?: number;
  }

  export class MagazineOutput {
    id: number;
    fileName: string;
    fileUrl: string;
    fileType: string;
    weekStartDate: Date;
    weekEndDate: Date;
    uploadedBy: {
      id: number;
      name: string;
    };
    thumbnailUrl?: string;
    createdAt: Date;
    updatedAt: Date;
  }
}
