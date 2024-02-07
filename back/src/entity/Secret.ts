import { BaseEntity, Column, CreateDateColumn, Entity, ObjectId, ObjectIdColumn, UpdateDateColumn } from "typeorm";
import Cryptr from "cryptr";
import { environment } from "../environment";
import { z } from "zod";

export const cryptr = new Cryptr(environment.ENCRYPTION_SECRET);

export const SecretType = z.enum(['gcpKey']);
export type SecretType = z.infer<typeof SecretType>;

@Entity()
export class Secret extends BaseEntity {
	@ObjectIdColumn()
	id: ObjectId;

	@Column()
	twitchId: string

	// Properties
	@CreateDateColumn()
	created: Date;

	@UpdateDateColumn()
	updated: Date;

	@Column()
	type: SecretType;

	@Column()
	encrypted: string;

	// Methods
	async setValue(value: string) {
		this.encrypted = cryptr.encrypt(value);
	}

	async getValue() {
		await this.save();
		return cryptr.decrypt(this.encrypted);
	}
}
