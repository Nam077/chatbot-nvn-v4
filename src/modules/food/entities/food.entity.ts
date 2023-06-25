import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'foods', synchronize: true, orderBy: { id: 'ASC' } })
export class Food {
    @PrimaryGeneratedColumn({ comment: 'Id of the food' })
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false, comment: 'Name of the food' })
    name: string;

    @Column({ type: 'text', nullable: false, comment: 'Description of the food' })
    description: string;

    @Column({ type: 'varchar', length: 255, nullable: false, comment: 'Image of the food' })
    image: string;

    @Column({ type: 'text', nullable: false, comment: 'Recipe of the food' })
    recipe: string;
}
