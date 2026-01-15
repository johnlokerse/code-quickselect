import * as path from "path";
import Mocha from "mocha";
import glob from "glob";

export function run(): Promise<void> {
	return new Promise((resolve, reject) => {
		const mocha = new Mocha({
			ui: "tdd",
			color: true,
		});

		const testsRoot = path.resolve(__dirname, ".");

		glob(
			"**/*.test.js",
			{ cwd: testsRoot },
			(error: Error | null, files: string[]) => {
				if (error) {
					reject(error);
					return;
				}

				for (const file of files) {
					mocha.addFile(path.resolve(testsRoot, file));
				}

				try {
					mocha.run((failures: number) => {
						if (failures > 0) {
							reject(new Error(`${failures} tests failed.`));
						} else {
							resolve();
						}
					});
				} catch (runError) {
					reject(runError);
				}
			}
		);
	});
}
