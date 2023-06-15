import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity({ name: 'font_chunks' })
export class FontChunk {
    @PrimaryGeneratedColumn({
        name: 'id',
        type: 'int',
        unsigned: true,
        comment: 'Font chunk id',
    })
    id: number;

    @Column({
        name: 'value',
        type: 'text',
        nullable: false,
        comment: 'Font chunk value',
    })
    value: string;

    @CreateDateColumn({
        name: 'created_at',
        type: 'datetime',
        nullable: false,
        comment: 'Font chunk created at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'datetime',
        nullable: false,
        comment: 'Font chunk updated at',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
}
