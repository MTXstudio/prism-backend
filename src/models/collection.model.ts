import { Table, Model, Column, ForeignKey } from 'sequelize-typescript';
import Project from './project.model';

@Table({
	// freezeTableName: true, // Enforcing the table name to be equal to the model name
	// tableName: 'users', //define custom table name
	timestamps: false, // By default, Sequelize automatically adds the fields createdAt and updatedAt
})
export default class Collection extends Model {
	@ForeignKey(() => Project)
	@Column
	projectId: number;

	@Column
	name: string;

	@Column
	royalties: number;

	@Column
	maxInvocation: number;

	@Column
	manager: string;

	@Column
	assetType: number;

	@Column
	paused: boolean;
}
