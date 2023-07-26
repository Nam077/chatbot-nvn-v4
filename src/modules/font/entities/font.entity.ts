import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Key } from '../../key/entities/key.entity';
import { Link } from '../../link/entities/link.entity';
import { Message } from '../../message/entities/message.entity';
import { Image } from '../../image/entities/image.entity';
import { Tag } from '../../tag/entities/tag.entity';

export enum FontStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

@Entity({ name: 'fonts' })
export class Font {
    @PrimaryGeneratedColumn({
        name: 'id',
        type: 'int',
        unsigned: true,
        comment: 'Font id',
    })
    id: number;

    @Column({
        name: 'name',
        type: 'varchar',
        length: 255,
        nullable: false,
        comment: 'Font name',
    })
    name: string;

    @Column({
        name: 'url_post',
        type: 'varchar',
        length: 255,
        nullable: false,
        comment: 'Font url post',
    })
    urlPost: string;
    @Index({
        unique: true,
    })
    @Column({
        name: 'slug',
        type: 'varchar',
        length: 255,
        nullable: false,
        comment: 'Font slug',
    })
    slug: string;

    @Column({
        name: 'status',
        type: 'varchar',
        enum: [FontStatus.ACTIVE, FontStatus.INACTIVE],
        nullable: false,
        default: 'active',
        comment: 'Font status',
    })
    status: FontStatus;

    @Column({
        name: 'description',
        type: 'varchar',
        length: 255,
        nullable: false,
        comment: 'Font description',
    })
    description: string;

    @CreateDateColumn({
        name: 'created_at',
        type: 'datetime',
        nullable: false,
        comment: 'Font created at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        nullable: false,
        type: 'datetime',
        comment: 'Font updated at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;

    @OneToMany(() => Key, (key) => key.font, {
        onDelete: 'CASCADE',
    })
    keys: Key[];

    @ManyToMany(() => Link, (link) => link.fonts)
    @JoinTable({
        name: 'font_link',
        joinColumn: {
            name: 'font_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'link_id',
            referencedColumnName: 'id',
        },
    })
    links: Link[];

    @ManyToMany(() => Message, (message) => message.fonts)
    @JoinTable({
        name: 'font_message',
        joinColumn: {
            name: 'font_id',
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
        name: 'font_image',
        joinColumn: {
            name: 'font_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'image_id',
            referencedColumnName: 'id',
        },
    })
    images: Image[];

    @ManyToMany(() => Tag, (tag) => tag.fonts)
    @JoinTable({
        name: 'font_tag',
        joinColumn: {
            name: 'font_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'tag_id',
            referencedColumnName: 'id',
        },
    })
    tags: Tag[];
}
