
import { User } from "../entity/User";
//import { AzureTranslator } from "./AzureTranslator";
import { GCPTranslator } from "./GCPTranslator";
import { NullTranslator } from "./NullTranslator";

/** Get correct translator according to configuration */
export function getTranslator(u: User) {

	switch(u.config.translateService) {

		/*
		case 'azure':
			return new AzureTranslator(u);
		*/
		case 'gcp':
			return new GCPTranslator(u);

		default:
			return new NullTranslator(u);
	}

}