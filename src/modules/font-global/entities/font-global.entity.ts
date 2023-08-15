import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('fonts')
export class FontGlobal {
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
        name: 'url',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'Font URL',
    })
    url: string;

    @Column({
        name: 'thumbnail',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'Font thumbnail URL',
    })
    thumbnail: string;

    @Column({
        name: 'description',
        type: 'text',
        nullable: true,
        comment: 'Font description',
    })
    description: string;

    @Column({
        name: 'category_name',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'Font category name',
    })
    categoryName: string;

    @Column({
        name: 'download_link',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'Font download link',
    })
    downloadLink: string;

    @Column({
        name: 'detail_images',
        type: 'text',
        nullable: true,
        comment: 'Font detail images',
    })
    detailImages: string;

    @Column({
        name: 'more_link',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'Font more link',
    })
    moreLink: string;

    @Column({
        name: 'file_name',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'Font file name',
    })
    fileName: string;

    @Column({
        name: 'link_drive',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'Font Google Drive link',
    })
    linkDrive: string;

    @Column({
        name: 'slug',
        type: 'varchar',
        length: 255,
        unique: true,
        nullable: true,
        comment: 'Font slug',
    })
    slug: string;
}
