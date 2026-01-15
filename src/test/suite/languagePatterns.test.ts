import * as assert from "assert";
import {
	getBicepPatterns,
	getCSharpPatterns,
	getPowerShellPatterns,
} from "../../providers/languagePatterns";

suite("languagePatterns", () => {
	test("Bicep patterns match resource declarations", () => {
		const text =
			"resource myRes 'Microsoft.Storage/storageAccounts@2021-09-01' = {\n}";
		const matches = getBicepPatterns().some((pattern) =>
			new RegExp(pattern.source, pattern.flags).test(text)
		);

		assert.ok(matches);
	});

	test("PowerShell patterns match function declarations", () => {
		const text = "function Get-Example {\n}";
		const matches = getPowerShellPatterns().some((pattern) =>
			new RegExp(pattern.source, pattern.flags).test(text)
		);

		assert.ok(matches);
	});

	test("C# patterns match class, enum, and method declarations", () => {
		const text = `
public class SampleClass
{
    public enum SampleEnum
    {
        One,
        Two
    }

    public async Task<string> GetValueAsync(int id)
    {
        return id.ToString();
    }
}`;
		const patterns = getCSharpPatterns();
		const classMatch = patterns.some((pattern) =>
			new RegExp(pattern.source, pattern.flags).test("public class SampleClass")
		);
		const enumMatch = patterns.some((pattern) =>
			new RegExp(pattern.source, pattern.flags).test("public enum SampleEnum")
		);
		const methodMatch = patterns.some((pattern) =>
			new RegExp(pattern.source, pattern.flags).test(
				"public async Task<string> GetValueAsync(int id)"
			)
		);

		assert.ok(classMatch);
		assert.ok(enumMatch);
		assert.ok(methodMatch);
		assert.ok(
			patterns.some((pattern) =>
				new RegExp(pattern.source, pattern.flags).test(text)
			)
		);
	});
});
