import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { compare } from '../../../utils/hash';

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

    @Column({
        name: 'refresh_token',
        comment: 'User refresh token',
        type: 'text',
        nullable: true,
    })
    refreshToken: string;
    async comparePassword(password: string) {
        return compare(password, this.password);
    }
    isAdmin() {
        return this.role === 'admin';
    }
}
