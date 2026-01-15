import * as path from "path";
import * as os from "os";
import { runTests } from "vscode-test";

async function main(): Promise<void> {
	try {
		const extensionDevelopmentPath = path.resolve(__dirname, "../../");
		const extensionTestsPath = path.resolve(__dirname, "./suite/index");

		// Use a separate user data directory to allow running tests alongside an open VS Code instance
		const userDataDir = path.join(os.tmpdir(), `vscode-test-${Date.now()}`);

		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: ["--user-data-dir", userDataDir, "--disable-extensions"],
		});
	} catch (error) {
		console.error("Failed to run tests");
		console.error(error);
		process.exit(1);
	}
}

main();
