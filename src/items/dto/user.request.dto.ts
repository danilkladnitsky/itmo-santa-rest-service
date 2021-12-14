import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserDTO {
  @Expose()
  @ApiProperty({ required: true })
  tg_id: string;

  @Expose()
  @ApiProperty({ required: true })
  isu: string;

  @Expose()
  @ApiProperty({ required: false })
  tg_username?: string;

  @Expose()
  @ApiProperty({ required: false })
  name: string;

  @Expose()
  @ApiProperty({ required: false })
  email: string;

  @Expose()
  @ApiProperty({ required: false })
  bio?: string;

  @Expose()
  @ApiProperty({ required: false })
  progress?: string;
}
