import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
    name: 'users',
})
export class User {
    @PrimaryGeneratedColumn({
        name: 'id',
        comment: 'User ID',
        type: 'integer',
    })
    id: number;

    @Index({
        unique: true,
    })
    @Column({
        name: 'email',
        comment: 'User email',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    email: string;

    @Column({
        name: 'name',
        comment: 'User name',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    name: string;

    @Column({
        name: 'password',
        comment: 'User password',
        type: 'text',
        nullable: false,
    })
    password: string;

    @Column({
        name: 'role',
        comment: 'User role',
        type: 'varchar',
        length: 255,
        enum: ['admin', 'user'],
        default: 'user',
    })
    role: string;
}
