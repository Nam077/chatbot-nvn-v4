import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, ManyToMany } from 'typeorm';
import { Font } from '../../font/entities/font.entity';
import { Response } from '../../response/entities/response.entity';

@Entity({ name: 'messages' })
export class Message {
    @PrimaryGeneratedColumn({
        name: 'id',
        type: 'int',
        unsigned: true,
        comment: 'Message id',
    })
    id: number;

    @Column({
        name: 'value',
        type: 'text',
        nullable: false,
        comment: 'Message value',
    })
    value: string;

    @CreateDateColumn({
        name: 'created_at',
        type: 'datetime',
        nullable: false,
        comment: 'Message created at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'datetime',
        nullable: false,
        comment: 'Message updated at',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;

    @ManyToMany(() => Font, (font) => font.messages)
    fonts: Font[];
    @ManyToMany(() => Response, (response) => response.messages)
    responses: Response[];
}
