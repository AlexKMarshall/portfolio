/**
 * Plain-text excerpt from raw markdown: first few sentences or first maxChars.
 * No external markdown parser; best-effort strip of common markdown.
 */
export function excerptFromBody(body: string | undefined, maxChars: number = 280): string {
	if (body === undefined || body.length === 0) return '';
	const plain = body
		.replace(/#{1,6}\s*/g, '')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/\*([^*]+)\*/g, '$1')
		.replace(/_([^_]+)_/g, '$1')
		.replace(/__([^_]+)__/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/\n+/g, ' ')
		.trim();
	if (plain.length <= maxChars) return plain;
	const cut = plain.slice(0, maxChars + 1);
	const lastSpace = cut.lastIndexOf(' ');
	const end = lastSpace > maxChars * 0.7 ? lastSpace : maxChars;
	return cut.slice(0, end).trim() + '…';
}
