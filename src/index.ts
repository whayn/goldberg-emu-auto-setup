import { writeFileSync, copyFileSync, existsSync } from "fs";
import { findSteamApiFiles, lookForFile, generateInterfaceFile } from "./utils";
import get from 'axios'
import * as path from 'path'


const testPath = 'C:\\Users\\Mayeulgo\\Downloads\\Shovel Knight Treasure Trove\\steamapps\\common\\Shovel Knight'

async function main() {
	// Queries
	const steamApifiles = findSteamApiFiles(testPath)
	const isThereAppid = lookForFile(testPath, "steam_appid.txt")
	const isThereInterfaces = lookForFile(testPath, "steam_interfaces.txt")

	// No api error
	if (!steamApifiles.steam_api && !steamApifiles.steam_api64) throw new Error('No "steam_api(64).dll" were found')

	// AppId Generator 
	const steamGetAppsUrl = "https://api.steampowered.com/ISteamApps/GetApp"
	if (!isThereAppid) {
		let steamApps
		try {
			const request = await get(steamGetAppsUrl)
			steamApps = request.data
			writeFileSync("./db_backup.json", JSON.stringify(steamApps))
		} catch {
			steamApps = require(path.resolve(__dirname, '../db_backup.json'))
		}
		if (!steamApps.applist) throw new Error('Steam Api is unreachable, please try again layer')
		const appidPath = path.join(testPath, "steam_appid.txt")
		const AppId: string = steamApps.applist.apps.find((a: any) => a.name == testPath.match(/(?<=\\)[^\\]+(?=\\?$)/)![0]).appid
		writeFileSync(appidPath, "" + AppId)
	}

	// Create interfaces 
	let interface64: string = ""
	let interface32: string = ""
	if (steamApifiles.steam_api64) interface64 = generateInterfaceFile(steamApifiles.steam_api64);
	if (steamApifiles.steam_api) interface32 = generateInterfaceFile(steamApifiles.steam_api);

	writeFileSync(path.join(testPath, "steam_interfaces.txt"), `${interface64}${interface32}`)

	// Move Required Apis
	const apiPath = path.resolve(__dirname, "../goldberg_files/")

	if (!existsSync(path.join(apiPath, "steam_api.dll")) || !existsSync(path.join(apiPath, "steam_api64.dll"))) {
		throw new Error('"steam_api.dll" or "steam_api64.dll" is missing from the goldberg files folder');
	}

	if (steamApifiles.steam_api) {
		copyFileSync(path.join(apiPath, "steam_api.dll"), path.join(testPath, "steam_api.dll"))
	}
	if (steamApifiles.steam_api64) {
		copyFileSync(path.join(apiPath, "steam_api64.dll"), path.join(testPath, "steam_api64.dll"))
	}

}

main()