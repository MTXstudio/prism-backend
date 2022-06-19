import { Table, Model, Column, DataType, HasMany } from 'sequelize-typescript';
import { Collection, ICollection } from './collection.model';

interface IProject {
	id: number;
	name: string;
	owner: string;
	traitTypes: string[];
	description?: string;
	externalUrl?: string;
	collections: ICollection[];
}

@Table({
	// freezeTableName: true, // Enforcing the table name to be equal to the model name
	// tableName: 'users', //define custom table name
	timestamps: false, // By default, Sequelize automatically adds the fields createdAt and updatedAt
})
export class Project extends Model<IProject, Partial<IProject>> {
	@Column
	name: string;

	@Column
	owner: string;

	@Column
	description: string;

	@Column({
		type: DataType.ARRAY(DataType.STRING),
	})
	traitTypes: string[];

	@Column
	externalUrl: string;

	@HasMany(() => Collection)
	collections: Collection[];
}
