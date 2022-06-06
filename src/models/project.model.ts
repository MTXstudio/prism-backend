import { Table, Model, Column, DataType } from 'sequelize-typescript';

interface IProject {
	id: number;
	name: string;
	owner: string;
	traitTypes: string[];
	description?: string;
	externalUrl?: string;
}

@Table({
	// freezeTableName: true, // Enforcing the table name to be equal to the model name
	// tableName: 'users', //define custom table name
	timestamps: false, // By default, Sequelize automatically adds the fields createdAt and updatedAt
})
export class Project extends Model<IProject> {
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
}
