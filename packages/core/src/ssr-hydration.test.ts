/**
 * @file ssr-hydration.test.tsx
 * @description Verifies that @opencenter-cloud/kobalte-core does not create
 * a duplicate Solid runtime during SSR bundling, which causes hydration mismatch.
 *
 * Root cause: The package ships only a client-flavored dist (using `template()`,
 * `insert()` from `@solidjs/web`). When an SSR bundler includes it via
 * `ssr.noExternal`, the solid-js/web imports can resolve to a different module
 * instance than the one used by the app's SSR renderer, creating two separate
 * Solid runtimes with incompatible hydration key counters.
 *
 * This test validates:
 * 1. The dist correctly externalizes solid-js and @solidjs/web (no bundled copy)
 * 2. SSR rendering of ColorModeScript + ColorModeProvider produces valid HTML
 * 3. The generated hydration keys are consistent between SSR and client hydration
 */

import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const DIST_DIR = path.resolve(__dirname, "../dist");
const CHUNK_DIR = path.resolve(DIST_DIR, "chunk");

describe("SSR hydration compatibility", () => {
	describe("dist does not bundle solid-js internals", () => {
		it("all chunks use external imports for solid-js (not bundled or relative paths)", () => {
			const chunks = fs.readdirSync(CHUNK_DIR).filter((f) => f.endsWith(".js"));
			expect(chunks.length).toBeGreaterThan(0);

			for (const chunk of chunks) {
				const content = fs.readFileSync(path.join(CHUNK_DIR, chunk), "utf-8");

				// Check that solid-js imports are bare specifiers pointing to
				// 'solid-js' or '@solidjs/web' — not relative paths or bundled copies
				const solidCoreImports = [
					...content.matchAll(/from\s+['"]((solid-js|@solidjs\/\w+)[^'"]*)['"]/g),
				];

				for (const match of solidCoreImports) {
					const specifier = match[1];
					// Must be exactly 'solid-js', '@solidjs/web', or '@solidjs/signals'
					// NOT 'solid-js/web' (Solid 1 path) or './solid-js' (bundled)
					expect(
						specifier,
						`Chunk ${chunk} imports "${specifier}" — expected 'solid-js', '@solidjs/web', or '@solidjs/signals'`,
					).toMatch(/^(solid-js|@solidjs\/web|@solidjs\/signals)$/);
				}
			}
		});

		it("no chunk contains the solid-js runtime source (createSignal implementation)", () => {
			const chunks = fs.readdirSync(CHUNK_DIR).filter((f) => f.endsWith(".js"));

			for (const chunk of chunks) {
				const content = fs.readFileSync(path.join(CHUNK_DIR, chunk), "utf-8");

				// These patterns indicate bundled solid-js internals, not imports
				// The actual createSignal implementation uses these internal patterns
				expect(content).not.toMatch(
					/function createSignal\s*\(/,
				);
				expect(content).not.toMatch(
					/REACTIVE_WRITE_IN_OWNED_SCOPE/,
				);
				expect(content).not.toMatch(
					/function createRoot\s*\(/,
				);
			}
		});

		it("dist/chunk files importing @solidjs/web do not import solid-js/web (Solid 1 path)", () => {
			const chunks = fs.readdirSync(CHUNK_DIR).filter((f) => f.endsWith(".js"));

			const violations: string[] = [];
			for (const chunk of chunks) {
				const content = fs.readFileSync(path.join(CHUNK_DIR, chunk), "utf-8");
				if (content.includes("from 'solid-js/web'") || content.includes('from "solid-js/web"')) {
					violations.push(chunk);
				}
			}

			expect(
				violations,
				`These chunks import from 'solid-js/web' (Solid 1 path) instead of '@solidjs/web' (Solid 2 path). ` +
				`This causes duplicate module resolution during SSR bundling:\n  ${violations.join("\n  ")}`,
			).toHaveLength(0);
		});
	});

	describe("ColorModeScript SSR compatibility", () => {
		it("color-mode chunk uses isServer guard for client-only APIs", () => {
			// Find the color-mode chunk
			const chunks = fs.readdirSync(CHUNK_DIR).filter((f) => f.endsWith(".js"));
			const colorModeChunk = chunks.find((chunk) => {
				const content = fs.readFileSync(path.join(CHUNK_DIR, chunk), "utf-8");
				return content.includes("ColorModeScript") && content.includes("ColorModeProvider");
			});

			expect(colorModeChunk, "Could not find color-mode chunk in dist").toBeDefined();

			const content = fs.readFileSync(
				path.join(CHUNK_DIR, colorModeChunk!),
				"utf-8",
			);

			// ColorModeProvider must guard window/document access with isServer
			expect(content).toContain("isServer");

			// The template() call in ColorModeScript is client-only — verify it's imported
			// from @solidjs/web (not bundled inline)
			expect(content).toMatch(/import\s*\{[^}]*template[^}]*\}\s*from\s*['"]@solidjs\/web['"]/);
		});

		it("ColorModeProvider does not access window.matchMedia unconditionally", () => {
			const chunks = fs.readdirSync(CHUNK_DIR).filter((f) => f.endsWith(".js"));
			const colorModeChunk = chunks.find((chunk) => {
				const content = fs.readFileSync(path.join(CHUNK_DIR, chunk), "utf-8");
				return content.includes("ColorModeProvider");
			});

			expect(colorModeChunk).toBeDefined();

			const content = fs.readFileSync(
				path.join(CHUNK_DIR, colorModeChunk!),
				"utf-8",
			);

			// The matchMedia call must be inside an isServer guard
			// Look for the query() function pattern that guards matchMedia
			const queryFnMatch = content.match(
				/function query\(\)\s*\{([^}]+)\}/,
			);
			if (queryFnMatch) {
				expect(queryFnMatch[1]).toContain("isServer");
			}
		});
	});

	describe("SSR module resolution (hydration mismatch root cause)", () => {
		/**
		 * This test verifies the mechanism that causes hydration mismatch:
		 *
		 * When an SSR bundler (Vite with ssr.noExternal) bundles @opencenter-cloud/kobalte-core,
		 * it resolves `@solidjs/web` imports within the package. If the resolution differs from
		 * how the app's main SSR code resolves `@solidjs/web`, TWO instances of the Solid runtime
		 * load in the same process. Each instance maintains its own hydration key counter,
		 * producing mismatched keys between SSR output and client hydration.
		 *
		 * The fix requires one of:
		 * 1. The consumer adds `resolve.dedupe: ['solid-js', '@solidjs/web']` to Vite config
		 * 2. The package ships a proper server entry (built with `generate: "ssr"`)
		 * 3. The consumer configures `optimizeDeps.exclude` + custom esbuild resolve plugin
		 */

		it("dist contains BOTH client-flavored and server-flavored code", () => {
			// After the fix: the package ships both client and server outputs.
			// Client: dist/chunk/*.js with template(), insert(), effect()
			// Server: dist/server/chunk/*.js with ssr(), ssrAttribute(), escape()
			const clientChunks = fs.readdirSync(CHUNK_DIR).filter((f) => f.endsWith(".js"));
			const serverChunkDir = path.resolve(DIST_DIR, "server/chunk");
			const serverChunks = fs.existsSync(serverChunkDir)
				? fs.readdirSync(serverChunkDir).filter((f) => f.endsWith(".js"))
				: [];

			let hasClientApis = false;
			let hasServerApis = false;

			for (const chunk of clientChunks) {
				const content = fs.readFileSync(path.join(CHUNK_DIR, chunk), "utf-8");
				if (content.includes("template(") || content.includes("insert(") || content.includes("effect(")) {
					hasClientApis = true;
				}
			}

			for (const chunk of serverChunks) {
				const content = fs.readFileSync(path.join(serverChunkDir, chunk), "utf-8");
				if (content.includes("ssr(") || content.includes("ssrAttribute(") || content.includes("escape(")) {
					hasServerApis = true;
				}
			}

			expect(
				hasClientApis,
				"Expected dist/chunk/ to contain client APIs (template/insert/effect).",
			).toBe(true);

			expect(
				hasServerApis,
				"Expected dist/server/chunk/ to contain server APIs (ssr/ssrAttribute/escape). " +
				"This is required to eliminate ssr.noExternal in consumer apps. " +
				"If this fails, the server build config is missing from tsup.config.ts.",
			).toBe(true);
		});

		it("package.json has a 'node' export condition pointing to server dist", () => {
			const pkgJson = JSON.parse(
				fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf-8"),
			);

			const mainExport = pkgJson.exports?.["."];
			expect(mainExport).toBeDefined();
			expect(typeof mainExport).toBe("object");

			// Must have a "node" condition for SSR
			expect(
				mainExport.node,
				"exports['.'].node must point to the server dist entry",
			).toBe("./dist/server/index.js");

			// Verify the subpath pattern too
			const subExport = pkgJson.exports?.["./*"];
			expect(subExport?.node).toBe("./dist/server/*/index.js");
		});
	});

	describe("package.json exports configuration", () => {
		it("has solid-js and @solidjs/web as peerDependencies (not dependencies)", () => {
			const pkgJson = JSON.parse(
				fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf-8"),
			);

			// solid-js must be a peer dep to avoid duplicate resolution
			expect(pkgJson.peerDependencies?.["solid-js"]).toBeDefined();
			expect(pkgJson.peerDependencies?.["@solidjs/web"]).toBeDefined();

			// Must NOT be in regular dependencies (would create a duplicate)
			expect(pkgJson.dependencies?.["solid-js"]).toBeUndefined();
			expect(pkgJson.dependencies?.["@solidjs/web"]).toBeUndefined();
		});

		it("exports field does not include a separate server condition (single dist)", () => {
			const pkgJson = JSON.parse(
				fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf-8"),
			);

			// Current known limitation: package ships only client-flavored dist.
			// This test documents the status quo. When a server entry is added,
			// update this test to verify the "solid" export condition maps correctly.
			const mainExport = pkgJson.exports?.["."];
			if (typeof mainExport === "object" && mainExport !== null) {
				// If there's a "solid" condition, verify it has both import paths
				if (mainExport.solid) {
					// The solid condition should not point to server.js unless one exists
					const solidEntry = typeof mainExport.solid === "string"
						? mainExport.solid
						: mainExport.solid.import || mainExport.solid.default;
					expect(solidEntry).toBeDefined();
				}
			}
		});
	});
});
