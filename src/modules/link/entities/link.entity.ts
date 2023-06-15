import { Entity, PrimaryGeneratedColumn, ManyToMany, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Font } from '../../font/entities/font.entity';

@Entity({ name: 'links' })
export class Link {
    @PrimaryGeneratedColumn({
        name: 'id',
        type: 'int',
        unsigned: true,
        comment: 'Link id',
    })
    id: number;

    @Column({
        name: 'url',
        type: 'varchar',
        length: 255,
        nullable: false,
        comment: 'Link url',
    })
    url: string;

    @Column({
        name: 'description',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'Link description',
    })
    description: string;

    @CreateDateColumn({
        name: 'created_at',
        type: 'datetime',
        nullable: false,
        comment: 'Link created at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'datetime',
        nullable: false,
        comment: 'Link updated at',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;

    @ManyToMany(() => Font, (font) => font.links)
    fonts: Font[];
}
