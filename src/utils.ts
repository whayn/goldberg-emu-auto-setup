import * as fs from 'fs';
import * as path from 'path';
import { SteamApiFile } from './types';
import { execFileSync } from "child_process";


/**
 * Searches for steam_api64.dll and/or steam_api.dll files in the given directory and its subdirectories.
 * @param rootDir The root directory to search in.
 * @returns An object with the paths of the steam_api64.dll and steam_api.dll files, if they exist.
 */
export function findSteamApiFiles(rootDir: string): SteamApiFile {
	let steamApiFiles: SteamApiFile = { steam_api64: undefined, steam_api: undefined };
	const walk = (dir: string) => {
		const files = fs.readdirSync(dir);
		let steamApi64Path: string | undefined;
		let steamApiPath: string | undefined;
		for (const file of files) {
			const filePath = path.join(dir, file);
			const stat = fs.statSync(filePath);
			if (stat.isDirectory()) {
				walk(filePath);
			} else if (file === 'steam_api64.dll') {
				steamApi64Path = filePath;
			} else if (file === 'steam_api.dll') {
				steamApiPath = filePath;
			}
		}
		steamApiFiles = { steam_api64: steamApi64Path, steam_api: steamApiPath };
	};
	walk(rootDir);
	return steamApiFiles;
}

export function lookForFile(dirPath: string, fileName: string): boolean {
	if (!fs.existsSync(dirPath)) {
		throw new Error(`Error: Directory "${dirPath}" does not exist.`)
	}
	if (!fs.statSync(dirPath).isDirectory()) {
		throw new Error(`Error: "${dirPath}" is not a directory.`);
	}

	const filePath = path.join(dirPath, fileName);
	if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
		return true;
	} else {
		return false;
	}
}

export function generateInterfaceFile(dllPath: string): string {
	const generatedDllPath = path.resolve(process.cwd(), "steam_interfaces.txt")
	const generatorPath = path.resolve(__dirname, "../goldberg_files/generate_interfaces_file.exe")

	if (!fs.existsSync(generatorPath)) throw new Error('"generate_interfaces_file.exe" is missing from goldberg_files')

	try {
		execFileSync(generatorPath, [dllPath]);
	} catch (error) {
		throw new Error(`There was an error executing the generator.\nError : ${error || "no error received"}`)
	}


	const dllContent = fs.readFileSync(generatedDllPath).toString()

	return dllContent;
}
/*
// Example usages
const directoryPath = 'C:\\Users\\Mayeulgo\\Downloads\\Arcane Vale for test\\Arcane Vale\\steamapps\\common\\Arcane Vale'
// findSteamAppIdFile
const steamAppIdFilePath = lookForFile(directoryPath, 'steam_appid.txt');
if (steamAppIdFilePath) {
	console.log(`Found steam_appid.txt file`);
} else {
	console.log(`Could not find steam_appid.txt file in "${directoryPath}"`);
}


// findSteamApiFiles
const steamApiFiles = findSteamApiFiles(directoryPath);
console.log(steamApiFiles);
*/