import { solidPlugin } from "esbuild-plugin-solid";
/**
 * Adapted from https://github.com/corvudev/corvu/blob/b1f36db096867a88ef5b62bec1e46cc0c8e09089/packages/corvu/tsup.config.ts
 *
 * Three build configs:
 * 1. Client (generate: "dom") → dist/*.js — pre-compiled client code
 * 2. SSR (generate: "ssr") → dist/server/*.js — pre-compiled server code
 * 3. JSX (preserved) → dist/*.jsx — for bundlers with "solid" condition (re-compiled by consumer's vite-plugin-solid)
 */
import { defineConfig, type Options } from "tsup";

const ENTRY = ["src/index.tsx", "src/*/index.tsx", "src/primitives/*/index.ts"];

function generateClientConfig(): Options {
	return {
		target: "esnext",
		platform: "browser",
		format: "esm",
		clean: true,
		dts: true,
		entry: ENTRY,
		outDir: "dist/",
		treeshake: { preset: "smallest" },
		replaceNodeEnv: true,
		esbuildOptions(options) {
			options.chunkNames = "[name]/[hash]";
			options.drop = ["console", "debugger"];
		},
		// @ts-expect-error esbuildPlugins type mismatch
		esbuildPlugins: [solidPlugin({ solid: { generate: "dom" } })],
	};
}

function generateServerConfig(): Options {
	return {
		target: "esnext",
		platform: "node",
		format: "esm",
		clean: false, // Don't clean — client build already ran
		dts: false, // Types are shared from client build
		entry: ENTRY,
		outDir: "dist/server/",
		treeshake: { preset: "smallest" },
		replaceNodeEnv: true,
		esbuildOptions(options) {
			options.chunkNames = "[name]/[hash]";
			options.drop = ["console", "debugger"];
		},
		// @ts-expect-error esbuildPlugins type mismatch
		esbuildPlugins: [solidPlugin({ solid: { generate: "ssr" } })],
	};
}

function generateJsxConfig(): Options {
	return {
		target: "esnext",
		platform: "browser",
		format: "esm",
		clean: false, // Don't clean — previous builds already ran
		dts: false, // Types are shared from client build
		entry: ENTRY,
		outDir: "dist/",
		treeshake: { preset: "smallest" },
		replaceNodeEnv: true,
		esbuildOptions(options) {
			options.jsx = "preserve";
			options.chunkNames = "[name]/[hash]";
			options.drop = ["console", "debugger"];
		},
		outExtension() {
			return { js: ".jsx" };
		},
		esbuildPlugins: [],
	};
}

export default defineConfig([
	generateClientConfig(),
	generateServerConfig(),
	generateJsxConfig(),
]);
