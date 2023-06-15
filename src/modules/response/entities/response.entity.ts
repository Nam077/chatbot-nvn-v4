import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    OneToMany,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { Key } from '../../key/entities/key.entity';
import { Message } from '../../message/entities/message.entity';
import { Image } from '../../image/entities/image.entity';

@Entity({ name: 'responses' })
export class Response {
    @PrimaryGeneratedColumn({
        name: 'id',
        type: 'int',
        unsigned: true,
        comment: 'Response id',
    })
    id: number;

    @Column({
        name: 'name',
        type: 'varchar',
        default: 'Response',
        length: 255,
        nullable: false,
        comment: 'Response name',
    })
    name: string;

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

    @OneToMany(() => Key, (key) => key.response)
    keys: Key[];

    @ManyToMany(() => Message, (message) => message.responses)
    @JoinTable({
        name: 'response_messages',
        joinColumn: {
            name: 'response_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'message_id',
            referencedColumnName: 'id',
        },
    })
    messages: Message[];

    @ManyToMany(() => Image, (image) => image.fonts)
    @JoinTable({
        name: 'response_images',
        joinColumn: {
            name: 'response_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'image_id',
            referencedColumnName: 'id',
        },
    })
    images: Image[];
}
