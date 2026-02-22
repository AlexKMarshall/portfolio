/// <reference path="./.astro/types.d.ts" />

declare global {
	namespace App {
		interface Locals {
			postId?: string;
		}
	}
}

export {};
