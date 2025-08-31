import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsString, IsEmail, IsInt, Min } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  name: string;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  @IsInt()
  @Min(0)
  age: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}