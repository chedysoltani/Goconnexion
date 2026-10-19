import { IsBoolean } from 'class-validator';

export class SetEditorDto {
  @IsBoolean()
  editor!: boolean;
}
