import React, { MouseEvent } from "react";
import { useApp } from "@/contexts/use-app-context";
import {
	NameSegmentLink,
	NameSegmentText,
	NameSegmentType,
	parseNameSegments,
} from "@/utils/name";

type Props = {
	name: string;
};

export default function TimekeepName({ name }: Props) {
	const segments = parseNameSegments(name);

	return (
		<>
			{segments.map((segment, index) => {
				switch (segment.type) {
					case NameSegmentType.Text:
						return (
							<TimekeepNameText key={index} segment={segment} />
						);

					case NameSegmentType.Link:
						return (
							<TimekeepNameLink key={index} segment={segment} />
						);
				}
			})}
		</>
	);
}

function TimekeepNameText({ segment }: { segment: NameSegmentText }) {
	return <span>{segment.text}</span>;
}

function TimekeepNameLink({ segment }: { segment: NameSegmentLink }) {
	const app = useApp();
	const link = segment.url;

	const onOpenLink = (event: MouseEvent) => {
		// Allow default behavior for external links
		if (link.startsWith("http://") || link.startsWith("https://")) {
			return;
		}

		// Prevent the parent collapse toggle click and default behavior
		event.stopPropagation();
		event.preventDefault();

		const activeFile = app.workspace.getActiveFile();
		if (activeFile === null) return;

		// Open internal link
		app.workspace.openLinkText(link, activeFile.path);
	};

	return (
		<a href={link} onClick={onOpenLink}>
			{segment.text}
		</a>
	);
}
