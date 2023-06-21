import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Font } from '../../font/entities/font.entity';

@Entity({ name: 'tags', synchronize: true, orderBy: { id: 'ASC' } })
export class Tag {
    @PrimaryGeneratedColumn({ comment: 'Id of the tag' })
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false, comment: 'Name of the tag' })
    name: string;

    @ManyToMany(() => Font, (font) => font.tags, { onDelete: 'CASCADE', cascade: true })
    fonts: Font[];
}
