import { AssetType } from '../helpers/enums/asset-type';
import { Table, Model, Column, ForeignKey, DataType } from 'sequelize-typescript';
import { Collection } from './collection.model';

interface IToken {
	id: number;
	collectionId: number;
	name: string;
	maxSupply: number;
	amountMinted: number;
	priceInWei: number;
	traitType: string;
	paused: boolean;
	description: string;
	assetType: AssetType;
	image?: string;
	traitIds?: number[];
}

@Table({
	// freezeTableName: true, // Enforcing the table name to be equal to the model name
	// tableName: 'users', //define custom table name
	timestamps: false, // By default, Sequelize automatically adds the fields createdAt and updatedAt
})
export class Token extends Model<Partial<IToken>> {
	@ForeignKey(() => Collection)
	@Column
	collectionId: number;

	@Column
	name: string;

	@Column
	maxSupply: number;

	@Column
	amountMinted: number;

	@Column
	priceInWei: number;

	@Column
	image: string;

	@Column
	traitType: string;

	@Column
	paused: boolean;

	@Column
	description: string;

	@Column
	assetType: AssetType;

	@Column({
		type: DataType.ARRAY(DataType.STRING),
	})
	traitIds: string[];
}
