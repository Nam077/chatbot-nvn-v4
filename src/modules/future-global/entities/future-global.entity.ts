import { Entity, PrimaryGeneratedColumn, Column, Index, UpdateDateColumn, CreateDateColumn } from 'typeorm';

@Entity('future_global')
export class FutureGlobal {
    @PrimaryGeneratedColumn({
        type: 'integer',
        name: 'id',
        comment: 'Id of the future global table',
    })
    id: number;

    @Index({ unique: true })
    @Column('varchar', {
        name: 'Sender psid',
        nullable: true,
        comment: 'Sender psid',
    })
    senderPsid: string;

    @Column({
        name: 'Status',
        nullable: true,
        comment: 'Status of the future global table',
        type: 'boolean',
        default: false,
    })
    status: boolean;

    @CreateDateColumn({
        name: 'created_at',
        type: 'datetime',
        nullable: false,
        comment: 'Future global created at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        nullable: false,
        type: 'datetime',
        comment: 'Future global updated at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
}
