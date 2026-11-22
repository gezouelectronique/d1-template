// Mini-convertisseur markdown -> HTML, suffisant pour nos contenus (titres, listes, citations, gras, liens).

export function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function inline(text: string): string {
	return escapeHtml(text)
		.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
		.replace(/\*(.+?)\*/g, "<em>$1</em>")
		.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

export function markdownToHtml(md: string): string {
	const lines = md.trim().split("\n");
	const out: string[] = [];
	let list: "ul" | "ol" | null = null;
	let para: string[] = [];

	const flushPara = () => {
		if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`);
		para = [];
	};
	const closeList = () => {
		if (list) out.push(`</${list}>`);
		list = null;
	};

	for (const raw of lines) {
		const line = raw.trim();
		let m: RegExpMatchArray | null;
		if (!line) {
			flushPara();
			closeList();
		} else if ((m = line.match(/^(#{1,3})\s+(.*)$/))) {
			flushPara();
			closeList();
			const level = m[1].length;
			out.push(`<h${level}>${inline(m[2])}</h${level}>`);
		} else if (line === "---") {
			flushPara();
			closeList();
			out.push("<hr>");
		} else if (line.startsWith("> ")) {
			flushPara();
			closeList();
			out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
		} else if ((m = line.match(/^[-*]\s+(?:\[ \]\s+)?(.*)$/))) {
			flushPara();
			if (list !== "ul") {
				closeList();
				out.push(line.includes("[ ]") ? '<ul class="checklist">' : "<ul>");
				list = "ul";
			}
			out.push(`<li>${inline(m[1])}</li>`);
		} else if ((m = line.match(/^\d+\.\s+(.*)$/))) {
			flushPara();
			if (list !== "ol") {
				closeList();
				out.push("<ol>");
				list = "ol";
			}
			out.push(`<li>${inline(m[1])}</li>`);
		} else {
			closeList();
			para.push(line);
		}
	}
	flushPara();
	closeList();
	return out.join("\n");
}
