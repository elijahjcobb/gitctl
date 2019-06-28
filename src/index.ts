/**
 *
 * Elijah Cobb
 * elijah@elijahcobb.com
 * https://elijahcobb.com
 *
 *
 * Copyright 2019 Elijah Cobb
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 * OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

import * as Express from "express";
import * as HTTPS from "https";
import * as FileSystem from "fs";
import * as Path from "path";
import { ObjectType, StandardType } from "typit";

function throwError(msg: string): void {

	console.error(msg);
	process.exit(1);

}

type Config = {
	serviceName: string;
	port: number;
	secret: string;
	publicKey: string;
	privateKey: string;
};


const configFilePathRaw: string | undefined = process.argv[2];
if (!configFilePathRaw) throwError("You must supply a file path.");
const configFilePath: string = Path.resolve(configFilePathRaw);
console.log(configFilePath);
if (!FileSystem.existsSync(configFilePath)) throwError("There is no config file at the path provided.");
const fileData: Buffer | undefined = FileSystem.readFileSync(configFilePath);
if (fileData === undefined) throwError("Could not get config file data for the path provided.");
let config: Config | undefined;
try {
	config = JSON.parse(fileData.toString("utf8"));
} catch (e) {
	throwError("Could not decode config file for the path provided.");
}

if (config) {

	new ObjectType({
		serviceName: StandardType.STRING,
		port: StandardType.NUMBER,
		secret: StandardType.STRING,
		publicKey: StandardType.STRING,
		privateKey: StandardType.STRING
	}).checkConformity(config);

	let app: Express.Application = Express();

	let server: HTTPS.Server = new HTTPS.Server({
		key: config.privateKey,
		cert: config.publicKey
	}, app);

	app.get("/", ((req: Express.Request, res: Express.Response): void => {

		console.log(req.headers["X-Hub-Signature"]);

	}));

	server.listen(config.port);


} else throwError("Could not parse config file.");