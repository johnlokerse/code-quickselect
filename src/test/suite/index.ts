import * as path from 'path';
import * as Mocha from 'mocha';
import { glob } from 'glob';

export function run(): Promise<void> {
  return new Promise((resolve, reject) => {
    const mocha = new Mocha({
      ui: 'tdd',
      color: true
    });

    const testsRoot = path.resolve(__dirname, '.');

    glob('**/*.test.js', { cwd: testsRoot })
      .then((files) => {
        for (const file of files) {
          mocha.addFile(path.resolve(testsRoot, file));
        }

        try {
          mocha.run((failures) => {
            if (failures > 0) {
              reject(new Error(`${failures} tests failed.`));
            } else {
              resolve();
            }
          });
        } catch (error) {
          reject(error);
        }
      })
      .catch(reject);
  });
}
