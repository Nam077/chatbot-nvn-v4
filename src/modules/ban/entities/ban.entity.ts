import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({
    name: 'bans',
})
export class Ban {
    @PrimaryGeneratedColumn({
        name: 'id',
        type: 'int',
        unsigned: true,
        comment: 'Ban id',
    })
    id: number;

    @Index({
        unique: true,
    })
    @Column({
        name: 'sender_psid',
        type: 'varchar',
        length: 255,
        nullable: false,
        comment: 'Ban sender psid',
        default: 'Người dùng bị ban do vi phạm chính sách của trang',
    })
    senderPsid: string;

    @Column({
        name: 'name',
        type: 'varchar',
        length: 255,
        default: '',
        nullable: true,
        comment: 'Ban name',
    })
    name: string;

    @Column({
        name: 'reason',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'Ban reason',
        default: '',
    })
    reason: string;

    @CreateDateColumn({
        name: 'created_at',
        type: 'datetime',
        nullable: false,
        comment: 'Ban created at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        nullable: false,
        type: 'datetime',
        comment: 'Ban updated at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
}
