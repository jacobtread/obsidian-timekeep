import moment from "moment";

export const currentTime = moment();

export const entry = {
	id: "9054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Part 1",
	startTime: null,
	endTime: null,
	subEntries: [
		{
			id: "d7afcb74-a6f2-4cb7-80ed-48a2f71aa7a6",
			name: "Part 1",
			startTime: currentTime.add(1, "hours"),
			endTime: currentTime.add(1, "hours"),
			subEntries: null,
		},
		{
			id: "da783535-08d3-4f65-97f3-e331273da934",
			name: "Part 1",
			startTime: currentTime,
			endTime: currentTime,
			subEntries: null,
		},
		{
			id: "5c305879-61ba-4bc9-8373-568948abf27f",
			name: "Part 1",
			startTime: null,
			endTime: null,
			subEntries: null,
		},
		{
			id: "8d491c4c-2441-4f87-bd29-4758b8108500",
			name: "Part 1",
			startTime: currentTime.add(2, "hours"),
			endTime: currentTime.add(2, "hours"),
			subEntries: null,
		},
	],
};

export const output = currentTime;
