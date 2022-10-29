import * as definitions from "./src/definitions/general"
import * as bjoern from "./src/contributors/bjoern"
import {createBjoern} from "./src/contributors/bjoern";
import {createGeneral} from "./src/definitions/general";

createGeneral()
createBjoern()
console.log("Start")