import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    ManyToOne,
} from 'typeorm';
import { Font } from '../../font/entities/font.entity';
import { Response } from '../../response/entities/response.entity';

@Entity({ name: 'keys' })
export class Key {
    @PrimaryGeneratedColumn({
        name: 'id',
        type: 'int',
        unsigned: true,
        comment: 'Key id',
    })
    id: number;

    @Column({
        name: 'name',
        type: 'varchar',
        length: 255,
        nullable: false,
        comment: 'Key name',
    })
    name: string;

    @Column({
        name: 'value',
    })
    @Column({
        name: 'value',
        type: 'varchar',
        length: 255,
        nullable: false,
        comment: 'Key value',
    })
    value: string;

    @CreateDateColumn({
        name: 'created_at',
        type: 'datetime',
        nullable: false,
        comment: 'Key created at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'datetime',
        nullable: false,
        comment: 'Key updated at',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;

    @ManyToOne(() => Font, (font) => font.keys, { nullable: true, onDelete: 'CASCADE', cascade: true })
    @JoinColumn({
        name: 'font_id',
        referencedColumnName: 'id',
    })
    font: Font;

    @ManyToOne(() => Response, (response) => response.keys, { nullable: true, onDelete: 'CASCADE', cascade: true })
    @JoinColumn({
        name: 'response_id',
        referencedColumnName: 'id',
    })
    response: Response;
}
