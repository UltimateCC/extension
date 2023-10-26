
import { DataSource } from "typeorm";
import { User } from "./entity/User";


export const dataSource = new DataSource({
	type: "mariadb",
	url: process.env.DB_URL!,
	entities: [User]
});