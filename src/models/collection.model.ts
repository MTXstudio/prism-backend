import { Table, Model, Column, ForeignKey } from 'sequelize-typescript';
import { Project } from './project.model';

export interface ICollection {
	id: number;
	projectId: number;
	name: string;
	royalties: string;
	maxInvocation: string;
	manager: string;
	assetType: number;
	paused: boolean;
	description: string;
}

@Table({
	// freezeTableName: true, // Enforcing the table name to be equal to the model name
	// tableName: 'users', //define custom table name
	timestamps: false, // By default, Sequelize automatically adds the fields createdAt and updatedAt
})
export class Collection extends Model<ICollection> {
	@ForeignKey(() => Project)
	@Column
	projectId: number;

	@Column
	name: string;

	@Column
	royalties: string;

	@Column
	maxInvocation: string;

	@Column
	manager: string;

	@Column
	assetType: number;

	@Column
	description: string;

	@Column
	paused: boolean;
}
