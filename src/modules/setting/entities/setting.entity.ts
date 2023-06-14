import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
    name: 'settings',
})
export class Setting {
    @PrimaryGeneratedColumn()
    id: number;

    @Index({ unique: true })
    @Column({
        length: 255,
    })
    key: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    value: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;
}
