import { Entity, ManyToMany, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Font } from '../../font/entities/font.entity';
import { Response } from '../../response/entities/response.entity';
@Entity({ name: 'images' })
export class Image {
    @PrimaryGeneratedColumn({
        name: 'id',
        type: 'int',
        unsigned: true,
        comment: 'Image id',
    })
    id: number;

    @Column({
        name: 'url',
        type: 'varchar',
        length: 255,
        nullable: false,
        comment: 'Image url',
    })
    url: string;

    @CreateDateColumn({
        name: 'created_at',
        type: 'datetime',
        nullable: false,
        comment: 'Image created at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'datetime',
        nullable: false,
        comment: 'Image updated at',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;

    @ManyToMany(() => Font, (font) => font.images)
    fonts: Font[];

    @ManyToMany(() => Response, (response) => response.images)
    responses: Response[];
}
