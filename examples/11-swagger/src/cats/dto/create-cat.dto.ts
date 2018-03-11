import { IsString, IsInt } from 'class-validator';
import { ApiModelProperty } from '@neskjs/swagger';

export class CreateCatDto {
  @ApiModelProperty({ type: String })
  @IsString()
  readonly name;

  @ApiModelProperty({ type: Number })
  @IsInt()
  readonly age;

  @ApiModelProperty({ type: String })
  @IsString()
  readonly breed;
}
