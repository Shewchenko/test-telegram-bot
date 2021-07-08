import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class UpdateMessageDto {
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsArray()
  list: string[];
}
