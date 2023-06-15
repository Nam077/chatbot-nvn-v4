import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({
    name: 'admins',
})
export class Admin {
    @PrimaryGeneratedColumn({
        name: 'id',
        type: 'int',
        unsigned: true, //
        comment: 'Admin id',
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
        comment: 'Admin sender psid',
    })
    senderPsid: string;

    @Column({
        name: 'name',
        type: 'varchar',
        length: 255,
        nullable: false,
        comment: 'Admin name',
        default: '',
    })
    name: string;
    // using sqlite3
    @CreateDateColumn({
        name: 'created_at',
        type: 'datetime',
        nullable: false,
        comment: 'Admin created at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        nullable: false,
        type: 'datetime',
        comment: 'Admin updated at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
}
